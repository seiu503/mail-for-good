'use strict';
module.exports = function (sequelize, DataTypes) {
    var listsubscribersrelation = sequelize.define('listsubscribersrelation', {        
    }, {
            classMethods: {
                associate: function (models) {
                    // associations can be defined here
                    listsubscribersrelation.belongsTo(models.list);
                    listsubscribersrelation.belongsTo(models.listsubscriber);
                }
            }
        });
    return listsubscribersrelation;
};
