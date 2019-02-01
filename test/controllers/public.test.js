process.env.NODE_ENV = 'test'
const {
  UserFactory
} = require('../helpers');
const {
  BaseServer
} = require('../../server');
const request = require('supertest');
const dbSync = require('../../db/sync');
const {
  PublicRoutes
} = require('../../controllers/public');
const assert = require('assert');

describe('public routes', function () {

  let app;

  beforeEach(async function () {
    await dbSync(true);
    app = BaseServer(PublicRoutes());
    //app.use(PublicRoutes());
  })


  describe('POST /auth', function () {
    it("should properly respond to bad request", function () {
      return request(app)
        .post('/auth')
        .expect(400)
    })
    it("should properly respond to wrong credentials", function () {
      return request(app)
        .post('/auth')
        .expect(401)
        .send({
          username: "foo",
          password: "bar"
        })
    })
    it("should login user", async function () {
      const password = "PASSWORD";
      const user = await UserFactory({
        password
      });
      return request(app)
        .post('/auth')
        .send({
          username: user.username,
          password

        })
        .expect(200)
    })
  });

  describe("POST /user", function () {

    it("should return Bad Request when missing required fields", function () {
      return request(app)
        .post('/user')
        .expect(400)

    })

    it("should create user", async function () {
      const {
        body
      } = await request(app)
        .post('/user')
        .expect(200)
        .send({
          username: "foo",
          password: "bar",
          email: "foo@bar.com"
        });
      assert.equal(body.username, 'foo');
      assert.equal(body.email, 'foo@bar.com');
      //assert.equal(body.Teams.length, 1);
    })
  });

})