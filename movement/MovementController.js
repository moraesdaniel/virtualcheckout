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

function AddMovement(newMovement) {
    return new Promise((resolve, reject) => {
        movement.create({
            value: newMovement.value,
            type: newMovement.type,
            description: newMovement.description,
            categoryId: newMovement.categoryId,
            checkoutId: newMovement.checkoutId
        }).then(() => {
            resolve("");
        }).catch((msgError) => {
            reject(msgError);
        });
    });
}

async function Add(req, res) {
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

        await AddMovement({
            value: value,
            type: type,
            description: description,
            categoryId: categoryId,
            checkoutId: checkoutId
        });

        checkoutController.UpdateTotalBalance(checkoutId, value, type).then(() => {
            res.statusCode = 200;
            res.json({ msg: "Success" });
        });
    } catch (msgError) {
        console.log("Error: " + msgError);
        res.statusCode = 400;
        res.json({ error: msgError });
    }
}

function DeleteMovement(id, checkoutId) {
    return new Promise((resolve, reject) => {
        movement.destroy({
            where: {
                id: id,
                checkoutId: checkoutId
            }
        }).then((deletedRows) => {
            if (deletedRows > 0) {
                resolve("");
            } else {
                reject("Movement not found" );
            }
        }).catch((msgError) => {
            reject(msgError);
        });
    });
}

async function Delete(req, res) {
    var userId = req.userId;
    var { checkoutId, id } = req.body;
    var msgReturn = "";

    try {
        await validations.IdIsValid(id, "Invalid id!");
        await validations.IdIsValid(checkoutId, "Invalid checkout id!");
        await checkoutController.CheckoutBelongsUser(checkoutId, userId);

        var movementDeleted = await GetMovement(id, checkoutId);

        msgReturn = await DeleteMovement(id, checkoutId);

        if (msgReturn != "") {
            res.statusCode = 500;
            res.json({ error: msgReturn });
        } else {
            checkoutController.UpdateTotalBalance(checkoutId, (movementDeleted.value * -1), movementDeleted.type).then(() => {
                res.statusCode = 200;
                res.json({ msg: "Success" });
            });
        }
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

function GetMovement(id, checkoutId) {
    return new Promise((resolve, reject) => {
        movement.findOne({
            where: {
                id: id,
                checkoutId: checkoutId
            }
        }).then((movementFound) => {
            resolve(movementFound);
        }).catch((msgError) => {
            console.log("Error: " + msgError);
            reject(msgError);
        });
    });
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
    Add(req, res);
});

router.delete("/movement", authentication, (req, res) => {
    Delete(req, res);
});

router.get("/movements", authentication, (req, res) => {
    GetMovements(req, res);
});

module.exports = router;