const sequelize = require("sequelize");
const DBName = "dbname";
const user = "root";
const password = "root";
const host = "localhost";

const connection = new sequelize(DBName, user, password, {
    host: host,
    dialect: "mysql",
    timezone: "-03:00"
});

module.exports = connection;
