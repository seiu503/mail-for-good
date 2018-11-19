const campaign = require('../../models').campaign;

module.exports = (req, res) => {
    const campaignIds = req.body.data;
    const userId = req.user.id;

    if(req.body.id){        
        campaign.update({
            status: req.body.status
        },
        {
            where: {
                id: req.body.id
            },
            userId
        }).then(instance => {
            if (instance) {
                res.send();
            } else {
                res.status(404).send();
            }
        }).catch(err => {
            throw err;
        });
    }else{
        campaign.update({
            status: 'archive'
        },
        {
            where: { 
                id: { in: campaignIds } 
            }, 
            userId
        }).then(instance => {
            if (instance) {
                res.send();
            } else {
                res.status(404).send();
            }
        }).catch(err => {
            throw err;
        });
    }
};
