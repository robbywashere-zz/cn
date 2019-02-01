const Router = require('express');
const {
  Team
} = require('../models');
const {
  TeamScope
} = require('./shared')
const {
  FindAll,
  FindById
} = require('./shared')

module.exports = function Tags(router = new Router()) {
  router.use(FindAll());
  router.use(FindById());
  return router;
}