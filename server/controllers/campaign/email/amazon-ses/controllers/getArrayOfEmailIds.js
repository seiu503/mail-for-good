const db = require('../../../../../models');

/**
 * @description Get all the 'listsubscriber' ids we will email
 * @param {object} campaignInfo - Information about this campaign
 * @return {array} Plain array of unique listsubscriber ids {number}, we will email these users.
 */

module.exports = (campaignInfo, campaignSubscriberStatus=false) => {  
  let whereCondition;
  if (campaignSubscriberStatus==true){
    whereCondition={
      dripId: campaignInfo.dripId
    }
  }else{
    whereCondition = {
      dripId: campaignInfo.dripId,
      sent: campaignSubscriberStatus
    }
  }  

  function getListSubscriberIds() {
    return db.listsubscribersrelation.findAll({
      where: {
        listId: campaignInfo.listId
      },
      raw: true
    }).then(listSubscriberIds => {
      const subscriberIds = listSubscriberIds.map(list => {
        return list.listsubscriberId;
      });

      return db.listsubscriber.findAll({
        where: {
          id: subscriberIds,
          subscribed: true
        },
        include: [{
          model: db.campaignsubscriber,
          where: whereCondition
        }],
        attributes: [
          'id'
        ],
        raw: true
      })
        .then(instances => {
          const plainArrayOfIdNumbers = instances.map(x => x.id);
          return plainArrayOfIdNumbers;
        })
        .catch(err => {
          // This should never happen - so we can throw an error here if it does.
          throw new Error('Error getting list subscribers ids in getArrayOfEmailIds - ', err);
        });
    });
  }
  return getListSubscriberIds();
};
