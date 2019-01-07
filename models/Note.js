const Sequelize = require('sequelize');
const Haikunator = require('haikunator');
const haikunator = new Haikunator();
const {
  Op
} = require('sequelize');

module.exports = {
  Name: 'Note',
  Properties: {
    slug: {
      type: Sequelize.STRING,
      defaultValue: () => haikunator.haikunate()
    },
    title: {
      type: Sequelize.STRING,
    },
    body: {
      type: Sequelize.TEXT,
    },
    trash: {
      type: Sequelize.BOOLEAN
    }
  },
  ScopeFunctions: true,
  Scopes: {
    userRead(User) {
      const UserId = User.id || User;
      return {
        include: [{
          model: this.sequelize.models.Read,
          where: {
            UserId
          }
        }]
      }
    },
  },
  Init({
    Attachment,
    Team,
    User,
    Edit,
    Tag,
    UserTeam,
    Read,
  }) {


    this.addScope('withAllReads', {
      include: [{
        model: Read
      }]
    })

    this.addScope('withTags', {
      include: [{
        model: Tag,
      }]
    });

    this.addScope('withAttachments', {
      include: [{
        model: Attachment,
      }]
    });

    this.addScope('withAll', {
      include: [{
        model: Attachment,
        Tag,
        Edit
      }]
    });


    this.hasMany(Read);
    this.hasMany(Attachment);
    this.hasMany(Edit);
    //this.belongsTo(User);
    this.belongsTo(Team, {
      foreignKey: {
        allowNull: false
      }
    });


    this.belongsToMany(Tag, {
      through: {
        model: "NoteTag",
      }
    });
    this.belongsToMany(User, {
      through: "TeamUser",
      include: [{
        model: UserTeam,
        as: "TeamUser"
      }]
    });
  },
  StaticMethods: {
    unread({
      User: user,
      Team: team
    }) {
      const UserId = user.id || user;
      const TeamId = team.id || team;
      const {
        Read,
        Team,
        User
      } = this.sequelize.models;

      return (TeamId !== undefined ? this.scope({
        where: {
          TeamId
        }
      }) : this).findAll({
        where: {
          '$Team.Users.id$': {
            [Op.eq]: UserId
          },
          [Op.or]: [{
              '$Reads.UserId$': {
                [Op.ne]: UserId
              }
            },
            {
              '$Reads.UserId$': null
            },
          ],
        },
        include: [{
            model: Team,
            include: User
          },
          {
            model: Read,
            required: false,
            where: {
              '$Reads.UserId$': {
                [Op.eq]: UserId
              },
            },
          },
        ],
      });
    }
  },
  Methods: {
    permitsUser(User) {
      if (this.UserTeam) {}
    },
    async getUsers(opts = {}) {
      const {
        User
      } = this.sequelize.models
      return ((await this.getTeam({
        include: [{
          model: User,
          attributes: ['id'],
          ...opts
        }]
      })) || {
        Users: []
      }).Users
    },
    sendToTrash() {
      return this.update({
        trash: true
      });
    },
    markAsReadBy(User) {
      const {
        Read
      } = this.sequelize.models;
      return Read.create({
        UserId: User.id || User,
        NoteId: this.id
      });
    }
  }
}