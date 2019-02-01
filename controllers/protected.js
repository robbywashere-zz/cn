const Router = require('express');
const {
  Unauthorized,
} = require('http-errors');

const {
  Team,
  Tag,
  User,
  Note
} = require('../models');

const {
  UserScope,
  TeamScope,
  Model
} = require('./shared');

function ProtectWithAuth(req, res, next) {
  try {
    if (req.session.userId) next();
    else throw new Unauthorized();
  } catch (e) {
    next(e);
  }
}

function ProtectedRoutes(router = new Router()) {
  router.use(ProtectWithAuth)
  router.use('/notes', Model(Note), UserScope(), TeamScope(), require('./notes')())
  router.use('/teams', Model(Team), UserScope(), require('./teams')());
  router.use('/users', Model(User), UserScope(), TeamScope(), require('./users')())
  router.use('/tags', Model(Tag), UserScope(), TeamScope(), require('./tags')())
  router.get('/', (req, res) => res.send('Hello World'))
  return router;
}
module.exports = {
  ProtectedRoutes,
  ProtectWithAuth
}