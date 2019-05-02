"use strict";
module.exports = function(sequelize, DataTypes) {
  var dripsequence = sequelize.define(
    "dripsequence",
    {
      send_after_days: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      display_order: {
        type: DataTypes.INTEGER,
        defaultValue: 999
      }
    },
    {
      classMethods: {
        associate: function(models) {
          // associations can be defined here
          dripsequence.belongsTo(models.drip);
          dripsequence.belongsTo(models.template);
          dripsequence.belongsTo(models.user);
        }
      }
    }
  );
  return dripsequence;
};
