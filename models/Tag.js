const sequelize = require('sequelize');

module.exports = {
  Name: 'Tag',
  Properties: {
    name: {
      type: sequelize.STRING,
      allowNull: false
    }
  },
  ScopeFunctions: true,
  Init({
    Note
  }) {
    this.belongsToMany(Note, {
      through: {
        model: "NoteTag",
      }
    });

    this.addScope('withNotes', {
      include: [{
        model: Note,
      }]
    });


  }
}