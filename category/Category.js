const sequelize = require("sequelize");
const connection = require("../dao/connection");

const category = connection.define("category", {
    description: {
        type: sequelize.STRING,
        allowNull: false
    }
});

category.sync({ force: false });

module.exports = category;