const {
  User,
  Note,
  Team,
  UserTeam
} = require('../../models');
const {
  Op
} = require('sequelize');
const {
  UserTeamFactory,
  UserFactory,
  TeamFactory,
  uniq
} = require('../helpers');
const assert = require('assert');
const dbSync = require('../../db/sync');

describe('User model', () => {

  beforeEach(() => dbSync(true))

  describe('static methods', function () {

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

    it('- should  #.getTeamMembers(user_id)', async () => {

      const team = await TeamFactory();
      const excludeUser = await UserFactory();
      const user = await UserFactory();
      const teamMember = await UserFactory();
      await team.addUser(user);
      await team.addUser(teamMember);

      await team.reloadWithUsers();
      const wantedTeamIds = team.Users.toJSON().map(u => u.id);
      const teamMembers = await User.teamMembers(user.id);
      assert.deepEqual(wantedTeamIds, teamMembers.map(tm => tm.id));
    });
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

  });

  describe('instance methods', function () {

    it(`- should omit password field on #.serialize`, async () => {
      const user = await User.create({
        username: "roy",
        password: "gbiv",
        email: uniq.email
      });
      assert.equal(user.serialize().password, undefined)
      assert.equal(user.serialize().username, "roy")
    });


    it('- should #.getTeamMembers()', async () => {

      const team = await TeamFactory();
      const user = await UserFactory();
      const teamMember = await UserFactory();
      await team.addUser(user);
      await team.addUser(teamMember);
      const members = await user.getTeamMembers();
      assert.equal(members[0].id, teamMember.id);
    });


  });








})