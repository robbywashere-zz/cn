const Sequelize = require('sequelize');
const {
  UUID,
  UUIDV4
} = Sequelize;

module.exports = {
  Name: 'Attachment',
  Properties: {
    uuid: {
      type: UUID,
      defaultValue: UUIDV4,
      // primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
    },
    uri: {
      type: Sequelize.STRING,
    },
    upload_uri: {
      type: Sequelize.VIRTUAL,
    }
  },
  Hooks: {
    async afterCreate(attachment) {
      await new Promise(rs => setTimeout(rs, 0))
      attachment.upload_uri = "https://upload-------here.com/placeholder?x=0"
    }
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