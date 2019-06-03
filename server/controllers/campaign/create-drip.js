const db = require("../../models");
const slug = require("slug");
const moment = require("moment");
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
                body.deleted_sequence_ids.map(id => {
                  deleteSequence(id);
                });
                createUpdateDripSequences(req.body.id, "update");
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
              if (typeof body.deleted_sequence_ids !== "undefined") {
                body.deleted_sequence_ids.map(id => {
                  deleteSequence(id);
                });
              }
              createUpdateDripSequences(dripId, "create");
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

  deleteAllSequencesByDripId = dripId => {
    db.dripsequence.destroy({
      where: {
        dripId: dripId
      }
    });
  };

  createUpdateDripSequences = (dripId, action) => {
    sequences = req.body.sequences;
    sequences.map(sequence => {
      if (action == "update") {
        if (sequence.sequenceId == 0) {
          deleteAllSequencesByDripId(dripId);
        }
      }
    });
    sequences.map((sequence, key) => {
      db.dripsequence
        .findAll({
          where: {
            userId,
            dripId,
            id: sequence.sequenceId
          },
          raw: true
        })
        .then(sequenceArr => {
          if (sequenceArr.length) {
            var update_data =
              typeof sequence.display_order !== "undefined"
                ? {
                    templateId: sequence.templateId,
                    send_after_days: sequence.sequenceday,
                    display_order: sequence.display_order
                  }
                : {
                    templateId: sequence.templateId,
                    send_after_days: sequence.sequenceday
                  };
            db.dripsequence.update(update_data, {
              where: {
                id: sequence.sequenceId
              }
            });
          } else {
            var create_data =
              typeof sequence.display_order !== "undefined"
                ? {
                    dripId: dripId,
                    templateId: sequence.templateId,
                    userId: userId,
                    send_after_days: sequence.sequenceday,
                    display_order: sequence.display_order
                  }
                : {
                    dripId: dripId,
                    templateId: sequence.templateId,
                    userId: userId,
                    send_after_days: sequence.sequenceday
                  };
            db.dripsequence.create(create_data);
          }
          if (sequences.length - 1 == key) {
            setTimeout(() => {
              createUpdateDripSequenceHistory(dripId, action);
            }, 100);
          }
        });
    });
  };

  deleteSequence = dripSequenceId => {
    db.dripsequencesenthistory.destroy({
      where: {
        dripsequenceId: dripSequenceId
      }
    });
    db.dripsequence.destroy({
      where: {
        id: dripSequenceId
      }
    });
  };

  createUpdateDripSequenceHistory = async (dripId, action) => {
    const start_time = req.body.startTime;
    let sequences;
    await sequenceByDripId(dripId).then(instance => {
      sequences = instance;
    });
    db.listsubscribersrelation
      .findAll({
        include: [
          {
            model: db.listsubscriber
          }
        ],
        where: {
          listId: valueFromValidation.listId
        },
        raw: true
      })
      .then(subscribers => {
        subscribers.map(subscriber => {
          var send_after = 0;
          sequences.map(sequence => {
            const listsubscribersrelationId = subscriber.id;
            const email = subscriber["listsubscriber.email"];
            const sequenceId = sequence.id;
            const templateId = sequence.templateId;
            send_after = send_after + parseInt(sequence.send_after_days);
            const listId = valueFromValidation.listId;
            /*const send_at = moment(start_time)
              .add(send_after, "Days")
              .format();*/
            const send_at = moment(start_time)
              .add(send_after, "minutes")
              .format();
            db.dripsequencesenthistory
              .findOne({
                where: {
                  dripsequenceId: sequenceId,
                  email: email,
                  dripId: dripId,
                  listId: listId
                }
              })
              .then(sequenceexists => {
                if (sequenceexists) {
                  db.dripsequencesenthistory
                    .update(
                      {
                        templateId: templateId,
                        send_at: send_at
                      },
                      {
                        where: {
                          dripsequenceId: sequenceId,
                          email: email,
                          dripId: dripId,
                          listId: listId
                        }
                      }
                    )
                    .then();
                } else {
                  db.dripsequencesenthistory
                    .create({
                      userId: userId,
                      email: email,
                      dripsequenceId: sequenceId,
                      send_at: send_at,
                      listsubscribersrelationId: listsubscribersrelationId,
                      dripId: dripId,
                      templateId: templateId,
                      listId: listId
                    })
                    .then();
                }
              });
          });
        });
      });
  };

  sequenceByDripId = dripId => {
    return db.dripsequence.findAll({
      where: {
        dripId: dripId
      },
      raw: true
    });
  };
};
