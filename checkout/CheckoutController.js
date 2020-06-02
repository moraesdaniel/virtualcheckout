const express = require("express");
const router = express.Router();
const checkout = require("./Checkout");
const authentication = require("../middleware/authentication");
const sequelize = require("sequelize");
const { or, and, gt, lt, ne } = sequelize.Op;
const validations = require("../resources/Validations");
const movement = require("../movement/Movement");

function ThereIsMovementsCheckout(checkoutId) {
    return new Promise((resolve, reject) => {
        movement.findOne({
            where: {
                checkoutId: checkoutId
            }
        }).then(movementFound => {
            if (movementFound != undefined) {
                reject("There is movements to this checkout!");
            } else {
                resolve("");
            }
        }).catch((msgError) => {
            console.log("Error: " + msgError);
            reject(msgError);
        });
    });
}

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
        console.log("Error: " + msgError);
        res.statusCode = 500;
        res.json({ error: msgError });
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
            console.log("Error: " + msgError);
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
            console.log("Error: " + msgError);
            reject(msgError);
        });
    });
}

async function Add(req, res) {
    try {
        var description = req.body.description;
        var userId = req.userId;

        await validations.DescriptionIsValid(description, "Invalid description!");
        await CheckoutAlreadyExists(description, userId, 0);

        checkout.create({
            description: description.toUpperCase(),
            userId: userId
        }).then(() => {
            res.statusCode = 200;
            res.json({ msg: "Success!" });
        }).catch((msgError) => {
            console.log("Error: " + msgError);
            res.statusCode = 500;
            res.json({ error: msgError });
        });
    } catch (msgError) {
        console.log("Error: " + msgError);
        res.statusCode = 400;
        res.json({ error: msgError });
    }
}

function UpdateCheckout(id, description) {
    return new Promise((resolve, reject) => {
        checkout.update(
            { description: description },
            { where: { id: id } }
        ).then((rowsUpdated) => {
            if (rowsUpdated != 0) {
                resolve("Success");
            } else {
                reject("Checkout not found!" );
            }
        }).catch((msgError) => {
            reject(msgError);
        });
    });
}

function UpdateTotalBalance(id, movementValue, movementType) {
    return new Promise((resolve, reject) => {
        GetCheckout(id).then((checkout) => {
            var totalBalance = 0;
            if (movementType.toUpperCase() == "I") {
                totalBalance = checkout.totalBalance + movementValue;
            } else {
                totalBalance = checkout.totalBalance - movementValue;
            }

            checkout.update(
                { totalBalance: totalBalance },
                { where: { id: id } }
            ).then((rowsUpdated) => {
                if (rowsUpdated != 0) {
                    resolve("Success");
                } else {
                    reject("Checkout not found!");
                }
            }).catch((msgError) => {
                reject(msgError);
            });
        }).catch((msgError) => {
            reject(msgError);
        });
    });
}

async function Update(req, res) {
    var userId = req.userId;
    var { description, id } = req.body;

    try {
        await validations.IdIsValid(id, "Invalid id!");
        await CheckoutBelongsUser(id, userId);
        await validations.DescriptionIsValid(description, "Invalid description!");
        await CheckoutAlreadyExists(description, userId, id);

        UpdateCheckout(id, description).then(() => {
            res.statusCode = 200;
            res.json({ msg: "Success" });
        }).catch((msgError) => {
            console.log("Error: " + msgError);
            res.statusCode = 500;
            res.json({ error: msgError });
        });
    } catch (msgError) {
        console.log("Error: " + msgError);
        res.statusCode = 400;
        res.json({ error: msgError });
    }
}

async function Delete(req, res) {
    var id = req.body.id;
    var userId = req.userId;

    try {
        await validations.IdIsValid(id, "Invalid id!");
        await CheckoutBelongsUser(id, userId);
        await ThereIsMovementsCheckout(id);

        checkout.destroy({
            where: { id: id }
        }).then(() => {
            res.statusCode = 200;
            res.json({ msg: "Success!" });
        }).catch((msgError) => {
            console.log("Error: " + msgError);
            res.statusCode = 500;
            res.json({ error: msgError });
        });
    } catch (msgError) {
        console.log("Error: " + msgError);
        res.statusCode = 400;
        res.json({ error: msgError });
    }
}

function GetCheckout(id) {
    return new Promise((resolve, reject) => {
        checkout.findOne({
            where: {
                id: id
            }
        }).then(checkout => {
            resolve(checkout);
        }).catch((msgError) => {
            console.log("Error: " + msgError);
            reject(undefined);
        });
    });
}

//Routes
router.get("/checkouts", authentication, (req, res) => {
    GetCheckouts(req, res);
});


router.post("/checkout", authentication, (req, res) => {
    Add(req, res);
});

router.put("/checkout", authentication, (req, res) => {
    Update(req, res);
});

router.delete("/checkout", authentication, (req, res) => {
    Delete(req, res);
});

module.exports = {
    router,
    CheckoutBelongsUser,
    GetCheckout,
    UpdateTotalBalance
};