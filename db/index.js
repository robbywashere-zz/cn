const Sequelize = require('sequelize');
const config = require('config');
const dbConfig = require('./config')

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  logging: dbConfig.logging,
  operatorsAliases: false,
});

module.exports = sequelize;
