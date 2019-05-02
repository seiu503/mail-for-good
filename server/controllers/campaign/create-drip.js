const db = require("../../models");
const slug = require("slug");

const sendSingleNotification = require("../websockets/send-single-notification");

module.exports = (req, res, io) => {
  const userId = req.user.id;
  const body = req.body;

  // Will mutate the below object to extract info we need during validation checks
  const valueFromValidation = {};

  // Validate that this list belongs to the user
  const validateListBelongsToUser = db.list
    .findOne({
      where: {
        name: req.body.listName, // Could use list ID here
        userId
      }
    })
    .then(
      instance => {
        // The requested list exists & it belongs to the user
        if (instance) {
          valueFromValidation.listId = instance.dataValues.id;
          return true;
        } else {
          return false;
        }
      },
      err => {
        throw err;
      }
    );

  Promise.all([validateListBelongsToUser])
    .then(values => {
      // Find or create the campaignsequence
      if (req.body.id > 0) {
        db.drip
          .update(
            {
              slug: slug(req.body.name),
              name: req.body.name,
              startdatetime: req.body.startTime ? req.body.startTime : null,
              sequences: JSON.stringify(req.body.sequences),
              sequenceCount: req.body.sequences.length,
              listId: valueFromValidation.listId
            },
            {
              where: { id: req.body.id }
            }
          )
          .then(
            instance => {
              if (instance == 1) {
                //console.log(req.body.listId + ' ' + valueFromValidation.listId);
                if (req.body.listId == valueFromValidation.listId) {
                  if (req.body.status == "draft") {
                    res.send({
                      dripId: req.body.id,
                      status: req.body.status,
                      message: "Drip updated."
                    });
                  } else {
                    if (!req.body.scheduledatetime) {
                      res.send({
                        dripId: req.body.id,
                        status: req.body.status
                      });
                    } else {
                      res.send({
                        dripId: req.body.id,
                        status: req.body.status,
                        message: "Drip updated."
                      });
                    }
                  }
                } else {
                  db.campaignsubscriber
                    .destroy({
                      where: {
                        dripId: req.body.id
                      }
                    })
                    .then(numDeleted => {
                      if (req.body.status == "draft") {
                        res.send({
                          dripId: req.body.id,
                          status: req.body.status,
                          message: "Drip updated."
                        });
                      } else {
                        if (!req.body.scheduledatetime) {
                          res.send({
                            dripId: req.body.id,
                            status: req.body.status
                          });
                        } else {
                          res.send({
                            dripId: req.body.id,
                            status: req.body.status,
                            message: "Drip updated."
                          });
                        }
                      }

                      function createDripSubscribers(
                        offset = 0,
                        limit = 10000
                      ) {
                        db.listsubscribersrelation
                          .findAll({
                            where: {
                              listId: valueFromValidation.listId
                            },
                            limit,
                            offset,
                            order: [["id", "ASC"]],
                            raw: true
                          })
                          .then(listSubscriberIds => {
                            const subscriberIds = listSubscriberIds.map(
                              list => {
                                return list.listsubscriberId;
                              }
                            );
                            db.listsubscriber
                              .findAll({
                                where: {
                                  id: subscriberIds
                                },
                                attributes: [
                                  ["id", "listsubscriberId"],
                                  "email"
                                ], // Nested array used to rename id to listsubscriberId
                                order: [["id", "ASC"]],
                                raw: true
                              })
                              .then(listSubscribers => {
                                if (listSubscribers.length) {
                                  // If length is 0 then there are no more ListSubscribers, so we can cleanup
                                  //totalCampaignSubscribersProcessed += listSubscribers.length;
                                  listSubscribers = listSubscribers.map(
                                    listSubscriber => {
                                      listSubscriber.campaignId = null;
                                      listSubscriber.dripId = req.body.id;
                                      return listSubscriber;
                                    }
                                  );
                                  db.campaignsubscriber
                                    .bulkCreate(listSubscribers)
                                    .then(() => {
                                      createDripSubscribers(offset + limit);
                                    });
                                } else {
                                  return;
                                }
                              });
                          });
                      }
                      createDripSubscribers(); // Start creating CampaignSubscribers
                    })
                    .catch(err => {
                      throw err;
                    });
                }
                createDripSequences(req.body.id, req.body.sequences);
              } else {
                res.status(400).send();
              }
            },
            err => {
              throw err;
            }
          );
      } else {
        db.drip
          .create({
            userId: userId,
            slug: slug(req.body.name),
            name: req.body.name,
            startdatetime: req.body.startTime ? req.body.startTime : null,
            sequences: JSON.stringify(req.body.sequences),
            sequenceCount: req.body.sequences.length,
            listId: valueFromValidation.listId
          })
          .then(
            instance => {
              const dripId = instance.dataValues.id;
              res.send({
                dripId: dripId,
                message:
                  "Drips is being created - it will be ready to send soon."
              });
              db.campaignanalytics.create({ dripId }).then(() => {
                function createDripSubscribers(offset = 0, limit = 10000) {
                  db.listsubscribersrelation
                    .findAll({
                      where: {
                        listId: valueFromValidation.listId
                      },
                      limit,
                      offset,
                      order: [["id", "ASC"]],
                      raw: true
                    })
                    .then(listSubscriberIds => {
                      const subscriberIds = listSubscriberIds.map(list => {
                        return list.listsubscriberId;
                      });
                      db.listsubscriber
                        .findAll({
                          where: {
                            id: subscriberIds
                          },
                          attributes: [["id", "listsubscriberId"], "email"], // Nested array used to rename id to listsubscriberId
                          order: [["id", "ASC"]],
                          raw: true
                        })
                        .then(listSubscribers => {
                          if (listSubscribers.length) {
                            // If length is 0 then there are no more ListSubscribers, so we can cleanup
                            //totalCampaignSubscribersProcessed += listSubscribers.length;
                            listSubscribers = listSubscribers.map(
                              listSubscriber => {
                                listSubscriber.campaignId = null;
                                listSubscriber.dripId = dripId;
                                return listSubscriber;
                              }
                            );
                            db.campaignsubscriber
                              .bulkCreate(listSubscribers)
                              .then(() => {
                                createDripSubscribers(offset + limit);
                              });
                          } else {
                            return;
                          }
                        });
                    });
                }
                createDripSubscribers(); // Start creating CampaignSubscribers
              });
              createDripSequences(dripId, req.body.sequences);
            },
            err => {
              throw err;
            }
          );
      }
    })
    .catch(err => {
      res.status(400).send(err);
    });

  createDripSequences = (dripId, sequences) => {
    sequences.map(sequence => {
      db.dripsequence.create({
        dripId: dripId,
        templateId: sequence.templateId,
        userId: userId,
        send_after_days: sequence.sequenceday
      });
    });
  };
};
