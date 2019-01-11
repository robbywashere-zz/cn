const {
  User,
  Note
} = require('../../models');
const {
  UserTeamFactory,
  TeamFactory,
  uniq
} = require('../helpers');
const assert = require('assert');
const dbSync = require('../../db/sync');

describe('User model', () => {

  beforeEach(() => dbSync(true))

  it(`- should respond to #.create({ username, password })
      - create an instance of User
      - should create an Team for User`, async () => {
    const user = await User.create({
      username: "roy",
      password: "gbiv",
      email: uniq.email
    });
    assert(user instanceof User);
    await user.reload({
      include: {
        all: true,
        nested: true
      }
    });
    assert(user.Teams.length, 1)
  });


  it('- should throw SequelizeValidationError on #.create(), when username and/or password is not provided', async () => {

    try {
      await User.create({})
    } catch (err) {
      assert.equal(err.name, "SequelizeValidationError")
      assert(err.errors.length);
      assert(err.errors.some((e) => e.path === "username"))
      assert(err.errors.some((e) => e.path === "password"))
    }

  });


  it(`- should omit password field on #.serialize`, async () => {
    const user = await User.create({
      username: "roy",
      password: "gbiv",
      email: uniq.email
    });
    assert.equal(user.serialize().password, undefined)
    assert.equal(user.serialize().username, "roy")
  });


  it('- should respond to #.getTeamNotes(), and have-many Notes through Teams', async () => {

    const {
      team,
      user
    } = await UserTeamFactory();

    const team2 = await TeamFactory();

    await Note.create({
      TeamId: team.id
    });

    await Note.create({
      TeamId: team.id
    });

    await Note.create({
      TeamId: team2.id
    });

    await team2.addUser(user);

    const userNotes = await user.getTeamNotes();

    assert.equal(userNotes.length, 3);

  });



})