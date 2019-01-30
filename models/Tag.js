const sequelize = require('sequelize');

module.exports = {
  Name: 'Tag',
  Properties: {
    name: {
      type: sequelize.STRING(16),
      validate: {
        len: [1, 16]
      },
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