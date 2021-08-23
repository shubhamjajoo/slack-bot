'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Statuses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Statuses.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    timing: DataTypes.STRING,
    start_time: DataTypes.INTEGER,
    end_time: DataTypes.INTEGER,
    team_id: {
      type: DataTypes.STRING,
      references: {
        model: 'teams',
        key: 'team_id'
      }
    },
    user_id: {
      type: DataTypes.STRING,
      references: {
        model: 'users',
        key: 'user_id'
      }
    }
  }, {
    sequelize,
    modelName: 'Statuses',
  });
  return Statuses;
};