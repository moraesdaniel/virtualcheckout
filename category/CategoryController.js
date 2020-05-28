const express = require("express");
const router = express.Router();
const authentication = require("../middleware/authentication");
const category = require("./Category");

router.get("/categories", (req, res) => {
    res.send("Rota de categorias");
});

router.post("/category", authentication, (req, res) => {
    var description = req.body.description.toUpperCase();
    var userId = req.userId;

    if ((description == undefined) || (description == "")) {
        res.statusCode = 400;
        res.json({ error: "Invalid description" });
        return;
    }

    category.findOne({
        where: {
            description: description,
            userId: userId
        }
    }).then(categoryFound => {
        if (categoryFound != undefined) {
            res.statusCode = 400;
            res.json({ error: "Category already exists!" });
        } else {
            category.create({
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