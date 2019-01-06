const { User, Account, Note } = require('../../models');
const { UserAccountFactory, AccountFactory } = require('../helpers');
const assert = require('assert');
const dbSync = require('../../db/sync');

describe('User model', ()=>{

  beforeEach(()=>dbSync(true))

  it (`- should respond to #.create({ username, password })
      - create an instane of User
      - should create an Account for User`, async ()=>{
        const user = await User.create({
          username: "roy",
          password: "gbiv"
        });
        assert(user instanceof User);
        await user.reload({ include: { all: true, nested: true }});
        assert(user.Accounts.length,1)
      });


  it ('- should throw SequelizeValidationError on #.create(), when username and/or password is not provided', async ()=>{

    try {
      await User.create({})
    } catch(err) {
      assert.equal(err.name, "SequelizeValidationError")
      assert(err.errors.length);
      assert(err.errors.some( (e)=> e.path === "username" ))
      assert(err.errors.some( (e)=> e.path === "password" ))
    }

  });


  it (`- should omit password field on #.serialize`, async ()=>{
    const user = await User.create({
      username: "roy",
      password: "gbiv"
    });
    assert.equal(user.serialize().password, undefined)
  });


  it('- should respond to #.getNotes(), and have-many Notes through Accounts', async ()=>{
  
    const { account, user } = await UserAccountFactory();

    const account2 = await AccountFactory();

    const p1 = await Note.create({ AccountId: account.id });

    const p2 = await Note.create({ AccountId: account.id });

    const p3 = await Note.create({ AccountId: account2.id });

    await account2.addUser(user);

    const userNotes = await user.getNotes();
      
    assert.equal(userNotes.length, 3);

  });



})
