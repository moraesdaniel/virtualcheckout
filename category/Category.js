const sequelize = require("sequelize");
const connection = require("../dao/connection");
const user = require("../user/User");

const category = connection.define("category", {
    description: {
        type: sequelize.STRING,
        allowNull: false
    }
});

category.belongsTo(user);

category.sync({ force: false });

module.exports = category;