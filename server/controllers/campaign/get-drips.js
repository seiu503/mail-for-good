const drip = require('../../models').drip;

module.exports = (req, res) => {

    const userId = req.user.id;

    // Find all drips belonging to a user & send it to them
    drip.findAll({
        where: {
            userId
        },        
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
