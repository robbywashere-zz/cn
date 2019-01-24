const Sequelize = require('sequelize');
const Haikunator = require('haikunator');
const haikunator = new Haikunator();

module.exports = {
  Name: 'Team',
  Properties: {
    name: {
      type: Sequelize.STRING,
      defaultValue: () => haikunator.haikunate()
    },
  },
  Scopes: {
    belongingTo(userId) {
      userId = userId.id || userId;
      return {
        where: {
          '$Users.UserTeam.UserId$': userId
        },
        include: [{
          model: this.sequelize.models.User,
          through: {
            attributes: [],
          }
        }]
      }
    }

  },
  Init({
    User,
    Note
  }) {
    this.hasMany(Note);

    this.addScope('withUsers', {
      include: [{
        model: User,
      }]
    });
    this.belongsToMany(User, {
      through: 'UserTeam',
    });
    this.addScope('withNotes', {
      include: [Note]
    });
  },
  ScopeFunctions: true,
}