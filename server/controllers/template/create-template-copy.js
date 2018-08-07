const db = require('../../models');
const slug = require('slug');

module.exports = (req, res) => {

    //const userId = req.user.id;
    let templates=req.body;
    templates = templates.map(template => {
        template.name = 'Copy of ' + template.name;
        let randNum = Math.floor(Math.random() * 90000) + 10000;
        template.slug = slug(template.name + ' ' + randNum);
        delete template['id'];
        delete template['createdAt'];
        delete template['updatedAt'];
        return template;
    });
    //console.log(templates);
    db.template.bulkCreate(templates).then(templateInstance => {
        res.send(200);
    }).catch(err => {
        console.log('error');
        throw err;
    });
};
