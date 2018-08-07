'use strict';
module.exports = function (sequelize, DataTypes) {
    var campaignsequence = sequelize.define('campaignsequence', {        
        emailSubject: DataTypes.STRING,
        emailBody: DataTypes.TEXT,
        emailBodyDesign: DataTypes.TEXT,
        type: DataTypes.STRING,        
        sequenceday: DataTypes.INTEGER
    }, {
            classMethods: {
                associate: function (models) {
                    // associations can be defined here                     
                    campaignsequence.belongsTo(models.campaign, { foreignKeyConstraint: true });                   
                }
            },
            indexes: [                
                {
                    fields: ['campaignId']
                }
            ]
        });
    return campaignsequence;
};
