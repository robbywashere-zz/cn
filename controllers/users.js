const Router = require('express');
const {
  User
} = require('../models');
const {
  FindAll,
  FindById
} = require('./shared')

module.exports = function Users(router = new Router()) {
  router.use(FindAll());
  router.get('/profile', async (req, res, next) => {
    try {
      let users = await User.findById(req.session.userId);
      res.send(users.serialize());
    } catch (e) {
      next(e);
    }
  });
  router.use(FindById());
  return router;
}