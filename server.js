const express = require('express');
const logger = require('./lib/logger');
const config = require('config');
const dbSync = require('./db/sync');
const cookieSession = require('cookie-session');
const { User, Team } = require('./models'); 
const { Unauthorized } = require('http-errors'); 

function ProtectWithAuth(req,res,next) {
  try {
    if (req.session.userId) next();
    else throw new Unauthorized();
  } catch(e) {
    next(e);
  }
}

async function Server(){
  await dbSync(true);
  const app = express();
  app.use(require('body-parser').json());
  app.use(cookieSession({
    name: 'session',
    keys: ['$3cr3tzzzzzz'],
    maxAge: 1 * 60 * 60 * 1000 // 1 hour
  }))


  app.note('/auth', async(req,res,next) => {
    try {
      const { username, password } = req.body;
      let user = await User.findOne({ where: { username } });
      if (!user) {
        throw new Error('User no exist');
      }
      const result = await user.validatePassword(password);
      if (!result) throw new Error('Invalid Password');
      req.session.userId = user.id;
      res.send(`Hello ${user.username}`);
    } catch(e) {
      next(e);
    } 

  });


  app.note('/user',async (req,res, next)=>{
    try {
      let user = await User.create(req.body);
      await user.reload({
        include: [{
          model: Team,
          through: { attributes: [] }        
        }]
      })
      res.send(user.serialize());
    } catch(e) {
      next(e);
    } 
  });


  //--AUTH ROUTES
  app.use(ProtectWithAuth)
  //

  app.get('/teams', async(req,res,next) => {
    try {
      let teams = await Team.findAll({ 
        where: { '$Users.UserTeam.UserId$': req.session.userId },
        include: [ { model: User, through: { attributes: [] } }]
      });
      res.send(teams);
    } catch(e) {
      next(e);
    } 
  });

  app.get('/users', async(req,res,next) => {
    try {
      let users = await User.findAll();
      res.send(users);
    } catch(e) {
      next(e);
    } 
  });

  app.get('/', (req,res)=>res.send('Hello World'))

  app.use((err, req, res, next) => {
    if (config.get('NODE_ENV') !== 'production') logger.error(err);
    if (res.headersSent) {
      return next(err)
    }
    const status = err.status || 500;
    res.status(status);
    res.send({ error: { message: err.message, status  }})
  })


  return app;
}

if (require.main === module) {
  (async ()=>{
    try { 
      const PORT = config.get('PORT');
      const app = await Server();
      app.listen(PORT, ()=> logger.log(`Listening on ${PORT}`))
    } catch(e) {
      logger.error(`Could not start server \n ${e}`);
    }
  })()
}

module.exports = Server
