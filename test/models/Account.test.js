const { Account, User } = require('../../models');
const { AccountFactory, NoteFactory, UserFactory } = require('../helpers');
const assert = require('assert');
const dbSync = require('../../db/sync');

describe('Account model', ()=>{

  beforeEach(()=>dbSync(true))

  it (`- should respond to #.create({})`, async ()=>{
    const account = await Account.create({});
    assert(account instanceof Account);
  });


  it (`- should respond to #.reloadWithNotes() and have-many Notes`, async ()=> {
  
    const account = await AccountFactory();

    const note = await NoteFactory({ AccountId: account.id });

    await account.reloadWithNotes();

    assert.equal(account.Notes.length, 1);
  
  })

  it (`- should respond to #.addUser(<UserInstance>)`, async ()=>{

    const user = await UserFactory();
    const account = await Account.create({});

    assert(user);
    assert(account);
    
    await account.addUser(user);

    await account.reload({ include: [User] });

    assert(account.Users[0]);

    assert(account.Users[0].id, user.id);

  });

})
