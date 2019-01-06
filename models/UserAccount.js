
const sequelize = require('sequelize');

const { ENUM } = sequelize;

module.exports = {
  Name: 'UserAccount',
  Properties: {
  },
  Init({ User, Account }){
    this.belongsTo(User);
    this.belongsTo(Account);
  
  }
};
