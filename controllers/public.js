const {
  Validator
} = require("../lib/validator");
const Router = require('express');
const {
  User,
} = require('../models');
const {
  check,
  body
} = require('express-validator/check');
const {
  Unauthorized,
  BadRequest
} = require('http-errors');
const {
  Create,
  Model
} = require('./shared')

function PublicRoutes(router = new Router()) {

  let ValidateAuth = Validator.new([body('username').isString(), body('password').isString()]);
  router.post('/auth', ValidateAuth, async (req, res, next) => {
    try {
      const {
        username,
        password
      } = req.body;
      let user = await User.findOne({
        where: {
          username
        }
      });
      if (!user) {
        throw new Unauthorized();
      }
      const result = await user.validatePassword(password);
      if (!result) throw new Unauthorized();
      req.session = {
        ...req.session,
        userId: user.id
      };
      res.send(user.serialize());
    } catch (e) {
      next(e);
    }

  });


  router.use('/user', Model(User), Create());

  return router;
}

module.exports = {
  PublicRoutes,
}