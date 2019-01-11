const Sequelize = require('sequelize');
const {
  database,
  username,
  password,
  dialect,
  logging,
  host
} = require('./config')

const sequelize = new Sequelize(database, username, password, {
  host,
  dialect,
  logging,
  operatorsAliases: false,
});

module.exports = sequelize;