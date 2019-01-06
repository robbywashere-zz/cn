require('../models');
const config = require('config');
const logger = require('../lib/logger');
const Promise = require('bluebird');
const db = require('./');

module.exports = async function syncDb(force = false) {
  try {
    await db.sync({ force });
  } catch (e) {
    if (e.name === 'SequelizeConnectionRefusedError') {
      logger.error('Could not connect to DB, retrying ...');
      await Promise.delay(5000);
      return syncDb({ force });
    }
    throw e;
  }
};

