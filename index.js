const express = require("express");
const apiCaixaVirtual = express();
const bodyParser = require("body-parser");
const connection = require("./dao/connection");

const categoryController = require("./category/CategoryController");
const checkoutController = require("./checkout/CheckoutController");
const movementController = require("./movement/MovementController");
const userController = require("./user/UserController");

const category = require("./category/Category");
const checkout = require("./checkout/Checkout");
const movement = require("./movement/Movement");
const user = require("./user/User");

//View engine
apiCaixaVirtual.set("view engine", "ejs");

//Static
apiCaixaVirtual.use(express.static("public"));

//Body parser
apiCaixaVirtual.use(bodyParser.urlencoded({ extended: false }));
apiCaixaVirtual.use(bodyParser.json());

//Using routes
apiCaixaVirtual.use("/", categoryController);
apiCaixaVirtual.use("/", checkoutController);
apiCaixaVirtual.use("/", movementController.router);
apiCaixaVirtual.use("/", userController);

//Connection
connection
    .authenticate()
    .then(() => {
        console.log("Database connected");
    })
    .catch((error) => {
        console.log(error);
    })

//End Router
apiCaixaVirtual.listen(9500, () => {
    console.log("API Caixa Virtual running");
});