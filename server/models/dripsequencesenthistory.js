"use strict";
module.exports = function(sequelize, DataTypes) {
  var dripsequencesenthistory = sequelize.define(
    "dripsequencesenthistory",
    {
      email: DataTypes.STRING,
      send_at: DataTypes.DATE,
      is_sent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      status: DataTypes.STRING
    },
    {
      classMethods: {
        associate: function(models) {
          dripsequencesenthistory.belongsTo(models.user);
          dripsequencesenthistory.belongsTo(models.dripsequence);
          dripsequencesenthistory.belongsTo(models.listsubscribersrelation);
          dripsequencesenthistory.belongsTo(models.drip);
          dripsequencesenthistory.belongsTo(models.template);
          dripsequencesenthistory.belongsTo(models.list);
        }
      }
    }
  );
  return dripsequencesenthistory;
};
