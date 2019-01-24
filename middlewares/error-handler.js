const logger = require('../lib/logger');
const config = require('config');
const ErrorHandler = () => (err, req, res, next) => {
  const status = err.status || 500;
  if (config.get('NODE_ENV') === 'development' || status === 500) logger.error(err);
  if (res.headersSent) {
    return next(err)
  }
  res.status(status);
  res.send({
    error: {
      message: err.message,
      status
    }
  })
}

module.exports = {
  ErrorHandler
};