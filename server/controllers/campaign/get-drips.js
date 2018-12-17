const drip = require('../../models').drip;
const CampaignAnalytics = require('../../models').campaignanalytics;

module.exports = (req, res) => {

    const userId = req.user.id;

    // Find all drips belonging to a user & send it to them
    drip.findAll({
        where: {
            userId
        },        
        include: [
            {
                model: CampaignAnalytics, // Campaign summary analytics
                required: true,
                attributes: [
                    'complaintCount',
                    'permanentBounceCount',
                    'transientBounceCount',
                    'undeterminedBounceCount',
                    'totalSentCount',
                    'openCount',
                    'clickthroughCount'
                ]
            }
        ],
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
