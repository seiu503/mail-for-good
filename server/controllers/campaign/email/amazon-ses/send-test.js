const AWS = require('aws-sdk');
const db = require('../../../../models');
const AmazonEmail = require('./lib/amazon');
const { wrapLink, insertUnsubscribeLink, insertTrackingPixel } = require('./lib/analytics');
const mailMerge = require('./lib/mail-merge');

module.exports = (req, res) => {

  let userId = req.user.id;
  let campaign;

  const { testEmail, campaignId } = req.body;

  if(req.body.campaignId == ''){
    campaign = req.body.correctForm;
  }else{
    campaign = {}; // eslint-disable-line
  }

  let amazonSettings = {}; // eslint-disable-line

  const campaignBelongsToUser = new Promise((resolve, reject) => {
    if (req.body.campaignId == '') {
      resolve();
    } else {
        return db.campaign.findOne({
          where: {
            id: campaignId,
            userId
          }
        }).then(campaignInstance => {
          if (!campaignInstance) {
            reject();
            res.status(401).send();
          } else {
            const campaignObject = campaignInstance.get({ plain:true });
            const listId = campaignObject.listId;
            const {
              fromName,
              fromEmail,
              emailSubject,
              emailBody,
              type,
              name,
              trackLinksEnabled,
              trackingPixelEnabled,
              unsubscribeLinkEnabled
            } = campaignObject;

            campaign = {
              listId,
              fromName,
              fromEmail,
              emailSubject,
              emailBody,
              campaignId,
              type,
              name,
              trackLinksEnabled,
              trackingPixelEnabled,
              unsubscribeLinkEnabled
            };

            resolve();
          }
        }).catch(err => {
          reject();
          throw err;
        });
    }
  });

  const getAmazonKeysAndRegion = new Promise((resolve, reject) => {
    return db.setting.findOne({
      where: {
        userId: userId
      }
    }).then(settingInstance => {
      if (!settingInstance) {
        // This should never happen as settings are created on account creation
        reject();
        res.status(500).send();
      } else {
        const settingObject = settingInstance.get({ plain:true });
        const {
          amazonSimpleEmailServiceAccessKey: accessKey,
          amazonSimpleEmailServiceSecretKey: secretKey,
          region,
          whiteLabelUrl
        } = settingObject;
        // If either key is blank, the user needs to set their settings
        if ((accessKey === '' || secretKey === '' || region === '') && process.env.NODE_ENV === 'production') {
          res.status(400).send({ message:'Please provide your details for your Amazon account under "Settings".' });
          reject();
        } else {
          // handling of default whitelabel url?
          amazonSettings = { accessKey, secretKey, region, whiteLabelUrl };
          resolve();
          return null;
        }
      }
    }).catch(err => {
      reject();
      res.status(500).send(err);
    });
  });

  Promise.all([campaignBelongsToUser, getAmazonKeysAndRegion])
    .then(() => {

      const { accessKey, secretKey, region, whiteLabelUrl } = amazonSettings;

      const isDevMode = process.env.NODE_ENV === 'development' || false;

      const ses = isDevMode
        ? new AWS.SES({ accessKeyId: accessKey, secretAccessKey: secretKey, region, endpoint: 'http://localhost:9999' })
        : new AWS.SES({ accessKeyId: accessKey, secretAccessKey: secretKey, region, apiVersion: '2010-12-01'});

      // Modify email body for analytics
      if (campaign.trackLinksEnabled) {
        campaign.emailBody = wrapLink(campaign.emailBody, 'example-tracking-id', campaign.type, whiteLabelUrl);
      }
      if (campaign.trackingPixelEnabled) {
        campaign.emailBody = insertTrackingPixel(campaign.emailBody, 'example-tracking-id', campaign.type);
      }
      if (campaign.unsubscribeLinkEnabled) {
        campaign.emailBody = insertUnsubscribeLink(campaign.emailBody, 'example-unsubscribe-id', campaign.type, whiteLabelUrl);
      }

      // Get custom/additional data (extra columns) needed for mail merge feature
      db.list.findById(campaign.listId, {
        attributes: ['additionalFields'],
        raw: true
      }).then(list => {
        // Add sample/example data to the custom fields
        const additionalData = list.additionalFields.reduce((additionalData, field) => {
          additionalData[field] = `EXAMPLE ${field}`;
          return additionalData;
        }, {});
        campaign.emailBody = mailMerge({ email: testEmail, additionalData }, campaign);

        const emailFormat = AmazonEmail({ email: testEmail }, campaign).email;

        ses.sendEmail(emailFormat, (data, err) => {
          console.log(data);
          console.log(err);
          if(err){
            if (err.MessageId!='') {
              return res.send({message:'Your test email is being sent'});
            } else {
              return res.status(400).send(err);
            }
          }
          else {
            return res.status(400).send(data);
          }
        });
      });
    })
  .catch(err => {
    return res.status(500).send(err);
    throw err;
  });

};
