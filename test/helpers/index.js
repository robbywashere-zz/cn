const {
  User,
  Note,
  Team,
  Attachment
} = require("../../models");

class Uniq {
  constructor(u_str = "uniqStr") {
    this.u_str = u_str;
    this.counter = 0;
  }
  get str() {
    return this.u_str + this.counter++;
  }
  get email() {
    return this.str + '@' + this.str + '.com'
  }
}

const uniq = new Uniq();


function UserFactory(options) {
  return User.create({
    username: "roy",
    password: "gbiv",
    email: uniq.email,
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
    username: uniq.str,
    password: 'password',
    email: uniq.email,
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
  uniq,
  UserFactory,
  TeamFactory,
  NoteFactory,
  UserTeamFactory,
  AttachmentFactory
}