const db = require('../../models');
const slug = require('slug');

const sendSingleNotification = require('../websockets/send-single-notification');


module.exports = (req, res, io) => {
    /*
          Outstanding issues:
          -- Validate other things? Validations can be added as promises to validationComplete and run concurrently
          -- Clean up sequelize code
    */

    const userId = req.user.id;
    let drips = req.body;
    drips = drips.map(drip => {
        drip.name = 'Copy of ' + drip.name;
        let randNum = Math.floor(Math.random() * 90000) + 10000;
        drip.slug = slug(drip.name + ' ' + randNum);
        drip.status = 'draft';
        drip.userId = userId;
        drip.startdatetime = (drip.startdatetime) ? drip.startdatetime : null,
        /* delete drip['campaignanalytic.clickthroughCount'];
        delete drip['campaignanalytic.complaintCount'];
        delete drip['campaignanalytic.openCount'];
        delete drip['campaignanalytic.permanentBounceCount'];
        delete drip['campaignanalytic.totalSentCount'];
        delete drip['campaignanalytic.transientBounceCount'];
        delete drip['campaignanalytic.undeterminedBounceCount'];
        delete drip['sequenceCount'];
        delete drip['totalCampaignSubscribers']; */
        delete drip['id'];
        delete drip['createdAt'];
        delete drip['updatedAt'];
        return drip;
    });
    
    Object.keys(drips).forEach(function (key) {
        // Will mutate the below object to extract info we need during validation checks
        const valueFromValidation = {};

        // Validate that this list belongs to the user
        const validateListBelongsToUser = db.list.findOne({
            where: {
                id: drips[key].listId, // Could use list ID here
                userId
            }
        }).then(instance => { // The requested list exists & it belongs to the user            
            if (instance) {
                valueFromValidation.listId = instance.dataValues.id;
                return true;
            } else {
                return false;
            }
        }, err => {
            throw err;
        });

        Promise.all([validateListBelongsToUser]).then(values => {
            if (values.some(x => x === false)) {
                res.status(400).send(); // If any validation promise resolves to false, fail silently. No need to respond as validation is handled client side & this is a security measure.
            } else {

                db.drip.create({
                    userId: userId,
                    slug: drips[key].slug,
                    name: drips[key].name,
                    startdatetime: (drips[key].startdatetime) ? drips[key].startdatetime : null,
                    sequences: drips[key].sequences,
                    sequenceCount: drips[key].sequenceCount,
                    listId: valueFromValidation.listId,
                }).then((instance) => {
                    const dripId = instance.dataValues.id;
                    res.send({ dripId: dripId, message: 'Drip is being created - it will be ready to send soon.' });
                    function createDripSubscribers(offset = 0, limit = 10000) {
                        db.listsubscribersrelation.findAll({
                            where: {
                                listId: valueFromValidation.listId
                            },
                            limit,
                            offset,
                            order: [
                                ['id', 'ASC']
                            ],
                            raw: true
                        }).then(listSubscriberIds => {
                            const subscriberIds = listSubscriberIds.map(list => {
                                return list.listsubscriberId;
                            });
                            db.listsubscriber.findAll({
                                where: {
                                    id: subscriberIds
                                },
                                attributes: [
                                    [
                                        'id', 'listsubscriberId'
                                    ],
                                    'email'
                                ], // Nested array used to rename id to listsubscriberId
                                order: [
                                    ['id', 'ASC']
                                ],
                                raw: true
                            }).then(listSubscribers => {
                                if (listSubscribers.length) { // If length is 0 then there are no more ListSubscribers, so we can cleanup
                                    //totalCampaignSubscribersProcessed += listSubscribers.length;
                                    listSubscribers = listSubscribers.map(listSubscriber => {
                                        listSubscriber.campaignId = null;
                                        listSubscriber.dripId = dripId;
                                        return listSubscriber;
                                    });
                                    db.campaignsubscriber.bulkCreate(listSubscribers).then(() => {
                                        createDripSubscribers(offset + limit);
                                    });
                                } else {
                                    return;
                                }
                            });
                        });
                    }
                    createDripSubscribers(); 
                }, err => {
                    throw err;
                });
               
            }
        }).catch(err => {
            res.status(400).send(err);
        });
    });    
};
