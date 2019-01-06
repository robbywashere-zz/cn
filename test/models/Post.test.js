const { Note, Account, User } = require('../../models');
const { UserAccountFactory, AccountFactory } = require('../helpers');
const assert = require('assert');
const dbSync = require('../../db/sync');

describe('Note model', ()=>{

  beforeEach(()=>dbSync(true))

  it(`- should respond to .create({ AccountId:<AccountInstance>.id }) `, async ()=>{
      const account = await Account.create({});
      await Note.create({ AccountId: account.id });
  })

  it(`- should reject .create({}) with SequelizeValidationError `, async ()=>{
    try {
      await Note.create({});
    } catch(e) {
      assert.equal(e.name, 'SequelizeValidationError')
    }
  });


})
