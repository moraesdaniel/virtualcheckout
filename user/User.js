const sequelize = require("sequelize");
const connection = require("../dao/connection.js");

const user = connection.define("user", {
    name: {
        type: sequelize.STRING,
        allowNull: false
    },
    email: {
        type: sequelize.STRING,
        allowNull: false
    },
    password: {
        type: sequelize.STRING,
        allowNull: false
    }
});

user.sync({ force: false });

module.exports = user;