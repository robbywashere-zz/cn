const Sequelize = require('sequelize');
const Haikunator = require('haikunator');
const haikunator = new Haikunator();

module.exports = {
  Name: 'Note',
  Properties: {
    title: {
      type: Sequelize.STRING,
      defaultValue: ()=> haikunator.haikunate()
    },
    body: {
      type: Sequelize.TEXT,
    },
  },
  Init({ Account, User, UserAccount }){
    this.belongsTo(Account, { foreignKey: { allowNull: false }});
    this.belongsToMany(User, {
      through: "AccountUser",
      include: [ { model: UserAccount, as: "AccountUser" } ]
    });
  }
}
