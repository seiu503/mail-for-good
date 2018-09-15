const amazonController = require('./amazon-ses');
const amazonSequenceController = require('./amazon-ses/sequence');

module.exports = {
  amazon: {
    controller: amazonController,
    sequenceController: amazonSequenceController,
  }
};
