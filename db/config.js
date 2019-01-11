require("dotenv").config()
const config = require("config");

module.exports = {
  database: config.get("DB_NAME"),
  username: config.get("DB_USERNAME"),
  password: config.DB_PASSWORD,
  dialect: "postgres",
  host: config.get("DB_HOST"),
  logging: (process.env.DEBUG ? console.log : false)
}