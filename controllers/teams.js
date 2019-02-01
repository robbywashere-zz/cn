const Router = require('express');
const {
  FindAll,
  FindById
} = require('./shared');
module.exports = function Teams(router = new Router()) {
  router.use(FindAll());
  router.use(FindById());
  return router;
}