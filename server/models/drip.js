'use strict';
module.exports = function (sequelize, DataTypes) {
    var drip = sequelize.define('drip', {
        slug: DataTypes.STRING,        
        userId: DataTypes.INTEGER,        
        name: DataTypes.STRING,
        startdatetime: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
        sequences: DataTypes.TEXT,     
        status: { type: DataTypes.STRING, defaultValue: 'draft' },
        sequenceCount: { type: DataTypes.INTEGER, defaultValue: 0 }        
    }, {
            classMethods: {
                associate: function (models) {
                    // associations can be defined here
                    drip.belongsTo(models.user);
                    drip.belongsTo(models.list);
                    drip.hasMany(models.campaignsubscriber);
                    drip.hasOne(models.campaignanalytics);
                    drip.hasMany(models.campaignsequence);
                }
            }
        });
    return drip;
};
