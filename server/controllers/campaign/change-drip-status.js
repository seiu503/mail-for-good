const drip = require('../../models').drip;

module.exports = (req, res) => {
    const submitType = req.body.submitType;
    const userId = req.user.id;

    if (submitType == 'single') {
        drip.update({
            status: req.body.status
        }, {
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
    } else {
        drip.update({
            status: req.body.status
        },
            {
                where: {
                    id: { in: req.body.ids }
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
