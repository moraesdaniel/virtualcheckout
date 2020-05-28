const sequelize = require("sequelize");
const connection = require("../dao/connection");
const category = require("../category/Category");
const checkout = require("../checkout/Checkout");

const movement = connection.define("movement", {
    value: {
        type: sequelize.FLOAT,
        allowNull: false
    },
    type: {
        type: sequelize.CHAR,
        allowNull: false
    },
    description: {
        type: sequelize.STRING,
        allowNull: false
    }
});

movement.belongsTo(category);
category.hasMany(movement);

movement.belongsTo(checkout);
checkout.hasMany(movement);

movement.sync({ force: false });

module.exports = movement;