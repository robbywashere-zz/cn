const sequelize = require('sequelize');
const {
  Op
} = sequelize;

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
  Hooks: {
    beforeCreate(Tag) {
      Tag.name = Tag.name.toUpperCase();
    }
  },
  Scopes: {
    forTeam(team) {
      const TeamId = team.id || team;
      const {
        User,
        Note,
        Team
      } = this.sequelize.models;
      return {
        where: {
          "$Notes.Team.id$": TeamId
        },
        attributes: ['id', 'name'],
        include: [{
          model: Note,
          attributes: ['id'],
          required: true,
          through: {
            attributes: []
          },
          include: [{
            attributes: ['id'],
            model: Team,
            required: true,
          }]
        }]
      }
    },
    forUser(user) {
      const UserId = user.id || user;
      const {
        User,
        Note,
        Team
      } = this.sequelize.models;
      return {
        where: {
          "$Notes.Team.Users.id$": UserId
        },
        attributes: ['id', 'name'],
        include: [{
          model: Note,
          attributes: ['id'],
          required: true,
          through: {
            attributes: []
          },
          include: [{
            attributes: ['id'],
            model: Team,
            required: true,
            include: [{
              attributes: ['id'],
              through: {
                attributes: []
              },
              model: User,
              required: true,
            }]
          }]
        }]
      }
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