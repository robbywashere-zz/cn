module.exports = {
  Name: 'Read',
  Properties: {},
  ScopeFunctions: true,
  Init({
    Note,
    User
  }) {
    this.belongsTo(Note);
    this.belongsTo(User);
  },

}