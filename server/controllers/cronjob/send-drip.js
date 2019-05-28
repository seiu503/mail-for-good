const db = require("../../models");
const moment = require("moment");
const email = require("../campaign/email");
const AWS = require("aws-sdk");
const AmazonEmail = require("../campaign/email/amazon-ses/lib/amazon");
const configSes = require("../campaign/email/amazon-ses/config/configSes");
const CreateQueue = require("../campaign/email/amazon-ses/queue");

module.exports = (req, res, io, redis) => {
  res.sendStatus(200);

  // Set from date and time back to 5 minutes of the current date and time
  var from_date = moment(new Date())
    .add(-3, "minutes")
    .format();

  // Set to date and time as current date and time
  var to_date = moment(new Date()).format();

  // Get all the drips and sequences which exists in between current and 5 mins before time and never sent
  db.dripsequencesenthistory
    .findAll({
      include: [
        {
          model: db.drip,
          where: {
            status: "running"
          },
          attributes: ["name", "status", "startdatetime"]
        }
      ],
      attributes: [
        "id",
        "email",
        "send_at",
        "is_sent",
        "dripId",
        "templateId",
        "listId",
        "dripsequenceId",
        "userId"
      ],
      where: {
        send_at: {
          $gte: from_date,
          $lte: to_date
        }
        //is_sent: false
      },
      raw: true,
      order: [["userId"], ["templateId"]]
    })
    .then(async sequences => {
      if (sequences.length) {
        var sesCredentail = "";
        // Get user SES credentials for sending the drip sequences as email
        await getSESDetails(sequences[0].userId).then(ses => {
          sesCredentail = ses;
        });

        var emailsByTemplate = new Array();
        var templateId = 0;
        var count = 0;
        sequences.map(sequence => {
          if (templateId != sequence.templateId) {
            emailsByTemplate[sequence.templateId] = [];
            count = 0;
          }
          emailsByTemplate[sequence.templateId][count] = {
            email: sequence.email,
            id: sequence.id
          };
          count++;
          templateId = sequence.templateId;
        });
        // Ready to send drip sequences with SES credentials and users emails by templates
        sendDripSequence(sesCredentail, emailsByTemplate);
      }
    });

  // Function to check SES credential in the settings for the user who created drip
  getSESDetails = userId => {
    return db.setting.findOne({
      where: {
        userId: userId
      },
      attributes: [
        "id",
        "amazonSimpleEmailServiceAccessKey",
        "amazonSimpleEmailServiceSecretKey",
        "amazonSimpleQueueServiceUrl",
        "region",
        "whiteLabelUrl",
        "email"
      ],
      order: [["id", "DESC"]]
    });
  };

  // Prepair Drip Sequences for Sending
  sendDripSequence = async (sesCredentail, sequenceUsers) => {
    const {
      amazonSimpleEmailServiceAccessKey: accessKey,
      amazonSimpleEmailServiceSecretKey: secretKey,
      email,
      region,
      whiteLabelUrl
    } = sesCredentail;
    const rateLimit = 10000; // Need to calculate from quota
    var quota = await getEmailQuotas(accessKey, secretKey, region);
    const ses = configSes(accessKey, secretKey, region);
    const addToQueue = CreateQueue(rateLimit, ses);
    sequenceUsers.map(
      (user = (val, key) => {
        // Get email template by template id
        getTemplate(key).then(templateData => {
          val.map(user => {
            // Add drip sequences into queue
            addToQueue(AmazonEmail(user, templateData));
            console.log(user);
            // Update is_sent as TRUE for the subscribers who received sequence
            db.dripsequencesenthistory.update(
              {
                is_sent: true
              },
              {
                where: {
                  id: user.id
                }
              }
            );
          });
        });
      })
    );
    return;
  };

  // Return email template
  getTemplate = templateId => {
    return db.template.findOne({
      attributes: [
        "fromName",
        "fromEmail",
        "emailSubject",
        "emailBody",
        "type"
      ],
      where: {
        id: templateId
      }
    });
  };

  // Get the user email quota
  getEmailQuotas = async (accessKey, secretKey, region) => {
    const ses = new AWS.SES({
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
      region: region
    });
    await ses.getSendQuota((err, data) => {
      if (err) {
        // Either access keys are wrong here or the request is being placed too quickly
        res.status(400).send({
          message:
            "Please confirm your Amazon SES settings and try again later."
        });
      } else {
        console.log(data);
        const { Max24HourSend, SentLast24Hours, MaxSendRate } = data;
        // If the user's max send rate is 1, they are in sandbox mode.
        // We should let them know and NOT send this campaign
        if (MaxSendRate <= 1) {
          res.status(400).send({
            message:
              "You are currently in Sandbox Mode. Please contact Amazon to get this lifted."
          });
          return;
        }
        const AvailableToday = Max24HourSend - SentLast24Hours;
        return {
          Max24HourSend: Max24HourSend,
          SentLast24Hours: SentLast24Hours,
          MaxSendRate: MaxSendRate,
          AvailableToday: AvailableToday
        };
      }
    });
  };
};
