const Router = require('express');
const {
  User,
  Note,
  Attachment,
  Team,
  UserTeam
} = require('../models');
const {
  Unauthorized,
  NotFound,
} = require('http-errors');

const {
  Validator
} = require("../lib/validator");
const {
  param,
  check
} = require('express-validator/check');

function ProtectWithAuth(req, res, next) {
  try {
    if (req.session.userId) next();
    else throw new Unauthorized();
  } catch (e) {
    next(e);
  }
}

function ProtectedRoutes(router = new Router()) {
  router.use(ProtectWithAuth)

  router.get('/notes', async (req, res, next) => {
    try {
      let notes = await Note.findAllForUser(req.session.userId);
      res.send(notes.serialize());
    } catch (e) {
      next(e);
    }
  });
  router.get('/notes/:note_id', async (req, res, next) => {
    try {
      let notes = await Note.findAllForUserForId(req.session.userId, req.params.note_id);
      res.send(notes.serialize());
    } catch (e) {
      next(e);
    }
  });

  router.post('/attachment/:note_id', async (req, res, next) => {
    try {
      let note = await Note.findAllForUserForId(req.session.userId, req.params.note_id);
      if (!note) throw new NotFound();
      const {
        name
      } = req.body;
      const {
        note_id: NoteId
      } = req.params;
      const attachment = await Attachment.create({
        name,
        NoteId
      });
      res.status(201).send(attachment.serialize());
    } catch (e) {
      next(e);
    }
  });


  router.post('/teams/:team_id/note', async (req, res, next) => {
    try {
      const {
        team_id
      } = req.params;
      const user = await User.withTeamsForId(req.session.userId, team_id); //const userTeams = user.Teams.map(t => t.id + "");
      if (!user) throw new NotFound();
      const {
        body,
        title,
        slug
      } = req.body;
      const note = await Note.create({
        TeamId: user.Teams[0].id,
        body,
        title,
        slug
      });
      res.status(201).send(note.toJSON())
    } catch (e) {
      next(e);
    }
  });

  router.get('/teams', async (req, res, next) => {
    try {
      let teams = await Team.belongingTo(req.session.userId);
      res.send(teams.serialize());
    } catch (e) {
      next(e);
    }
  });
  router.get('/teams/:team_id', async (req, res, next) => {
    try {
      let teams = await Team.belongingToForId(req.session.userId, req.params.team_id);
      res.send(teams.serialize());
    } catch (e) {
      next(e);
    }
  });

  router.get('/users/:user_id', async (req, res, next) => {
    try {
      let users = await User.teamMembersForId(req.session.userId, req.params.user_id);
      res.send(users.serialize());
    } catch (e) {
      next(e);
    }
  });

  router.get('/profile', async (req, res, next) => {
    try {
      let users = await User.findById(req.session.userId);
      res.send(users.serialize());
    } catch (e) {
      next(e);
    }
  });

  router.get('/users', async (req, res, next) => {
    try {
      let users = await User.teamMembers(req.session.userId);
      res.send(users.serialize());
    } catch (e) {
      next(e);
    }
  });

  router.get('/', (req, res) => res.send('Hello World'))
  return router;
}

module.exports = {
  ProtectedRoutes,
  ProtectWithAuth
}