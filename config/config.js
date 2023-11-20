require('dotenv').config();

module.exports = {
  development: {
    "username": process.env.RDS_NAME,
    "password": process.env.RDS_PASSWORD,
    "database": process.env.RDS_DB,
    "host": `${process.env.RDS_HOST}.ap-northeast-2.rds.amazonaws.com`,
    "dialect": "mysql"
  },
  test: {
    "username": process.env.RDS_NAME,
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  production: {
    "username": process.env.RDS_NAME,
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
