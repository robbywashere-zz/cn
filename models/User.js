const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');
const {
  Op
} = Sequelize;

module.exports = {
  Name: 'User',
  Properties: {
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      omit: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
  },
  Init({
    Team,
    UserTeam,
    Note,
    User
  }) {
    this.belongsToMany(Team, {
      through: 'UserTeam',
    });

    this.belongsToMany(Note, {
      through: "TeamNotes",
      include: [{
        model: UserTeam,
        as: "TeamNotes",
        include: [{
          model: Note
        }]
      }]
    });


    this.addScope('withTeam', {
      include: [{
        model: Team,
      }]
    });
    this.addScope('withTeamNotes', {
      include: [{
        model: Team,
        include: [{
          model: Note
        }]
      }]
    });
  },
  ScopeFunctions: true,
  Hooks: {
    async beforeCreate(user) {
      user.password = await bcrypt.hash(user.password, 10);
    },
    async afterCreate(user) {
      const {
        Team
      } = this.sequelize.models;
      if (!user.Teams || !user.Teams.length) {
        const team = await Team.create();
        return await user.addTeam(team);
      }
    }
  },
  StaticMethods: {},
  Scopes: {
    withTeams(id) {
      return {
        where: {
          id
        },
        include: [{
          model: this.sequelize.models.Team,
        }]
      }
    },
    forUser(userId) {
      return {
        where: {
          "$Teams.Users.id$": userId
        },
        include: [{
          model: this.sequelize.models.Team,
          include: [{
            model: this.sequelize.models.User
          }]
        }]
      }
    }
  },
  Methods: {
    async getTeamMembers() {
      const {
        User
      } = this.sequelize.models;
      const teams = await this.getTeams({
        include: [{
          model: User, //User?
          where: {
            id: {
              [Op.ne]: this.id
            }
          }
        }]
      });
      return teams.reduce((users, team) => [...users, ...team.Users], []).filter(Boolean);
    },
    async getTeamNotes(forceReload) {
      if ((forceReload) || (this.Teams && !this.Teams[0].Notes)) {
        await this.reloadWithTeamNotes();
      }
      const notes = [];
      this.Teams.forEach(a => notes.push(...a.Notes));
      return notes;
    },
    async validatePassword(password) {
      return await bcrypt.compare(password, this.password);
    },
  }
}