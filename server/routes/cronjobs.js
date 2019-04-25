const bodyParser = require("body-parser");
const parseJson = bodyParser.json();
const cookieParser = require("cookie-parser")();

// Template controllers
const sendDripSequences = require("../controllers/cronjob/send-drip");

module.exports = function(app) {
  // Get request for sending drip sequences
  app.get("/api/senddrip", (req, res) => {
    sendDripSequences(req, res);
  });
};
