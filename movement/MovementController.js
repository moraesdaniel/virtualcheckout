const express = require("express");
const router = express.Router();
const authentication = require("../middleware/authentication");
const movement = require("./Movement");
const category = require("../category/Category");
const validations = require("../resources/Validations");
const checkoutController = require("../checkout/CheckoutController");
const categoryController = require("../category/CategoryController");

function ValueIsValid(value) {
    return new Promise((resolve, reject) => {
        if ((value == undefined) || (value <= 0)) {
            reject("The value must be bigger than zero!");
        }

        resolve("");
    })
}

function TypeIsValid(type) {
    return new Promise((resolve, reject) => {
        if ((type == undefined) || (!(type.toUpperCase() in { I: "Input", O: "Output" }))) {
            reject("The value 'type' must be equal 'I'(input) or 'O'(output)");
        }

        resolve("");
    });
}

async function AddMovement(req, res) {
    var userId = req.userId;
    var { value, type, description, categoryId, checkoutId } = req.body;

    try {
        await ValueIsValid(value);
        await TypeIsValid(type);
        await validations.DescriptionIsValid(description, "Invalid description!");

        await validations.IdIsValid(categoryId, "Invalid category id!");
        await categoryController.CategoryBelongsUser(categoryId, userId);

        await validations.IdIsValid(checkoutId, "Invalid checkout id!");
        await checkoutController.CheckoutBelongsUser(checkoutId, userId);

        movement.create({
            value: value,
            type: type,
            description: description,
            categoryId: categoryId,
            checkoutId: checkoutId
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

async function DeleteMovement(req, res) {
    var userId = req.userId;
    var { checkoutId, id } = req.body;

    try {
        await validations.IdIsValid(id, "Invalid id!");
        await validations.IdIsValid(checkoutId, "Invalid checkout id!");
        await checkoutController.CheckoutBelongsUser(checkoutId, userId);

        movement.destroy({
            where: {
                id: id,
                checkoutId: checkoutId
            }
        }).then((deletedRows) => {
            if (deletedRows > 0) {
                res.statusCode = 200;
                res.json({ msg: "Success!" });
            } else {
                res.statusCode = 400;
                res.json({ error: "Movement not found" });
            }
        });
    } catch (msgError) {
        console.log("Error: " + msgError);
        res.statusCode = 400;
        res.json({ error: msgError });
    }
}


function FormatMovements(checkout, movements) {
    var fileReturn = JSON.parse("{}");
    var movement = JSON.parse("{}");
    var iterator = 0;

    fileReturn.checkoutId = checkout.id;
    fileReturn.descricao = checkout.description;
    fileReturn.saldoTotal = checkout.totalBalance;

    fileReturn.movimentacoes = [];
    for (iterator = 0; iterator < movements.length; iterator++) {
        let data = new Date(movements[iterator].createdAt);

        let categoryObj = JSON.parse("{}");
        categoryObj.id = movements[iterator].category.id;
        categoryObj.name = movements[iterator].category.description;

        movement.data = data.toLocaleDateString();
        movement.id = movements[iterator].id;
        movement.categoria = categoryObj;
        movement.tipo = movements[iterator].type;
        movement.valor = movements[iterator].value;
        movement.descricao = movements[iterator].description;

        fileReturn.movimentacoes.push(movement);
    }

    return fileReturn;
}

function GetMovementsCheckout(checkoutId) {
    return new Promise((resolve, reject) => {
        movement.findAll({
            where: {
                checkoutId: checkoutId
            },
            order: [
                ["id", "DESC"]
            ],
            include: [
                { model: category }
            ]
        }).then((movements) => {
            resolve(movements);
        }).catch((msgError) => {
            console.log("Error: " + msgError);
            reject(undefined);
        });
    });
}

async function GetMovements(req, res) {
    var userId = req.userId;
    var checkoutId = req.body.checkoutId;

    try {
        await validations.IdIsValid(checkoutId, "Invalid checkout id");
        await checkoutController.CheckoutBelongsUser(checkoutId, userId);
        var checkout = await checkoutController.GetCheckout(checkoutId); 
        var movements = await GetMovementsCheckout(checkoutId);

        if ((checkout != undefined) || (movements != undefined)) {
            res.statusCode = 200;
            res.json(FormatMovements(checkout, movements));
        } else {
            res.statusCode = 404;
            res.json({ error: "Data not found" });
        }
    } catch (msgError) {
        console.log("Error: " + msgError);
        res.statusCode = 400;
        res.json({ error: msgError });
    }
}

//Routes
router.post("/movement", authentication, (req, res) => {
    AddMovement(req, res);
});

router.delete("/movement", authentication, (req, res) => {
    DeleteMovement(req, res);
});

router.get("/movements", authentication, (req, res) => {
    GetMovements(req, res);
});

module.exports = router;