const express = require("express");
const router = express.Router();
const authentication = require("../middleware/authentication");
const movement = require("./Movement");
const category = require("../category/Category");
const checkout = require("../checkout/Checkout");

router.get("/moves", (req, res) => {
    res.send("Rota de movimentações");
});

router.post("/movement", authentication, (req, res) => {
    var userId = req.userId;
    var { value, type, description, categoryId, checkoutId } = req.body;

    if ((value == undefined) || (value <= 0)) {
        res.statusCode = 400;
        res.json({ error: "The value must be bigger than zero!" });
        return;
    }

    if ((type == undefined) || (!(type.toUpperCase() in { I: "Input", O: "Output"}))) {
        res.statusCode = 400;
        res.json({ error: "The value 'type' must be equal 'I'(input) or 'O'(output)" });
        return;
    }

    if ((description == undefined) || (description == "")) {
        res.statusCode = 400;
        res.json({ error: "Invalid description!" });
        return;
    }

    if (category == undefined) {
        res.statusCode = 400;
        res.json({ error: "Invalid category!" });
    } else {
        category.findOne({
            where: {
                id: categoryId,
                userId: userId
            }
        }).then(categoryFound => {
            if (categoryFound == undefined) {
                res.statusCode = 400;
                res.json({ erro: "Invalid category" });
            } else {
                if (checkout == undefined) {
                    res.statusCode = 400;
                    res.json({ error: "Invalid checkout" });
                } else {
                    checkout.findOne({
                        where: {
                            id: checkoutId,
                            userId: userId
                        }
                    }).then(checkoutFound => {
                        if (checkoutFound == undefined) {
                            res.statusCode = 400;
                            res.json({ erro: "Invalid checkout" });
                        } else {
                            movement.create({
                                value: value,
                                type: type,
                                description: description,
                                categoryId: categoryId,
                                checkoutId: checkoutId
                            }).then(() => {
                                res.statusCode = 200;
                                res.json({ msg: "Success!" });
                            }).catch((msgErro) => {
                                res.statusCode = 500;
                                res.json({ erro: msgErro});
                            });
                        }
                    });
                }
            }
        });
    }
});

module.exports = router;