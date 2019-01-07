const {
  User,
  Note,
  Team,
  Attachment
} = require("../../models");


const UniqueStrings = (function () {
  let counter = 0;
  return () => 'UniqStr' + counter++
})();


function UserFactory(options) {
  return User.create({
    username: "roy",
    password: "gbiv",
    ...options
  })
}

function NoteFactory(options) {
  return Note.create({
    ...options
  })
}

async function AttachmentFactory(options) {
  return Attachment.create({
    ...options
  })
}

function TeamFactory(options) {
  return Team.create({});
}


async function UserTeamFactory({
  userOptions = {},
  teamOptions = {}
} = {}) {
  const user = await User.create({
    username: UniqueStrings(),
    password: 'password',
    ...userOptions
  });

  await user.reload({
    include: {
      all: true
    }
  });

  const team = await Team.findById(user.Teams[0].id);

  return {
    team,
    user
  };
}

module.exports = {
  UserFactory,
  TeamFactory,
  NoteFactory,
  UserTeamFactory,
  AttachmentFactory
}