const Sequelize = require('sequelize');

module.exports = {
  Name: 'Attachment',
  Properties: {
    name: {
      type: Sequelize.STRING,
    },
    uri: {
      type: Sequelize.STRING,
    },
  },
  ScopeFunctions: true,
  Init({
    Note,
  }) {
    this.belongsTo(Note, {
      foreignKey: {
        allowNull: false
      }
    });
  }
}