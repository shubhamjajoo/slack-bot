'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Authorizations extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Authorizations.init({
    token: DataTypes.STRING,
    id: {
      primaryKey: true,
      type: DataTypes.STRING,
    }
  }, {
    sequelize,
    modelName: 'Authorizations',
  });
  return Authorizations;
};