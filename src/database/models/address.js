"use strict";
const { Model } = require("sequelize");
const { objectValidate } = require("../resource");

module.exports = (sequelize, DataTypes) => {
  class Address extends Model {
    static associate(models) {
      // define association here
      this.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
        onDelete: "CASCADE",
      });
    }
  }
  Address.init(
    {
      street: {
        type: DataTypes.STRING,
        defaultValue: "",
        validate:{
          is: objectValidate(/^[#.0-9a-zA-Z\s,-]+$/, "La dirección es invalida")
        }
      },
      city: {
        type: DataTypes.STRING,
        defaultValue: "",
      },
      province: {
        type: DataTypes.STRING,
        defaultValue: "",
        
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Address",
      paranoid: true,
    }
  );
  return Address;
};
