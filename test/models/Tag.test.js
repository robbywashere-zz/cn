const {
  Tag,
} = require('../../models');
const {
  UserTeamFactory,
  NoteFactory
} = require('../helpers');
const assert = require('assert');
const dbSync = require('../../db/sync');

describe('Tag model', () => {
  beforeEach(() => dbSync(true))
  it(`- should respond to #.forUser(<User>) and #.forTeam(<Team>)`, async () => {

    let {
      team,
      user
    } = await UserTeamFactory();

    let note = await NoteFactory({
      TeamId: team.id
    });

    const tag = await Tag.create({
      name: 'one'
    });
    await tag.addNote(note);

    const tags = await Tag.forUserFn(user.id).forTeamFn(team.id).findAll();
    const noTags = await Tag.forUser(999);
    assert.equal(tags.length, 1)
    assert.equal(noTags.length, 0)
  })
  it(`- should #.addNote(<NoteInstance>)`, async () => {

    let {
      team
    } = await UserTeamFactory();

    let note = await NoteFactory({
      TeamId: team.id
    });

    const tag = await Tag.create({
      name: 'one'
    });

    await tag.addNote(note);

    await note.reloadWithTags();
    await tag.reloadWithNotes();

    assert.equal(note.Tags.length, 1);
    assert.equal(tag.Notes.length, 1);

  });



})