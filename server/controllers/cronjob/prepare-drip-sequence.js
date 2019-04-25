const drip = require("../../models").drip;
const setting = require("../../models").setting;
const listsubscribersrelation = require("../../models").listsubscribersrelation;
const listsubscriber = require("../../models").listsubscriber;
const dripsequencesenthistory = require("../../models").dripsequencesenthistory;
const db = require("../../models");
const moment = require("moment");

module.exports = (req, res) => {
  // Get all the drips and sequences
  dripId = req.body.dripId;
  res.sendStatus(200);
  drip
    .findOne({
      where: {
        id: dripId
      },
      attributes: [
        "id",
        "userId",
        "name",
        "startdatetime",
        "sequences",
        "status",
        "sequenceCount",
        "listId"
      ],
      raw: true
    })
    .then(dripdetail => {
      if (dripdetail) {
        // Call a fucntion to check the Settings against the user who created drip
        haveSESCredential(dripdetail);
      }
    });

  // Function to check SES credential in the settings for the user who created drip
  haveSESCredential = drip => {
    setting
      .findOne({
        where: {
          userId: drip.userId
        },
        attributes: [
          "id",
          "amazonSimpleEmailServiceAccessKey",
          "amazonSimpleEmailServiceSecretKeyEncrypted",
          "amazonSimpleQueueServiceUrl",
          "region",
          "whiteLabelUrl",
          "email"
        ],
        order: [["id", "DESC"]],
        raw: true
      })
      .then(setting => {
        prepareDripSending(drip, setting);
      });
  };

  prepareDripSending = (drip, setting) => {
    sequenceSent = {};
    const sequences = JSON.parse(drip.sequences);
    listsubscribersrelation
      .findAll({
        include: [
          {
            model: listsubscriber
          }
        ],
        where: {
          listId: drip.listId
        },
        raw: true
      })
      .then(subscribers => {
        subscribers.map(subscriber => {
          var send_after = 0;
          sequences.map(sequence => {
            const listsubscribersrelationId = subscriber.id;
            const email = subscriber["listsubscriber.email"];
            const sequence_no = parseInt(sequence.sequenceId);
            const templateId = sequence.templateId;
            send_after = send_after + parseInt(sequence.sequenceday);
            const dripId = drip.id;
            const listId = drip.listId;
            const send_at = moment(drip.startdatetime)
              .add(send_after, "Days")
              .format();

            sequenceSent = {
              email,
              sequence_no,
              send_at,
              listsubscribersrelationId,
              dripId,
              templateId,
              listId
            };
            db.dripsequencesenthistory
              .findOrCreate({
                where: {
                  listsubscribersrelationId: listsubscribersrelationId,
                  dripId: dripId,
                  templateId: templateId,
                  listId: listId
                },
                defaults: {
                  email: email,
                  sequence_no: sequence_no,
                  send_at: send_at,
                  listsubscribersrelationId: listsubscribersrelationId,
                  dripId: dripId,
                  templateId: templateId,
                  listId: listId
                }
              })
              .then()
              .catch(err => {
                throw err;
              });
            console.log(sequenceSent);
          });
        });
      });
  };
};
