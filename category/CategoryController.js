const express = require("express");
const router = express.Router();
const authentication = require("../middleware/authentication");
const category = require("./Category");
const sequelize = require("sequelize");
const { or, and, gt, lt, ne } = sequelize.Op;

function ValidateCategory(description, userId, categoryId) {
    return new Promise((resolve, reject) => {
        if ((description == undefined) || (description.trim() == "")) {
            reject("Invalid description!" );
        }

        if (isNaN(categoryId)) {
            reject("Invalid id!");
        }

        category.findOne({
            where: {
                description: description.toUpperCase(),
                userId: userId,
                id: {[ne]: categoryId}
            }
        }).then(categoryFound => {
            if (categoryFound != undefined) {
                reject("Category already exists!");
            } else {
                resolve("Success!");
            }
        }).catch((msgErro) => {
            reject(msgErro);
        });
    });
}

function AddCategory(req, res) {
    var description = req.body.description;
    var userId = req.userId;

    ValidateCategory(description, userId, 0).then(() => {
        category.create({
            description: description,
            userId: userId
        }).then(() => {
            res.statusCode = 200;
            res.json({ msg: "Success!" });
        }).catch((error) => {
            res.statusCode = 500;
            res.json({ error: error });
        });
    }).catch((msgError) => {
        res.statusCode = 400;
        res.json({ error: msgError });
    });
}

function UpdateCategory(req, res) {
    var userId = req.userId;
    var { description, id } = req.body;

    ValidateCategory(description, userId, id).then(() => {
        category.update(
            { description: description.toUpperCase() },
            { where: { id: id } }
        ).then((rowsUpdated) => {
            if (rowsUpdated != 0) {
                res.statusCode = 200;
                res.json({ msg: "Success!" });
            } else {
                res.statusCode = 400;
                res.json({ msg: "Category not found!" });
            }
        }).catch((error) => {
            res.statusCode = 500;
            res.json({ error: error });
        });
    }).catch((msgError) => {
        res.statusCode = 400;
        res.json({ error: msgError });
    });
}

function GetCategories(req, res) {
    var userId = req.userId;
    category.findAll({
        where: {
            userId: userId
        },
        order: [
            ["id", "ASC"]
        ]
    }).then(categories => {
        res.json(categories);
    }).catch((msgError) => {
        res.statusCode = 500;
        res.json({ error: msgError });
    }); 
}

function DeleteCategory(req, res) {
    //Implementar amanhã ThereIsMovementsCategory
}

//Routes
router.get("/categories", authentication, (req, res) => {
    GetCategories(req, res);
});


router.post("/category", authentication, (req, res) => {
    AddCategory(req, res);
});

router.put("/category", authentication, (req, res) => {
    UpdateCategory(req, res);
});

router.delete("/category", authentication, (req, res) => {
    DeleteCategory(req, res);
});

module.exports = router;