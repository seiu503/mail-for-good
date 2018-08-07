const db = require('../../models');
const slug = require('slug');

module.exports = (req, res) => {

  const userId = req.user.id;

  // Validate input
  if (!req.body.templateName || !req.body.type || !req.body.emailBody) {
    res.status(400).send();
    return;
  }
  const id = req.body.id;
  const emailBodyType = req.body.emailBody;
  if(id>0){
    db.template.update({
      name: req.body.templateName,
      fromName: req.body.fromName || '',
      fromEmail: req.body.fromEmail || '',
      emailSubject: req.body.emailSubject || '',
      emailBody: emailBodyType,
      emailBodyDesign: req.body.emailBodyDesign || '',
      trackingPixelEnabled: req.body.trackingPixelEnabled,
      trackLinksEnabled: req.body.trackLinksEnabled,
      unsubscribeLinkEnabled: req.body.unsubscribeLinkEnabled,
      type: req.body.type,      
      slug: slug(req.body.templateName)
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
  }else{

    db.template.findOrCreate({
      where: {
        name: req.body.templateName,
        userId: userId
      },
      defaults: {
        name: req.body.templateName,
        fromName: req.body.fromName || '',
        fromEmail: req.body.fromEmail || '',
        emailSubject: req.body.emailSubject || '',
        emailBody: emailBodyType,
        emailBodyDesign: req.body.emailBodyDesign || '',
        trackingPixelEnabled: req.body.trackingPixelEnabled,
        trackLinksEnabled: req.body.trackLinksEnabled,
        unsubscribeLinkEnabled: req.body.unsubscribeLinkEnabled,
        type: req.body.type,
        userId: userId,
        slug: slug(req.body.templateName)
      }
    }).then(templateInstance => {
      if (templateInstance) { // Does the template already exist?
        res.status(400).send();
      } else {
        res.send();
      }
    }).catch(err => {
      throw err;
    });
  }  
};
