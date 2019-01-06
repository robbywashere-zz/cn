const { User, Note, Account } = require("../../models");

function UserFactory(options){
  return User.create({
    username: "roy",
    password: "gbiv",
    ...options
  })
}
function NoteFactory(options){
  return Note.create({
    ...options
  })
}

function AccountFactory(options){
  return Account.create({});
}

async function UserAccountFactory({ userOptions = {}, accountOptions = {} } ={}){
  const user = await User.create({
    username: "roy",
    password: "gbiv",
  });

  await user.reload({ include: { all: true }});

  const account = await Account.findById(user.Accounts[0].id);

  return { account, user };
}

module.exports = { UserFactory, AccountFactory, NoteFactory, UserAccountFactory }
