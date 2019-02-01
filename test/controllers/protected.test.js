process.env.NODE_ENV = 'test'

const {
  UserFactory,
  TagFactory,
  TeamFactory,
  NoteFactory
} = require('../helpers');
const {
  BaseServer
} = require('../../server');
const request = require('supertest');
const dbSync = require('../../db/sync');
const {
  ProtectedRoutes
} = require('../../controllers/protected');
const assert = require('assert');

describe('protected routes', function () {

  let app;
  let authedUser;

  beforeEach(async function () {

    await dbSync(true);
    authedUser = await UserFactory();

    app = BaseServer((req, res, next) => {
      req.session = {
        userId: authedUser.id
      }
      next();
    }, ProtectedRoutes());
  })

  describe("GET /teams/:team_id", function () {

    it("should retrieve users team by team id", async function () {

      const otherTeam = await TeamFactory();

      const {
        Teams: teams
      } = await authedUser.reloadWithTeam();

      const teamId = teams[0].id;

      await otherTeam.addUser(authedUser);

      const res = await request(app)
        .get(`/teams/${teamId}`)
        .expect(200);

      assert.equal(res.body.id, teamId);
      const res2 = await request(app)
        .get(`/teams/${otherTeam.id}`)
        .expect(200);

      assert.equal(res2.body.id, otherTeam.id);

    })
  });

  describe("GET /teams", function () {
    it("should retrieve all of users teams AND exclude other teams", async function () {

      const team = await TeamFactory();
      await team.addUser(authedUser);
      const teamExcluded = await TeamFactory();
      await authedUser.reloadWithTeam();

      const res = await request(app)
        .get("/teams")
        .expect(200);

      assert.deepEqual(authedUser.Teams.map(t => t.id), res.body.map(t => t.id))
    });
  })

  describe("GET /notes/:note_id", function () {

    it("should retreive all notes for user by :note_id", async function () {

      await authedUser.reloadWithTeam();
      const noteA = await NoteFactory({
        TeamId: authedUser.Teams[0].id
      });
      const noteB = await NoteFactory({
        TeamId: authedUser.Teams[0].id
      });

      const res = await request(app)
        .get(`/notes/${noteA.id}`)
        .expect(200)

      assert.equal(res.body.id, noteA.id)

    })

  })
  describe("GET /notes", function () {
    it("should retreive all notes for authed user", async function () {
      const excludedTeam = await TeamFactory();
      await NoteFactory({
        TeamId: excludedTeam.id
      });
      await authedUser.reloadWithTeam();
      const note = await NoteFactory({
        TeamId: authedUser.Teams[0].id
      });
      const res = await request(app)
        .get("/notes")
        .expect(200)
      assert.equal(res.body.length, 1)
      assert.equal(res.body[0].id, note.id)
    });
  });
  describe("GET /notes?teamId=<teamId>", function () {
    it("should retreive all notes for authed user by TeamId", async function () {
      await (await TeamFactory()).addUser(authedUser);
      await authedUser.reloadWithTeam();
      const [teamAId, teamBId] = authedUser.Teams.map(t => t.id);
      const noteA = await NoteFactory({
        TeamId: teamAId
      });
      const noteB = await NoteFactory({
        TeamId: teamBId
      });
      const resA = await request(app)
        .get("/notes")
        .query({
          teamId: teamAId
        })
        .expect(200);
      assert.equal(resA.body.length, 1)
      assert.equal(resA.body[0].id, noteA.id)

      const resB = await request(app)
        .get("/notes")
        .query({
          teamId: teamBId
        })
        .expect(200);
      assert.equal(resB.body.length, 1)
      assert.equal(resB.body[0].id, noteB.id)

    });
  });
  describe("GET /notes?read=<true|false>", function () {
    let note;
    beforeEach(async () => {

      const excludedTeam = await TeamFactory();
      await NoteFactory({
        TeamId: excludedTeam.id
      });
      await authedUser.reloadWithTeam();
      note = await NoteFactory({
        TeamId: authedUser.Teams[0].id
      });

    })
    it("should retreive all read=true notes for authed user", async function () {
      await note.markAsReadBy(authedUser);
      const res = await request(app)
        .get("/notes?read=true")
        .expect(200)
      assert.equal(res.body.length, 1)
      assert.equal(res.body[0].id, note.id)
    });
    it("should retreive all read=false notes for authed user", async function () {
      const res = await request(app)
        .get("/notes?read=false")
        .expect(200)
      assert.equal(res.body.length, 1)
      assert.equal(res.body[0].id, note.id)
    });
  });

  describe("GET /notes?title=<string>?regexp=true", function () {
    it("should get notes by title query", async function () {
      const {
        Teams: teams
      } = await authedUser.reloadWithTeam();
      const note1 = await NoteFactory({
        TeamId: teams[0].id,
        title: "TITLE"
      });
      const note2 = await NoteFactory({
        TeamId: teams[0].id,
        title: "NOPE"
      });
      const found1 = await request(app).get("/notes").query({
        title: "TI.*",
        regexp: true
      }).expect(200);
      assert.equal(found1.body.length, 1);
      assert.equal(found1.body[0].id, note1.id);
    });
  })

  describe("GET /notes?tags=[...]", function () {
    it("should get notes by tags in query", async function () {
      const {
        Teams: teams
      } = await authedUser.reloadWithTeam();
      const note1 = await NoteFactory({
        TeamId: teams[0].id
      });
      const note2 = await NoteFactory({
        TeamId: teams[0].id
      });
      const tag1 = await TagFactory({
        name: 'TAG1'
      });
      const tag2 = await TagFactory({
        name: 'TAG2'
      });
      await note1.addTag(tag1);
      await note1.reloadWithTags();
      await note2.addTag(tag2);
      await note2.reloadWithTags();
      const found1 = await request(app).get("/notes").query({
        tags: ['TAG1']
      }).expect(200);
      const found2 = await request(app).get("/notes").query({
        tags: ['TAG2']
      }).expect(200);
      assert.equal(found1.body[0].id, note1.id)
      assert.equal(found2.body[0].id, note2.id)
    });
  })

  describe("POST /notes/:note_id/tags", function () {
    it("should add tags to note", async function () {
      const {
        Teams: teams
      } = await authedUser.reloadWithTeam();
      const note = await NoteFactory({
        TeamId: teams[0].id
      });
      const tagNames = ['one', 'two', 'three'];
      await request(app)
        .post(`/notes/${note.id}/tags`)
        .send(tagNames)
        .expect(201)
      await note.reloadWithTags();
      assert.deepEqual(tagNames, note.Tags.map(t => t.name));
    });
  })

  describe("POST /notes/:note_id/read", function () {
    it("should mark note as read", async function () {
      const {
        Teams: teams
      } = await authedUser.reloadWithTeam();
      const note = await NoteFactory({
        TeamId: teams[0].id
      });
      await request(app)
        .post(`/notes/${note.id}/read`)
        .expect(201)
    })
  })

  describe("POST /notes/:note_id/attachment", function () {
    it("should NOT add new attchment for other note", async function () {
      const otherTeam = await TeamFactory();
      const otherNote = await NoteFactory({
        TeamId: otherTeam.id
      });

      await request(app)
        .post(`/notes/${otherNote.id}/attachment`)
        .send({
          name: "NAME"
        })
        .expect(404)

    });
    it("should add new attachment to note", async function () {
      const {
        Teams: teams
      } = await authedUser.reloadWithTeam();
      const note = await NoteFactory({
        TeamId: teams[0].id
      });

      const res = await request(app)
        .post(`/notes/${note.id}/attachment`)
        .send({
          name: "NAME"
        })
        .expect(201)
      assert.equal(res.body.name, "NAME")
    });
  })
  describe("POST /notes?teamId=<TeamId>", function () {
    const note = {
      body: "BODY",
      title: "TITLE",
      slug: "SLUG"
    };
    it("should NOT create a note for another :team_id", async function () {
      const otherTeam = await TeamFactory();
      const {
        body
      } = await request(app)
        .post(`/notes`)
        .query({
          teamId: otherTeam.id
        })
        .send(note)
        .expect(403);
    })

    it("should create a note for :team_id", async function () {
      const {
        Teams: teams
      } = await authedUser.reloadWithTeam();
      const {
        body
      } = await request(app)
        .post(`/notes`)
        .query({
          teamId: teams[0].id
        })
        .send(note)
        .expect(201);

      assert.equal(body.body, note.body);
      assert.equal(body.slug, note.slug);
      assert.equal(body.title, note.title);

    });
  })
  describe("GET /users", function () {
    it("should retrieve users who share teams with user", async function () {

      const team = await TeamFactory();
      const user = await UserFactory();
      const userExcluded = await UserFactory();
      await team.addUser(authedUser);
      await team.addUser(user);
      await authedUser.reloadWithTeam();

      const res = await request(app)
        .get("/users")
        .expect(200);

      assert.deepEqual(res.body.map(u => u.id), [authedUser.id, user.id]);
    });
  })

  describe("GET /users/:user_id", function () {
    it("should retrieve users who share teams with user by id", async function () {

      const team = await TeamFactory();
      const user = await UserFactory();
      const userExcluded = await UserFactory();
      await team.addUser(authedUser);
      await team.addUser(user);
      await authedUser.reloadWithTeam();

      const res = await request(app)
        .get(`/users/${user.id}`)
        .expect(200);

      assert.equal(res.body.id, user.id);
    });
  })

  describe("GET /users/profile", function () {
    it("should get the authed user", async function () {

      const res = await request(app)
        .get(`/users/profile`)
        .expect(200);

      assert.equal(res.body.id, authedUser.id);
    });
  })

})