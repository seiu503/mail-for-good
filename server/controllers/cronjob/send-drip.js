const db = require("../../models");
const moment = require("moment");
const email = require("../campaign/email");
const AWS = require("aws-sdk");
const AmazonEmail = require("../campaign/email/amazon-ses/lib/amazon");

module.exports = (req, res, io, redis) => {
  res.sendStatus(200);
  // Get all the drips and sequences
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
      /*where: {
        send_at: {
          $gt: new Date()
        }
      },*/
      raw: true,
      //order: [["userId"], ["dripsequenceId"]]
      order: [["userId"], ["templateId"]]
    })
    .then(async sequences => {
      if (sequences.length) {
        var sesCredentail = "";
        await getSESDetails(sequences[0].userId).then(ses => {
          sesCredentail = ses;
        });

        var newArray = new Array();
        var templateId = 0;
        var count = 0;
        sequences.map(sequence => {
          if (templateId != sequence.templateId) {
            newArray[sequence.templateId] = [];
            count = 0;
          }
          newArray[sequence.templateId][count] = {
            email: sequence.email,
            id: sequence.id
          };
          count++;
          templateId = sequence.templateId;
        });
        sendDripSequence(sesCredentail, newArray);
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
  sendDripSequence = (sesCredentail, sequenceUsers) => {
    const {
      amazonSimpleEmailServiceAccessKey: accessKey,
      amazonSimpleEmailServiceSecretKey: secretKey,
      email,
      region,
      whiteLabelUrl
    } = sesCredentail;
    sequenceUsers.map(
      (user = (val, key) => {
        getTemplate(key).then(templateData => {
          const arrayAmazonEmails = [];
          val.map(user => {
            arrayAmazonEmails.push(AmazonEmail(user, templateData));
          });
          console.log(arrayAmazonEmails);
        });
      })
    );
  };

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
