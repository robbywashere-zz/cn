const {
  Note,
  UserTeam,
  Team,
  User,
  Attachment,
  Tag,
} = require('../../models');
const {
  NoteFactory,
  UserTeamFactory,
  TeamFactory,
} = require('../helpers');
const assert = require('assert');
const dbSync = require('../../db/sync');

describe('Note model', () => {

  let team;
  let note;
  beforeEach(async () => {
    await dbSync(true);
    team = await Team.create({});
    note = await NoteFactory({
      TeamId: team.id
    });

  })

  it(`- should respond to .create({ TeamId:<TeamInstance>.id }) `, async () => {
    await Note.create({
      TeamId: team.id
    });
  })

  it(`- should #.addAttachment(<AttachmentInstance(s)>)`, async () => {

    const att = await Attachment.create({
      UserId: 1,
      NoteId: 1
    });
    await note.addAttachment(att);
    await note.reloadWithAttachments();
    assert(note.Attachments.length, 1);
  });

  it(`- should include only User specified reads withUserRead`, async () => {

    const {
      user: user1,
      team: team1
    } = await UserTeamFactory();
    const {
      user: user2,
    } = await UserTeamFactory();

    await team1.addUser(user2);

    const note = await NoteFactory({
      TeamId: team1.id,
      UserId: user1.id
    });

    await Promise.all([note.markAsReadBy(user1), note.markAsReadBy(user2)]);

    const noteWithRead1 = await Note.userReadForId(user1, note.id);
    const noteWithRead2 = await Note.userReadForId(user2, note.id);
    const noteWithReadAll = await note.reloadWithAllReads();

    assert.equal(noteWithRead1.Reads.length, 1);
    assert.equal(noteWithRead2.Reads.length, 1);
    assert.equal(noteWithReadAll.Reads.length, 2)



  })


  it(`- should #.getUsers()`, async () => {
    const {
      team,
      user
    } = await UserTeamFactory();
    const note = await NoteFactory({
      TeamId: team.id
    });

    await user.addNote(note);
    let users = await (note.getUsers());
    assert.equal(users.length, 1)

  });



  it('- should #.findAllForUser()', async () => {

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

    const notes = await Note.forUser(user.id);

    assert.equal(notes.length, 3);

  });

  it(`- should get #.unread({ User: <UserInstance/Id>, Team: <TeamInstance/Id> })`, async () => {

    const {
      user,
      team
    } = await UserTeamFactory();
    const note = await NoteFactory({
      TeamId: team.id
    });

    const unreadNotes = await Note.unread({
      User: user,
      Team: team
    });

    const read = await note.markAsReadBy(user);

    await note.reloadWithAllReads();

    assert.equal(read.id, note.Reads[0].id);

    const unreadNotesEmpty = await Note.unread({
      User: user,
      Team: team
    })
    assert.equal(unreadNotes.length, 1)
    assert.equal(unreadNotesEmpty.length, 0)

  })

  it(`- should be marked as read by #.markAsReadBy(<UserInstance>)`, async () => {
    const {
      user,
      team
    } = await UserTeamFactory();
    const note = await NoteFactory({
      TeamId: team.id
    });

    const read = await note.markAsReadBy(user);

    await note.reloadWithAllReads();

    assert.equal(read.id, note.Reads[0].id);

  })

  it(`- should #.addTag(<TagInstance(s)>)`, async () => {

    const tag1 = Tag.create({
      name: 'one'
    });

    const tag2 = Tag.create({
      name: 'two'
    });
    const tag3 = Tag.create({
      name: 'three'
    });


    await note.addTag(await Promise.all([tag1, tag2, tag3]));

    await note.reloadWithTags();

    assert.equal(note.Tags.length, 3);

  });

  it(`- should reject .create(<Empty>) with SequelizeValidationError `, async () => {
    try {
      await Note.create();
    } catch (e) {
      assert.equal(e.name, 'SequelizeValidationError')
    }
  });



})