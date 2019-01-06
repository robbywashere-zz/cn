const Sequelize = require('sequelize');
const Haikunator = require('haikunator');
const haikunator = new Haikunator();

module.exports = {
  Name: 'Account',
  Properties: {
    name: {
      type: Sequelize.STRING,
      defaultValue: ()=> haikunator.haikunate()
    },
  },
  Init({ User, Note }){
    this.hasMany(Note);
    this.belongsToMany(User, { 
      through: 'UserAccount', 
      joinTableAttributes: [],
      attributes: [] 
    });
    this.addScope('withNotes', { include: [ Note ] });
  },
  ScopeFunctions: true,
}
