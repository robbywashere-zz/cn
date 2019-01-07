const {
  Attachment,
} = require('../../models');
const dbSync = require('../../db/sync');

const assert = require("assert");

describe('Attachment model', () => {

  beforeEach(() => dbSync(true))

  it(`- should respond to #.create({})`, async () => {});

  it('- should throw SequelizeValidationError on #.create({}), when Note is not provided', async () => {

    try {
      await Attachment.create();
    } catch (err) {
      assert.equal(err.name, "SequelizeValidationError")
    }

  });

})