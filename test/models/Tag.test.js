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