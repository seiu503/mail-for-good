const db = require('../../models');

module.exports = (req, res) => {

  const listSubscriberIds = req.body.listSubscribers;
  const userId = req.user.id;

  db.list.findAll({
    where: { userId },
    attributes: [ 'id' ]
  }).then(result => {
    const ownedListIds = result.map(list => {
      return list.id;
    });

    db.listsubscribersrelation.destroy({
      where: {
        listsubscriberId: listSubscriberIds,
        listId: ownedListIds
      }
    }).then(numDeleted => {
      if (numDeleted) {
        res.send('Subscribers deleted');
      } else {
        res.status(404).send();
      }
    });
  }).catch(() => {
    res.status(500).send('Failed to delete subscribers');
  });
};
