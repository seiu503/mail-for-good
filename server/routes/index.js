const path = require("path");
const bodyParser = require("body-parser");
const auth = require("./auth");
const parseJson = bodyParser.json();

const unsubscribe = require("../controllers/subscriber/unsubscribe");

// Analytics
const getClickthroughs = require("../controllers/analytics/get-clickthroughs");
const refresh = require("../controllers/analytics/refresh");
const open = require("../controllers/analytics/open");
const clickthrough = require("../controllers/analytics/clickthrough");

// Settings
const getSettings = require("../controllers/settings/get-settings");
const changeSettings = require("../controllers/settings/changesettings");

// Middleware
const { apiIsAuth, isAuth } = require("./middleware/auth");

// Routes
const lists = require("./lists");
const templates = require("./templates");
const campaigns = require("./campaigns");
const permissions = require("./permissions");

//Saleforce
const SalesforceClient = require("salesforce-node-client");
const sfdc = new SalesforceClient();
const httpClient = require("request");

//Modal
const db = require("../models");

module.exports = (app, passport, io, redis) => {
  ////////////////////
  /* AUTHENTICATION */
  ////////////////////

  auth(app, passport, isAuth);

  app.get("/logout", isAuth, (req, res) => {
    req.logout();
    res.redirect("/login");
  });

  // Saleforce Function
  app.get("/salesforcelogin", (req, res) => {
    // Redirect to Salesforce login/authorization page
    const uri = sfdc.auth.getAuthorizationUrl({ scope: "api refresh_token" });
    return res.redirect(uri);
  });
  app.get("/auth/callback", (request, response) => {
    if (!request.query.code) {
      response
        .status(500)
        .send("Failed to get authorization code from server callback.");
      return;
    }

    // Authenticate with Force.com via OAuth
    sfdc.auth.authenticate(
      {
        code: request.query.code
      },
      function(error, payload) {
        if (error) {
          console.log(
            "Force.com authentication error: " + JSON.stringify(error)
          );
          response.status(500).json(error);
          return;
        }
        db.setting
          .update(
            {
              salesforceAccessToken: JSON.stringify(payload)
            },
            {
              where: { userId: request.user.id }
            }
          )
          .then(
            instance => {
              if (instance == 1) {
                // Redirect to app main page
                return response.redirect("/lists/import");
              } else {
                res.status(400).send();
              }
            },
            err => {
              throw err;
            }
          );
      }
    );
  });
  app.get("/api/salesforcereports", (req, res) => {
    db.setting
      .findOne({
        where: {
          userId: req.user.id
        }
      })
      .then(settingInstance => {
        if (!settingInstance) {
          // This should never happen as settings are created on account creation
          res.status(500).send("error");
          return;
        } else {
          const settingObject = settingInstance.get({ plain: true });
          const { salesforceAccessToken } = settingObject;
          const salesforceAccessTokenArry =
            salesforceAccessToken != ""
              ? JSON.parse(salesforceAccessToken)
              : "";
          if (salesforceAccessTokenArry != "") {
            sfdc.auth.refresh(
              {
                refresh_token: salesforceAccessTokenArry.refresh_token
              },
              function(error, payload) {
                if (error) {
                  console.log(
                    "Force.com authentication error: " + JSON.stringify(error)
                  );
                  //res.status(500).json(error);
                  res.status(200).json("error");
                  return;
                }
                const apiRequestOptions = sfdc.data.createDataRequest(
                  payload,
                  "query?q=SELECT Name, Id from Report"
                );
                //const apiRequestOptions = sfdc.data.createDataRequest(payload, 'analytics/reports/00O6F00000B79fwUAB');
                //console.log(apiRequestOptions);
                httpClient.get(apiRequestOptions, function(error, payload) {
                  if (error) {
                    console.error(
                      "Force.com data API error: " + JSON.stringify(error)
                    );
                    //res.status(500).json(error);
                    res.status(200).json("error");
                    return;
                  } else {
                    res.send(payload.body);
                    return;
                  }
                });
              }
            );
            return;
          } else {
            res.status(200).send("error");
            return;
          }
        }
      });
  });
  app.post(
    "/api/salesforcereportsdetails",
    apiIsAuth,
    parseJson,
    (req, res) => {
      //console.log(req.body.query);
      // If req.body.reportId was not supplied, cancel
      if (!req.body.query) {
        res.status(400).send();
        return;
      }

      db.setting
        .findOne({
          where: {
            userId: req.user.id
          }
        })
        .then(settingInstance => {
          if (!settingInstance) {
            // This should never happen as settings are created on account creation
            res.status(500).send("error");
          } else {
            const settingObject = settingInstance.get({ plain: true });
            const { salesforceAccessToken } = settingObject;
            const salesforceAccessTokenArry = JSON.parse(salesforceAccessToken);
            if (salesforceAccessTokenArry != "") {
              sfdc.auth.refresh(
                {
                  refresh_token: salesforceAccessTokenArry.refresh_token
                },
                function(error, payload) {
                  if (error) {
                    console.log(
                      "Force.com authentication error: " + JSON.stringify(error)
                    );
                    res.status(500).json(error);
                    return;
                  }
                  const apiRequestOptions = sfdc.data.createDataRequest(
                    payload,
                    req.body.query
                  );
                  //const apiRequestOptions = sfdc.data.createDataRequest(payload, 'analytics/reports/00O6F00000B79fwUAB');
                  console.log(apiRequestOptions);
                  httpClient.get(apiRequestOptions, function(error, payload) {
                    if (error) {
                      console.error(
                        "Force.com data API error: " + JSON.stringify(error)
                      );
                      res.status(500).json(error);
                      return;
                    } else {
                      res.send(payload.body);
                      return;
                    }
                  });
                }
              );
              return;
            }
          }
        });
      return;
    }
  );
  ////////////////////
  /*      API       */
  ////////////////////

  /* Campaigns */
  campaigns(app, io, redis);

  /* Templates */
  templates(app);

  /* Lists */
  lists(app, io);

  /* Permissions */
  permissions(app);

  /* Settings */
  // Get boolean values designating assigned fields
  app.get("/api/settings", apiIsAuth, (req, res) => {
    getSettings(req, res);
  });
  // Post to change new settings
  app.post("/api/settings", apiIsAuth, parseJson, (req, res) => {
    changeSettings(req, res, redis);
  });

  /* Subscribers */
  // Get to unsubscribe an email based on the unsubscribeKey parameter
  app.get("/unsubscribe/:unsubscribeKey", (req, res) => {
    unsubscribe(req, res);
  });

  ////////////////////
  /*    ANALYTICS   */
  ////////////////////

  // convenience root for dev
  app.get("/api/analytics/refresh", (req, res) => {
    refresh(req, res);
  });
  // Clickthrough
  app.get("/clickthrough", (req, res) => {
    clickthrough(req, res);
  });
  // Open/pixel tracking
  app.get("/trackopen", (req, res) => {
    open(req, res);
  });
  // temporary
  app.get("/api/analytics/clickthrough", apiIsAuth, (req, res) => {
    getClickthroughs(req, res);
  });

  ////////////////////
  /*      APP       */
  ////////////////////

  app.get("/*", isAuth, (req, res) => {
    res.sendFile(path.resolve("dist/index.html"));
  });
};
