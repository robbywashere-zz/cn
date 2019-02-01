const {
  Router
} = require('express');
const {
  ValidationError
} = require("sequelize");

const {
  Unauthorized,
  BadRequest
} = require('http-errors');

function Model(model) {
  return (req, res, next) => {
    req.model = model;
    next();
  }
}

function TeamScope(param = (req) => req.query.teamId) {
  return async (req, res, next) => {
    if (req.query.teamId) req.scope = (req.scope || req.model).forTeamFn(param(req));
    next();
  };
}

function UserScope(param = (req) => req.session.userId) {
  return async (req, res, next) => {
    req.scope = (req.scope || req.model).forUserFn(param(req));
    next();
  };
}

function FindById(router = new Router()) {
  router.get('/:id', async (req, res, next) => {
    try {
      let instance = await req.scope.findById(req.params.id);
      res.send(instance.serialize());
    } catch (e) {
      next(e);
    }
  });
  return router;
}

function Create(router = new Router()) {
  router.post('/', async (req, res, next) => {
    try {
      let instance = await req.model.create(req.body);
      res.send(instance.serialize());
    } catch (e) {
      if (e instanceof ValidationError) {
        return next(new BadRequest(e.message));
      }
      return next(e);
    }
  });
  return router;
}

function FindAll(router = new Router()) {
  router.get('/', async (req, res, next) => {
    try {
      let instances = await req.scope.findAll();
      res.send(instances.serialize());
    } catch (e) {
      next(e);
    }
  });
  return router;

}
module.exports = {
  FindById,
  FindAll,
  Model,
  UserScope,
  TeamScope,
  Create
}