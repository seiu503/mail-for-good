const db = require('../../models');
const slug = require('slug');

module.exports = (req, res) => {

    const userId = req.user.id;
    const id = req.body.id;
    const status = req.body.status;
    const publishedEmailBody = req.body.emailBody;
    if (id > 0) {
        db.template.update({
            status: status,
            publishedEmailBody: publishedEmailBody
        }, {
                where: { id: id }
            }).then((instance) => {
                if (instance == 1) {
                    res.send({ message: 'template updated' }); // Should use notification/status rather than simple 
                } else {
                    res.status(400).send();
                }
            }, err => {
                throw err;
            });
    } else {
        res.status(400).send();
    }
};
