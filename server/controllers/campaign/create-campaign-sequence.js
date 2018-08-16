const db = require('../../models');
const slug = require('slug');

const sendSingleNotification = require('../websockets/send-single-notification');


module.exports = (req, res, io) => {    

    const emailBodyType = req.body.emailBody;
    const id = req.body.id;
    const newSequenceCount = req.body.sequenceCount + 1;    
    if(id>0){
        db.campaignsequence.update({
            campaignId: req.body.campaignid,
            emailSubject: req.body.emailSubject,
            emailBody: emailBodyType,
            emailBodyDesign: req.body.emailBodyDesign || '',
            type: req.body.type,
            sequenceday: req.body.sequenceday,
        }, {
            where: {id: id}
        }).then((instance) => {            
            if(instance==1){                
                res.send({ message: 'Campaign Sequence updated' }); // Should use notification/status rather than simple 
            }else{
                res.status(400).send();
            }
        }, err => {            
            throw err;
        });
    }else{    
        // Find or create the campaignsequence
        db.campaignsequence.create({        
            campaignId: req.body.campaignid,
            emailSubject: req.body.emailSubject,
            emailBody: emailBodyType,
            emailBodyDesign: req.body.emailBodyDesign || '',
            type: req.body.type,
            sequenceday: req.body.sequenceday,
        }).then((instance) => {                       
            if (instance.$options.isNewRecord) {  
                db.campaign.update({
                    sequenceCount: newSequenceCount                    
                }, {
                    where: {
                        id: req.body.campaignid
                    }
                }).then(() => {                                        
                }).catch(err => {
                    throw err;
                });          
                res.send({ message: 'Campaign Sequence is being created - it will be ready to send soon.' }); // Should use notification/status rather than simple response
                //sendSuccessNotification();
            } else {            
                res.status(400).send(); // As before, form will be validated client side so no need for a response
            }
        }, err => {        
            throw err;
        });   
    }
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
