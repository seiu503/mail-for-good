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
    let campaigns =req.body;
    campaigns = campaigns.map(campaign => {
        campaign.name   = 'Copy of ' + campaign.name;
        let randNum = Math.floor(Math.random() * 90000) + 10000;
        campaign.slug = slug(campaign.name + ' ' + randNum);
        campaign.status = 'draft';
        campaign.userId = userId;
        delete campaign['campaignanalytic.clickthroughCount'];
        delete campaign['campaignanalytic.complaintCount'];
        delete campaign['campaignanalytic.openCount'];
        delete campaign['campaignanalytic.permanentBounceCount'];
        delete campaign['campaignanalytic.totalSentCount'];
        delete campaign['campaignanalytic.transientBounceCount'];
        delete campaign['campaignanalytic.undeterminedBounceCount'];        
        delete campaign['id'];
        /* delete campaign['sequenceCount']; */
        delete campaign['totalCampaignSubscribers'];
        delete campaign['createdAt'];
        delete campaign['updatedAt'];
        return campaign;
    });
    Object.keys(campaigns).forEach(function (key) {
        //console.log(campaigns[key]);           
        // Will mutate the below object to extract info we need during validation checks
        const valueFromValidation = {};

        // Validate that this list belongs to the user
        const validateListBelongsToUser = db.list.findOne({
            where: {
                id: campaigns[key].listId, // Could use list ID here
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
            console.log('promise');
            if (values.some(x => x === false)) {
                console.log('value some');
                res.status(400).send(); // If any validation promise resolves to false, fail silently. No need to respond as validation is handled client side & this is a security measure.
            } else {

                const emailBodyType = campaigns[key].emailBody;

                // Find or create the campaign
                db.campaign.create({
                    name: campaigns[key].name, // Repeating these fields to make it clear that this property marks the new row's fields
                    fromName: campaigns[key].fromName,
                    fromEmail: campaigns[key].fromEmail,
                    emailSubject: campaigns[key].emailSubject,
                    emailBody: emailBodyType,
                    type: campaigns[key].type,
                    trackingPixelEnabled: campaigns[key].trackingPixelEnabled,
                    trackLinksEnabled: campaigns[key].trackLinksEnabled,
                    unsubscribeLinkEnabled: campaigns[key].unsubscribeLinkEnabled,
                    userId: req.user.id,
                    listId: valueFromValidation.listId,
                    slug: campaigns[key].slug,
                    scheduledatetime: campaigns[key].scheduledatetime,
                    status: campaigns[key].status,
                    
                }).then((instance) => {
                   // console.log(instance);
                    if (instance.$options.isNewRecord) {
                        const campaignId = instance.dataValues.id;
                        let totalCampaignSubscribersProcessed = 0;
                        db.campaignanalytics.create({ campaignId }).then(() => {
                            // Iterate through blocks of 10k ListSubscribers and bulk create CampaignSubscribers.
                            // Each time we write (bulk insert) 10k ListSubscribers, fetch the next 10k by recursively calling
                            // createCampaignSubscribers - ensures that we don't run out of ram by loading too many ListSubscribers
                            // at once.
                            //res.send({ message: 'Campaign is being created - it will be ready to send soon.' }); // Should use notification/status rather than simple response
                            function createCampaignSubscribers(offset = 0, limit = 10000) {
                                db.listsubscriber.findAll({
                                    where: {
                                        listId: valueFromValidation.listId
                                    },
                                    limit,
                                    offset,
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
                                        totalCampaignSubscribersProcessed += listSubscribers.length;
                                        listSubscribers = listSubscribers.map(listSubscriber => {
                                            listSubscriber.campaignId = campaignId;
                                            return listSubscriber;
                                        });
                                        db.campaignsubscriber.bulkCreate(listSubscribers).then(() => {
                                            createCampaignSubscribers(offset + limit);
                                        });
                                    } else {
                                        db.campaign.update({
                                            status: 'draft',
                                            totalCampaignSubscribers: totalCampaignSubscribersProcessed
                                        }, {
                                                where: {
                                                    id: campaignId
                                                }
                                            }).then(() => {
                                                //sendSuccessNotification();
                                                return;
                                            }).catch(err => {
                                                throw err;
                                            });
                                    }
                                });
                            }
                            createCampaignSubscribers(); // Start creating CampaignSubscribers
                        });
                    } else {
                        console.log('else');
                        res.status(400).send('error'); // As before, form will be validated client side so no need for a response
                    }
                }, err => {
                    throw err;
                });
            }
        }).catch(err => {
            console.log('catch');
            res.status(400).send(err);
        }); 
    });
    res.send({ message: 'Campaign is being created - it will be ready to send soon.' });
    function sendSuccessNotification() {
        const notification = {
            message: `${req.body.campaignName} is ready to send`,
            icon: 'fa-list-alt',
            iconColour: 'text-green',
            newDataToFetch: 'campaigns',  // A client side resource to be updated, e.g. 'campaigns'
            url: `/campaigns/manage/${slug(req.body.campaignName)}`  // User is redirected to this (relative) url when they dismiss a notification
        };

        sendSingleNotification(io, req, notification);
    }
};
