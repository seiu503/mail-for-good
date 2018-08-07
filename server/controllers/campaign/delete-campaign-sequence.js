const campaignsequence = require('../../models').campaignsequence;
const campaign = require('../../models').campaign;

module.exports = (req, res) => {    
    const sequenceId = req.body.deleteid;
    const newSequenceCount = req.body.sequenceCount - 1;
    campaignsequence.destroy({
        where: {
            id: sequenceId,
        }
    }).then(numDeleted => {        
        if (numDeleted) {
            campaign.update({
                sequenceCount: newSequenceCount
            }, {
            where: {
                id: req.body.campaignid
            }
            }).then(() => {
            }).catch(err => {
                throw err;
            });            
            res.send();
        } else {            
            res.status(404).send();
        }
    }).catch(err => {        
        throw err;
    });
};
