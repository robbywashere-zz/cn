const Router = require('express');
const {
  Tag,
  Note,
  User,
  Attachment,
} = require('../models');
const {
  slugify
} = require("../lib/slugify");
const {
  NotFound,
  NotAuthorized,
  Forbidden,
  BadRequest,
} = require('http-errors');

const {
  FindById
} = require('./shared')

const {
  Validator
} = require("../lib/validator");
const {
  body
} = require('express-validator/check');

module.exports = function Notes(router = new Router()) {
  router.get('/', async (req, res, next) => {
    const {
      tags,
      title,
      regexp,
      read
    } = req.query;
    try {
      let notesQuery = req.scope;
      if (tags) notesQuery = notesQuery.searchByTagNamesFn(tags);

      if (title) notesQuery = notesQuery.searchTitleFn({
        title,
        regexp: regexp === "true"
      });
      if (read) {
        if (read == "true") notesQuery = notesQuery.userReadFn(req.session.userId)
        if (read == "false") notesQuery = notesQuery.userUnreadFn(req.session.userId)
      }
      res.send(await notesQuery.findAll());
    } catch (e) {
      next(e);
    }
  });

  router.use(FindById());

  router.delete('/:node_id', async (req, res, next) => {
    try {
      let note = await req.scope.findById(req.params.note_id);
      if (!note) throw new NotFound();
      await note.sendToTrash(req.session.userId);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  })

  router.post('/:note_id/read', async (req, res, next) => {
    try {
      let note = await req.scope.findById(req.params.note_id);
      if (!note) throw new NotFound();
      const read = await note.markAsReadBy(req.session.userId);
      res.status(201).send(read.serialize());
    } catch (e) {
      next(e);
    }
  });


  const TagsValid = Validator.new([body().isArray()]);
  router.post('/:note_id/tags', TagsValid, async (req, res, next) => {
    let note = await req.scope.findById(req.params.note_id);
    if (!note) throw new NotFound();
    const tagValues = req.body.map(t => ({
      name: slugify(t.toString().substr(0, 16)),
    }));
    const tags = await Tag.bulkCreate(tagValues, {
      returning: true
    });
    await note.addTags(tags);
    res.status(201).send(tags);

  })


  router.post('/:note_id/attachment', async (req, res, next) => {
    try {
      const {
        note_id: NoteId
      } = req.params;
      let note = await Note.forUserFn(req.session.userId).findById(req.params.note_id);
      if (!note) throw new NotFound();
      const {
        name
      } = req.body;
      const attachment = await Attachment.create({
        name,
        NoteId
      });
      res.status(201).send(attachment.serialize());
    } catch (e) {
      next(e);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const {
        body,
        title,
        slug,
        teamId
      } = {
        ...req.body,
        ...req.query
      }
      if (!teamId) throw new BadRequest('teamId required.')
      const user = await User.withTeamsForId(req.session.userId, teamId); //const userTeams = user.Teams.map(t => t.id + "");
      if (!user) throw new Forbidden();
      const note = await Note.create({
        TeamId: teamId,
        body,
        title,
        slug
      });
      res.status(201).send(note.serialize())
    } catch (e) {
      next(e);
    }
  });

  return router
}