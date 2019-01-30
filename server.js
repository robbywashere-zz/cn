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
  middlewares.forEach(mw => app.use(mw))
  app.use(ErrorHandler());
  return app;
}

async function Server(app = BaseServer()) {
  await dbSync(true);
  app.use(cookieSession({
    name: 'session',
    keys: [config.get('APP_SECRET')],
    maxAge: 1 * 60 * 60 * 1000 // 1 hour
  }))
  app.use('/api', PublicRoutes(), ProtectedRoutes());
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