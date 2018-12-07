const drip = require('../../models').drip;

module.exports = (req, res) => {
    const dripIds = req.body.data;

    const userId = req.user.id;

    drip.destroy({
        where: {
            id: {
                in: dripIds
            },
            userId
        }
    }).then(numDeleted => {
        if (numDeleted) {
            res.send();
        } else {
            res.status(404).send();
        }
    }).catch(err => {
        throw err;
    });
};
