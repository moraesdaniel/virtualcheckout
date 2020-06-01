const express = require("express");
const router = express.Router();
const authentication = require("../middleware/authentication");
const category = require("./Category");
const sequelize = require("sequelize");
const { or, and, gt, lt, ne } = sequelize.Op;
const validations = require("../resources/Validations");
const movement = require("../movement/Movement");

function ThereIsMovementsCategory(categoryId) {
    return new Promise((resolve, reject) => {
        movement.findOne({
            where: {
                categoryId: categoryId
            }
        }).then(movementFound => {
            if (movementFound != undefined) {
                reject("There is movements to this category!");
            } else {
                resolve("");
            }
        }).catch((msgError) => {
            console.log("Error: " + msgError);
            reject(msgError);
        });
    });
}

function CategoryAlreadyExists(description, userId, id) {
    return new Promise((resolve, reject) => {
        category.findOne({
            where: {
                description: description.toUpperCase(),
                userId: userId,
                id: { [ne]: id }
            }
        }).then(categoryFound => {
            if (categoryFound != undefined) {
                reject("Category already exists! ID: " + categoryFound.id);
            } else {
                resolve("");
            }
        }).catch((msgError) => {
            console.log("Error: " + msgError);
            reject(msgError);
        });
    });
}

function CategoryBelongsUser(id, userId) {
    return new Promise((resolve, reject) => {
        category.findOne({
            where: {
                userId: userId,
                id: id
            }
        }).then((categoryFound) => {
            if (categoryFound != undefined) {
                resolve("");
            } else {
                reject("Category not found!");
            }
        }).catch((msgError) => {
            console.log("Error: " + msgError);
            reject(msgError);
        });
    });
}

async function AddCategory(req, res) {
    var description = req.body.description;
    var userId = req.userId;

    try {
        await validations.DescriptionIsValid(description, "Invalid description");
        await CategoryAlreadyExists(description, userId, 0);

        category.create({
            description: description,
            userId: userId
        }).then(() => {
            res.statusCode = 200;
            res.json({ msg: "Success!" });
        });
    } catch (msgError) {
        console.log("Error: " + msgError);
        res.statusCode = 400;
        res.json({ error: msgError });
    }
}

async function UpdateCategory(req, res) {
    var userId = req.userId;
    var { description, id } = req.body;

    try {
        await validations.DescriptionIsValid(description, "Invalid description");
        await validations.IdIsValid(id, "Invalid id");
        await CategoryBelongsUser(id, userId);
        await CategoryAlreadyExists(description, userId, id);

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
        });
    } catch (msgError) {
        console.log("Error: " + msgError);
        res.statusCode = 400;
        res.json({ error: msgError });
    }
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
        console.log("Error: " + msgError);
        res.statusCode = 500;
        res.json({ error: msgError });
    }); 
}

async function DeleteCategory(req, res) {
    var id = req.body.id;
    var userId = req.userId;

    try {
        await validations.IdIsValid(id, "Invalid id");
        await CategoryBelongsUser(id, userId);
        await ThereIsMovementsCategory(id);

        category.destroy({
            where: { id: id }
        }).then(() => {
            res.statusCode = 200;
            res.json({ msg: "Success!" });
        });
    } catch (msgError) {
        console.log("Error: " + msgError);
        res.statusCode = 400;
        res.json({ error: msgError });
    }
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

module.exports = {
    router,
    CategoryBelongsUser
};