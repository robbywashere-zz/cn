const Sequelize = require('sequelize');
const crypto = require('crypto');
const {
  promisify
} = require('util');
module.exports = {
  Name: 'Recover',
  Properties: {
    token: {
      type: Sequelize.STRING
    },
  },
  Hooks: {
    async beforeCreate(Recover) {
      Recover.token = (await promisify(crypto.randomBytes)(64)).toString();
    }
  },
  ScopeFunctions: true,
  Scopes: {},
  Init({
    User,
  }) {
    this.belongsTo(User, {
      foreignKey: {
        allowNull: false
      }
    });
  }
}