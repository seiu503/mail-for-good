const bodyParser = require('body-parser');
const parseJson = bodyParser.json();
const cookieParser = require('cookie-parser')();

// Template controllers
const getTemplates = require('../controllers/template/get-templates');
const createTemplate = require('../controllers/template/create-template');
const publishTemplate = require('../controllers/template/publish-template');
const deleteTemplates = require('../controllers/template/delete-templates');
const createTemplateCopy = require('../controllers/template/create-template-copy');

// Middleware
const { apiIsAuth } = require('./middleware/auth');
const { writeAccess, readAccess } = require('./middleware/acl');

// Permission
const templatePermission = require('../controllers/permissions/acl-lib/acl-template-permissions');

// Higher order functions decorating with the permission type
const writeTemplateAccess = (req, res, next) => writeAccess(req, res, next, templatePermission);
const readTemplateAccess = (req, res, next) => readAccess(req, res, next, templatePermission);

module.exports = function(app) {
  // Get a list of all templates
  app.get('/api/template', apiIsAuth, cookieParser, readTemplateAccess, (req, res) => {
    getTemplates(req, res);
  });
  // Post a new template
  app.post('/api/template', apiIsAuth, parseJson, cookieParser, writeTemplateAccess, (req, res) => {
    createTemplate(req, res);
  });
  
  // Publish template
  app.post('/api/templatepublish', apiIsAuth, parseJson, cookieParser, writeTemplateAccess, (req, res) => {
    publishTemplate(req, res);
  });


  // Delete template(s)
  app.delete('/api/template', apiIsAuth, parseJson, cookieParser, writeTemplateAccess, (req, res) => {
    deleteTemplates(req, res);
  });
  
  // Post a new template copy
  app.post('/api/templatecopy', apiIsAuth, parseJson, cookieParser, writeTemplateAccess, (req, res) => {
    createTemplateCopy(req, res);
  });
};
