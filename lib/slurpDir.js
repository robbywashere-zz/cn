const { readdirSync, lstatSync } = require('fs');
module.exports = function (dir, readFile = require) {
  return fn => readdirSync(dir)
    .filter(file => lstatSync(`${dir}/${file}`).isFile() && !/^\.|^_|index.js/.test(file))
    .map(file => fn(require(`${dir}/${file}`)));
};
