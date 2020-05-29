const sequelize = require("sequelize");
const connection = require("../dao/connection");
const user = require("../user/User");

const checkout = connection.define("checkout", {
    description: {
        type: sequelize.STRING,
        allowNull: false
    },
    totalBalance: {
        type: sequelize.FLOAT,
        defaultValue: 0
    }
});

checkout.belongsTo(user);

checkout.sync({ force: false });

module.exports = checkout;