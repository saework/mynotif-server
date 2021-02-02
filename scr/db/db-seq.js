const { Sequelize, Model } = require('sequelize');
const logger = require('../services/logger-config');
const config = require('../../config.js');

const sequelizeConfig = config.sequelizeConfig;

const sequelize = new Sequelize(sequelizeConfig.DBName, sequelizeConfig.DBLogin, sequelizeConfig.DBPass, {
  dialect: 'mysql',
  define: {
    timestamps: false,
  },
});

class PersBD extends Model {}
PersBD.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    bdData: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    hash: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    jwtHash: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: sequelizeConfig.modelName,
  }
);

try {
  sequelize.authenticate();
  logger.info('DB-seq - Соединение с БД установлено');
} catch (error) {
  logger.error(`DB-seq - Ошибка: ${error}`);
}

module.exports = PersBD;
