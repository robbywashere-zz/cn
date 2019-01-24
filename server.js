const express = require('express');
const logger = require('./lib/logger');
const config = require('config');
const dbSync = require('./db/sync');
const cookieSession = require('cookie-session');
const {
  ErrorHandler
} = require('./middlewares/error-handler');
const {
  ProtectedRoutes
} = require('./controllers/protected');
const {
  PublicRoutes
} = require('./controllers/public');



function BaseServer(...middlewares) {
  const app = express();
  app.use(require('body-parser').json());
  app.use(cookieSession({
    name: 'session',
    keys: ['$3cr3tzzzzzz'],
    maxAge: 1 * 60 * 60 * 1000 // 1 hour
  }))
  middlewares.forEach(mw => app.use(mw))
  app.use(ErrorHandler());
  return app;
}

async function Server(app = BaseBase()) {
  await dbSync(true);
  app.use('/', PublicRoutes());
  app.use('/', ProtectedRoutes());
  app.use(ErrorHandler());
  return app;
}

if (require.main === module) {
  (async () => {
    try {
      const PORT = config.get('PORT');
      const app = await Server();
      app.listen(PORT, () => logger.log(`Listening on ${PORT}`))
    } catch (e) {
      logger.error(`Could not start server \n ${e}`);
    }
  })()
}

module.exports = {
  Server,
  BaseServer
}