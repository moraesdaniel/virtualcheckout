const express = require("express");
const router = express.Router();
const checkout = require("./Checkout");
const authentication = require("../middleware/authentication");
const sequelize = require("sequelize");
const movementController = require("../movement/MovementController");
const { or, and, gt, lt, ne } = sequelize.Op;

function GetCheckouts(req, res) {
    var userId = req.userId;
    checkout.findAll({
        where: {
            userId: userId
        },
        order: [
            ["id", "ASC"]
        ]
    }).then(checkouts => {
        res.statusCode = 200;
        res.json(checkouts);
    }).catch((msgError) => {
        res.statusCode = 500;
        res.json({ error: msgError });
    });
}

function IdIsValid(id) {
    return new Promise((resolve, reject) => {
        if ((id == undefined) || (isNaN(id))) {
            reject("Invalid id!");
        }

        resolve("");
    });
}

function DescriptionIsValid(description) {
    return new Promise((resolve, reject) => {
        if ((description == undefined) || (description.trim() == "")) {
            reject("Invalid description!");
        }

        resolve("");
    });
}

function CheckoutAlreadyExists(description, userId, id) {
    return new Promise((resolve, reject) => {
        checkout.findOne({
            where: {
                description: description,
                userId: userId,
                id: { [ne]: id }
            }
        }).then(checkoutFound => {
            if (checkoutFound != undefined) {
                reject("Checkout already exists! ID: " + checkoutFound.id);
            } else {
                resolve("Success!");
            }
        }).catch((msgError) => {
            reject(msgError);
        });
    });
}

function CheckoutBelongsUser(id, userId) {
    return new Promise((resolve, reject) => {
        checkout.findOne({
            where: {
                userId: userId,
                id: id
            }
        }).then(checkoutFound => {
            if (checkoutFound != undefined) {
                resolve("");
            } else {
                reject("Checkout not found!");
            }
        }).catch((msgError) => {
            console.log("Error: " + msgErro);
            reject(msgError);
        });
    });
}

async function AddCheckout(req, res) {
    try {
        var description = req.body.description;
        var userId = req.userId;

        await DescriptionIsValid(description);
        await CheckoutAlreadyExists(description, userId, 0);

        checkout.create({
            description: description,
            userId: userId
        }).then(() => {
            res.statusCode = 200;
            res.json({ msg: "Success!" });
        });
    } catch (msgError) {
        res.statusCode = 400;
        res.json({ error: msgError });
    }
}

async function UpdateCheckout(req, res) {
    var userId = req.userId;
    var { description, id } = req.body;

    try {
        await DescriptionIsValid(description);
        await IdIsValid(id);
        await CheckoutBelongsUser(id, userId);
        await CheckoutAlreadyExists(description, userId, id);

        checkout.update(
            { description: description.toUpperCase() },
            { where: { id: id } }
        ).then((rowsUpdated) => {
            if (rowsUpdated != 0) {
                res.statusCode = 200;
                res.json({ msg: "Success!" });
            } else {
                res.statusCode = 400;
                res.json({ msg: "Checkout not found!" });
            }
        });
    } catch (msgError) {
        res.statusCode = 400;
        res.json({ error: msgError });
    }
}

async function DeleteCheckout(req, res) {
    var id = req.body.id;
    var userId = req.userId;

    try {
        await IdIsValid(id);
        await CheckoutBelongsUser(id, userId);
        await movementController.ThereIsMovementsCheckout(id);

        checkout.destroy({
            where: { id: id }
        }).then(() => {
            res.statusCode = 200;
            res.json({ msg: "Success!" });
        });
    } catch (msgError) {
        res.statusCode = 400;
        res.json({ error: msgError });
    }
}

//Routes
router.get("/checkouts", authentication, (req, res) => {
    GetCheckouts(req, res);
});


router.post("/checkout", authentication, (req, res) => {
    AddCheckout(req, res);
});

router.put("/checkout", authentication, (req, res) => {
    UpdateCheckout(req, res);
});

router.delete("/checkout", authentication, (req, res) => {
    DeleteCheckout(req, res);
});

module.exports = router;