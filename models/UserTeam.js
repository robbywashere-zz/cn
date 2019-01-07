module.exports = {
  Name: 'UserTeam',
  Properties: {},
  Init({
    User,
    Team
  }) {
    this.belongsTo(User);
    this.belongsTo(Team);

  }
};