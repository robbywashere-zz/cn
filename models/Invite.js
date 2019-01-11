const Sequelize = require('sequelize');
const crypto = require('crypto');
const {
  promisify
} = require('util');
module.exports = {
  Name: 'Invite',
  Properties: {
    email: {
      type: Sequelize.STRING,
      allowNull: false
    },
    token: {
      type: Sequelize.STRING
    },
  },
  Hooks: {
    async beforeCreate(invite) {
      invite.token = (await promisify(crypto.randomBytes)(64)).toString();
    }
  },
  ScopeFunctions: true,
  Scopes: {},
  Init({
    Team,
  }) {
    this.belongsTo(Team, {
      foreignKey: {
        allowNull: false
      }
    });
  }
}