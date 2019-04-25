const bodyParser = require("body-parser");
const parseJson = bodyParser.json();
const cookieParser = require("cookie-parser")();

// Campaign controllers
const createDrip = require("../controllers/campaign/create-drip");
const changeDripStatus = require("../controllers/campaign/change-drip-status");
const getDrips = require("../controllers/campaign/get-drips");
const createDripCopy = require("../controllers/campaign/create-drip-copy");
const deleteDrips = require("../controllers/campaign/delete-drips");
const sendCronDrip = require("../controllers/campaign/send-crondrip");

// Prepare Drip Sequences History
const prepareDripSequence = require("../controllers/cronjob/prepare-drip-sequence");

const getCampaignsSeuence = require("../controllers/campaign/get-campaign-sequence");
const createCampaignSequence = require("../controllers/campaign/create-campaign-sequence");
const deleteCampaignSequence = require("../controllers/campaign/delete-campaign-sequence");
const getCampaigns = require("../controllers/campaign/get-campaigns");
const createCampaign = require("../controllers/campaign/create-campaign");
const createCampaignCopy = require("../controllers/campaign/create-campaign-copy");
const changeCampaignStatus = require("../controllers/campaign/change-campaign-status");
const deleteCampaigns = require("../controllers/campaign/delete-campaigns");

const exportSentUnsentCSV = require("../controllers/campaign/export-sent-unsent-csv");
const stopCampaignSending = require("../controllers/campaign/stop-campaign-sending");
const sendCampaign = require("../controllers/campaign/send-campaign");
const sendTestEmail = require("../controllers/campaign/email/amazon-ses/send-test");
const getAllCampaigns = require("../controllers/campaign/get-allcampaigns");
const sendCronCampaign = require("../controllers/campaign/send-croncampaign");
const sendCronCampaignSequence = require("../controllers/campaign/send-croncampaign-sequence");

// Middleware
const { apiIsAuth } = require("./middleware/auth");
const { writeAccess, readAccess } = require("./middleware/acl");

// Permission
const campaignPermission = require("../controllers/permissions/acl-lib/acl-campaign-permissions");

// Higher order functions decorating with the permission type
const writeCampaignAccess = (req, res, next) =>
  writeAccess(req, res, next, campaignPermission);
const readCampaignAccess = (req, res, next) =>
  readAccess(req, res, next, campaignPermission);

module.exports = function(app, io, redis) {
  // Post new Drip
  app.post(
    "/api/createdrip",
    apiIsAuth,
    parseJson,
    cookieParser,
    writeCampaignAccess,
    (req, res) => {
      createDrip(req, res, io);
    }
  );

  app.post(
    "/api/prepare-drip-sequence",
    apiIsAuth,
    parseJson,
    cookieParser,
    writeCampaignAccess,
    (req, res) => {
      prepareDripSequence(req, res, io);
    }
  );

  app.post(
    "/api/changedripstatus",
    apiIsAuth,
    parseJson,
    cookieParser,
    writeCampaignAccess,
    (req, res) => {
      changeDripStatus(req, res, io);
    }
  );
  app.get(
    "/api/getdrips",
    apiIsAuth,
    cookieParser,
    readCampaignAccess,
    (req, res) => {
      getDrips(req, res);
    }
  );
  app.post(
    "/api/dripcopy",
    apiIsAuth,
    parseJson,
    cookieParser,
    writeCampaignAccess,
    (req, res) => {
      createDripCopy(req, res, io);
    }
  );
  // Delete drip(s)
  app.delete(
    "/api/deletedrip",
    apiIsAuth,
    parseJson,
    cookieParser,
    writeCampaignAccess,
    (req, res) => {
      deleteDrips(req, res);
    }
  );
  // Post to send a cron drip
  app.post(
    "/api/cronsenddrip",
    parseJson,
    cookieParser,
    writeCampaignAccess,
    (req, res) => {
      sendCronDrip(req, res, io, redis);
    }
  );

  // Get a list of all campaigns
  app.get(
    "/api/campaign",
    apiIsAuth,
    cookieParser,
    readCampaignAccess,
    (req, res) => {
      getCampaigns(req, res);
    }
  );
  // Get a list of all users campaigns
  app.get("/api/allcampaign", cookieParser, readCampaignAccess, (req, res) => {
    getAllCampaigns(req, res);
  });

  // Export subscribers that emails were not sent/sent to during a campaign
  app.get(
    "/api/campaign/subscribers/csv",
    apiIsAuth,
    cookieParser,
    readCampaignAccess,
    (req, res) => {
      exportSentUnsentCSV(req, res);
    }
  );

  // Post new campaign
  app.post(
    "/api/campaign",
    apiIsAuth,
    parseJson,
    cookieParser,
    writeCampaignAccess,
    (req, res) => {
      createCampaign(req, res, io);
    }
  );

  // Post copy campaign
  app.post(
    "/api/campaigncopy",
    apiIsAuth,
    parseJson,
    cookieParser,
    writeCampaignAccess,
    (req, res) => {
      createCampaignCopy(req, res, io);
    }
  );

  // Post chnage campaign status
  app.post(
    "/api/changecampaignstatus",
    apiIsAuth,
    parseJson,
    cookieParser,
    writeCampaignAccess,
    (req, res) => {
      changeCampaignStatus(req, res, io);
    }
  );

  // Delete campaign(s)
  app.delete(
    "/api/campaign",
    apiIsAuth,
    parseJson,
    cookieParser,
    writeCampaignAccess,
    (req, res) => {
      deleteCampaigns(req, res);
    }
  );

  /* Send */
  // Post to send campaign
  app.post(
    "/api/send",
    apiIsAuth,
    parseJson,
    cookieParser,
    writeCampaignAccess,
    (req, res) => {
      sendCampaign(req, res, io, redis);
    }
  );
  // Stop sending a campaign
  app.post(
    "/api/stop",
    apiIsAuth,
    parseJson,
    cookieParser,
    writeCampaignAccess,
    (req, res) => {
      stopCampaignSending(req, res, redis);
    }
  );
  // Post to send a test email
  app.post(
    "/api/test",
    apiIsAuth,
    parseJson,
    cookieParser,
    writeCampaignAccess,
    (req, res) => {
      sendTestEmail(req, res);
    }
  );
  // Post to send a cron campaign
  app.post(
    "/api/cronsend",
    parseJson,
    cookieParser,
    writeCampaignAccess,
    (req, res) => {
      sendCronCampaign(req, res, io, redis);
    }
  );
  // Post to send a cron campaign sequence
  app.post(
    "/api/cronsendsequence",
    parseJson,
    cookieParser,
    writeCampaignAccess,
    (req, res) => {
      sendCronCampaignSequence(req, res, io, redis);
    }
  );
  // Post new campaign
  app.post(
    "/api/campaignsequence",
    apiIsAuth,
    parseJson,
    cookieParser,
    writeCampaignAccess,
    (req, res) => {
      createCampaignSequence(req, res, io);
    }
  );
  // Get a list of all campaign sequences
  app.post(
    "/api/campaignsequencelisting",
    apiIsAuth,
    parseJson,
    cookieParser,
    writeCampaignAccess,
    (req, res) => {
      getCampaignsSeuence(req, res, redis);
    }
  );
  // Delete campaign sequence
  app.delete(
    "/api/campaignsequence",
    apiIsAuth,
    parseJson,
    cookieParser,
    writeCampaignAccess,
    (req, res) => {
      deleteCampaignSequence(req, res);
    }
  );
};
