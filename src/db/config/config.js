
require('dotenv').config();
const { PGHOST, PGUSER, PGPASSWORD, PGDATABASE } = process.env;

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: `${process.cwd()}/src/db/slack_bot_development_db.sqlite`,
    operatorsAliases: false
  },
  test: {
    username: process.env.CI_DB_USERNAME,
    password: process.env.CI_DB_PASSWORD,
    database: process.env.CI_DB_NAME,
    host: '127.0.0.1',
    dialect: 'sqlite',
    operatorsAliases: false
  },
  production: {
    dialect: 'sqlite',
    storage: `${process.cwd()}/src/db/slack_bot_production_db.sqlite`,
    operatorsAliases: false
  }
}
