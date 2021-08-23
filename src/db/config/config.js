
require('dotenv').config();
const { PGHOST, PGUSER, PGPASSWORD, PGDATABASE } = process.env;

module.exports = {
  "development": {
    "username": PGUSER,
    "password": PGPASSWORD,
    "database": PGDATABASE,
    "host": PGHOST,
    "dialect": "postgres"
  },
  "test": {
    "username": PGUSER,
    "password": PGPASSWORD,
    "database": "database_test",
    "host": PGHOST,
    "dialect": "postgres"
  },
  "production": {
    "username": PGUSER,
    "password": PGPASSWORD,
    "database": "database_production",
    "host": PGHOST,
    "dialect": "postgres"
  }
}
