const bcrypt = require('bcrypt');
const { omit } = require('lodash');
const Sequelize = require('sequelize');
const { Op } = Sequelize;

module.exports ={
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
    }
  },
  Init({ Account, Note }) {
    this.belongsToMany(Account, { 
      through: 'UserAccount', 
    });
    this.addScope('withNotes', {
      include: [ { model: Account, include: [ { model: Note } ]  }] 
    });
  },
  ScopeFunctions: true,
  Hooks: {
    async beforeCreate(user) {
      user.password = await bcrypt.hash(user.password, 10);
    },
    async afterCreate(user) {
      const { Account }  = this.sequelize.models;
      if (!user.Accounts || !user.Accounts.length) {
        const account = await Account.create();
        return await user.addAccount(account);
      }
    }
  },
  Methods: {
    async getNotes(forceReload){
      if ((forceReload) || (this.Accounts && !this.Accounts[0].Notes)) {
        await this.reloadWithNotes();
      } 
      const notes = [];
      this.Accounts.forEach(a=>notes.push(...a.Notes));
      return notes;
    },
    async validatePassword(password){
      const result = await bcrypt.compare(password, this.password);
      return result;
    },
  }
}

