const Router = require('express');
const {
  BadRequest
} = require('http-errors');
const {
  validationResult
} = require('express-validator/check');
class Validator extends Router {
  static new(...args) {
    return new Validator(...args);
  }
  constructor(schema) {
    super();
    this.use(schema, Validator.respond);
  }
  static respond(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequest(errors.array());
    }
    next();
  }
}
exports.Validator = Validator;