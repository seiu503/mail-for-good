const dripsequence = require("../../models").dripsequence;

module.exports = (req, res) => {
  const userId = req.user.id;
  const dripId = req.query.dripId;

  // Find all drips belonging to a user & send it to them
  dripsequence
    .findAll({
      where: {
        userId,
        dripId
      },
      order: [["display_order"], ["id"]],
      raw: true
    })
    .then(instancesArray => {
      if (instancesArray) {
        res.send(instancesArray);
      } else {
        res.send();
      }
    })
    .catch(() => {
      res.send();
    })
    .catch(err => {
      res.status(400).send(err);
    });
};
