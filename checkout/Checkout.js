const sequelize = require("sequelize");
const connection = require("../dao/connection");
const user = require("../user/User");

const checkout = connection.define("checkout", {
    description: {
        type: sequelize.STRING,
        allowNull: false
    }
});

checkout.belongsTo(user);

checkout.sync({ force: false });

module.exports = checkout;