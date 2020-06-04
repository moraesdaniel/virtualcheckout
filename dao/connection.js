const sequelize = require("sequelize");
const DBName = "caixavirtual";
const user = "root";
const password = "m@ster2020";
const host = "localhost";

const connection = new sequelize(DBName, user, password, {
    host: host,
    dialect: "mysql",
    timezone: "-03:00"
});

module.exports = connection;