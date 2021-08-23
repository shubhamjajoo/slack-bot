'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  User.init({
    real_name: DataTypes.STRING,
    email: DataTypes.STRING,
    user_name: DataTypes.STRING,
    image_url: DataTypes.STRING,
    time_zone: DataTypes.STRING,
    team_id: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};