const {
  Team,
  User
} = require('../../models');
const {
  TeamFactory,
  NoteFactory,
  UserFactory
} = require('../helpers');
const assert = require('assert');
const dbSync = require('../../db/sync');

describe('Team model', () => {

  beforeEach(() => dbSync(true))

  it(`- should respond to #.create({})`, async () => {
    const team = await Team.create({});
    assert(team instanceof Team);
  });


  it(`- should respond to #.reloadWithNotes() and have-many Notes`, async () => {

    const team = await TeamFactory();

    await NoteFactory({
      TeamId: team.id
    });

    await team.reloadWithNotes();

    assert.equal(team.Notes.length, 1);

  })

  it(`- should respond to #.addUser(<UserInstance>)`, async () => {

    const user = await UserFactory();
    const team = await Team.create({});

    assert(user);
    assert(team);

    await team.addUser(user);

    await team.reload({
      include: [User]
    });

    assert(team.Users[0]);

    assert(team.Users[0].id, user.id);

  });

})