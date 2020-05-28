const sequelize = require("sequelize");

const connection = new sequelize("caixavirtual", "root", "m@ster2020", {
    host: "localhost",
    dialect: "mysql"
});

module.exports = connection;