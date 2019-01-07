const { UserTeamFactory } = require('./');
const assert = require('assert');
const { Team, User } = require('../../models');
const dbSync = require('../../db/sync');

describe('test helpers',()=>{

  beforeEach(()=>dbSync(true))

  it('- should respond to #.UserTeamFactory()', async ()=>{
    const { team, user } = await UserTeamFactory();
    assert(team instanceof Team);
    assert(user instanceof User);
  })


})
