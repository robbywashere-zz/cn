module.exports = {
  Name: 'Edit',
  Properties: {},
  Init({
    User,
    Note
  }) {
    this.belongsTo(User);
    this.belongsTo(Note);
  }
}