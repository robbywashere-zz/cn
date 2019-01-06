const { UserAccountFactory } = require('./');
const assert = require('assert');
const { Account, User } = require('../../models');
const dbSync = require('../../db/sync');

describe('test helpers',()=>{

  beforeEach(()=>dbSync(true))

  it('- should respond to #.UserAccountFactory()', async ()=>{
    const { account, user } = await UserAccountFactory();
    assert(account instanceof Account);
    assert(user instanceof User);
  })


})
