const sequelize = require("sequelize");
const connection = require("../dao/connection");

const checkout = connection.define("checkout", {
    description: {
        type: sequelize.STRING,
        allowNull: false
    }
});

checkout.sync({ force: false });

module.exports = checkout;