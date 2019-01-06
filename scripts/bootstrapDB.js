const { Client } = require('pg')
const logger = require('../lib/logger')
const demand = require('../lib/demand');
const config = require('config');
const DBConfig = require('../db/config');

async function bootstrapDB(dbConfig = DBConfig){

  const { 
    username: user,
    host = demand('host'), 
    port,
    database = demand('database'),  
    password
  } = dbConfig;

  const client = new Client({ 
    host,
    password,
    port });

  try {
    await client.connect();
    logger.debug(`Creating databse ${database}...`)
    await client.query(`CREATE DATABASE ${database};`)
  } catch(e){
    logger.error(e);
  }
  try {
    logger.debug(`Creating user ${user}...`)
    await client.query(`CREATE USER ${user};`)
  } catch(e) {
    logger.error(e);
  }


  try {
    logger.debug(`Adding ${user} to ${database}...`)
    await client.query(`GRANT ALL PRIVILEGES ON DATABASE ${database} TO ${user};`)
  } catch(e) {
    logger.error(e);
  }


  await client.end();

}


if (require.main === module) {
  bootstrapDB();
} 


module.exports= bootstrapDB;
