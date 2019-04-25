"use strict";
module.exports = function(sequelize, DataTypes) {
  var dripsequencesenthistory = sequelize.define(
    "dripsequencesenthistory",
    {
      email: DataTypes.STRING,
      sequence_no: DataTypes.INTEGER,
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
