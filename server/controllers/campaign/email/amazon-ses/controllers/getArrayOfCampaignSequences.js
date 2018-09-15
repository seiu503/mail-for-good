const db = require('../../../../../models');

/**
 * @description Get all the 'campaign sequences' we will email
 * @param {object} campaignInfo - Information about this campaign
 * @return {array} Array of campaign sequences
 */

module.exports = (campaignInfo) => {       
    function getCampaignSequences() {
        return db.campaignsequence.findAll({
            where: {
                campaignId: campaignInfo.campaignId
            },       
            order: '"id" ASC',  
            raw: true
        })
        .then(sequences => {            
            return sequences
        })
        .catch(err => {
            // This should never happen - so we can throw an error here if it does.
            throw new Error('Error getting campaign sequences in getCampaignSequences - ', err);
        });
    }

    return getCampaignSequences();
};
