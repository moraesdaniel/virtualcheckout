const express = require("express");
const router = express.Router();
const checkout = require("./Checkout");
const authentication = require("../middleware/authentication");

router.get("/checkouts", authentication, (req, res) => {
    var userId = req.userId;
    checkout.findAll({
        where: {
            userId: userId
        },
        order: [
            ["id", "ASC"]
        ]
    }).then(checkouts => {
        res.json(checkouts);
    });
});


router.post("/checkout", authentication, (req, res) => {
    var description = req.body.description.toUpperCase();
    var userId = req.userId;

    if ((description == undefined) || (description == "")) {
        res.statusCode = 400;
        res.json({ error: "Invalid description" });
        return;
    }

    checkout.findOne({
        where: {
            description: description,
            userId: userId
        }
    }).then(checkoutFound => {
        if (checkoutFound != undefined) {
            res.statusCode = 400;
            res.json({ error: "Checkout already exists!" });
        } else {
            checkout.create({
                description: description,
                userId: userId
            }).then(() => {
                res.statusCode = 200;
                res.json({ msg: "Success!" });
            });
        }
    });
});

module.exports = router;