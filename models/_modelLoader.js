const {
  set, get, clone, camelCase,
} = require('lodash');
const DB = require('../db');

const { pickBy, isArray } = require('lodash');
const sequelize = require('sequelize');
const slurpDir = require('../lib/slurpDir');


function newRegistry(){
  return ({ inits: {}, models: {}});
}


function loadObject(model, registry) {
  if (model.Init) registry.inits[model.Name] = model.Init;
  model.Properties = model.Properties || {};

  const modelClass = DB.define(model.Name, Object.assign({}, model.Properties), {
    tableName: model.TableName,
    validate: model.Validate,
    hooks: model.Hooks,
    scopes: model.Scopes,
    defaultScope: model.DefaultScope,
  });

  // Instance Methods
  //
  Object.assign(modelClass.prototype, Object.assign({}, model.Methods));

  modelClass._scopeFns = !!model.ScopeFunctions;

  // update by id
  modelClass.updateById = function updateById(id, ups, q = {}, o) {
    q.where = { ...q.where, id };
    return modelClass.update(ups, q, o);
  };

  // Omit and Permit methods and Properties

  function mapItted(name) {
    return Object.entries(model.Properties).reduce((p, [k, v]) => {
      if (v[name]) p[k] = true;
      return p;
    }, {});
  }

  modelClass.omitted = mapItted('omit');

  modelClass.permitted = mapItted('permit');

  // Permit Omit and Sanitizations for controller

  modelClass.sanitizeParams = function sanitizeParams(obj) {
    return pickBy(obj, (v, k) => modelClass.permitted[k]);
  };

  modelClass.prototype.permittedSet = function permittedSet(obj) {
    return this.set(modelClass.sanitizeParams(obj));
  };

  modelClass.prototype._getSafe = function _getSafe(key) {
    return modelClass.omitted[key] ? undefined : this.get(key);
  };

  function serialize() {
    const dv = clone(this.dataValues);
    return Object.entries(dv).reduce((p, [key, value]) => {
      if (Array.isArray(value)) {
        p[key] = value.map(v => (typeof v.serialize === 'function' ? v.serialize() : this._getSafe(key)));
      } else {
        p[key] = this._getSafe(key);
      }
      if (p[key] === undefined) delete p[key];
      return p;
    }, {});
  }

  modelClass.prototype.serialize = serialize;

  Object.assign(modelClass, Object.assign({}, model.StaticMethods));
  registry.models[model.Name] = modelClass;
  return registry;
}

function initObjects(modelRegistry) {
  Object.keys(modelRegistry.models).forEach((name) => {
    const model = modelRegistry.models[name];

    if (modelRegistry.inits && modelRegistry.inits[name]) { modelRegistry.inits[name].bind(model)(modelRegistry.models); }

    const scopes = get(model, 'options.scopes');

    if (typeof scopes !== 'undefined' && model._scopeFns) {
      Object.keys(scopes).forEach((k) => {
        let fn;
        let fnById;
        if (typeof scopes[k] === 'function') {
          fn = function (arg, opts) {
            return this.scope({ method: [k, arg] }).findAll(opts);
          };
          fnById = function (arg, id, opts) {
            return this.scope({ method: [k, arg] }).findById(id, opts);
          };
          model[`${k}Fn`] = function (arg) {
            return this.scope({ method: [k, arg] });
          };
        } else {
          fn = function (opts) {
            return this.scope(k).findAll(opts);
          };
          fnById = function (id, opts) {
            return this.scope(k).findById(id, opts);
          };
        }

        // scopes prefixed with 'with', will be givin a reload<withScope> method
        if (k.substr(0, 4) === 'with') {
          model.prototype[camelCase(`reload ${k}`)] = function (opts) {
            return this.reload(scopes[k]);
          };
        }

        model[k] = fn.bind(model);
        model[`${k}ForId`] = fnById.bind(model);
      });
    }
  });
}

function bootstrap(modelsDir) {
  const registry = newRegistry();
  slurpDir(modelsDir)(model => loadObject(model, registry));
  initObjects(registry);
  return registry.models;
}

bootstrap.loadObject = loadObject;
bootstrap.initObjects = initObjects;
bootstrap.newRegistry = newRegistry;

module.exports = bootstrap;
