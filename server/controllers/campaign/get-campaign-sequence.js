const Campaignsequence = require('../../models').campaignsequence;

module.exports = (req, res) => {
    // If req.body.id was not supplied or is not a number, cancel
    if (!req.body.id || typeof req.body.id !== 'number') {
        res.status(400).send();
        return;
    }    
    const campaignId = req.body.id;
    // Find all campaign Seqeunces belonging to a campaign & send it to them
    Campaignsequence.findAll({
        where: {
            campaignId: campaignId
        },
        order: '"sequenceday" ASC',
        raw: true
    }).then(instancesArray => {
        if (instancesArray) {
            res.send(instancesArray);
        } else {
            res.send();
        }
    }).catch(() => {
        res.send();
    }).catch(err => {
        res.status(400).send(err);
    });

};