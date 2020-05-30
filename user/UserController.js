const express = require("express");
const router = express.Router();
const user = require("./User");
const jwt = require("jsonwebtoken");
const authentication = require("../middleware/authentication");

const jwtTokenPrivate = "virtualcheckout2020";

function NameIsValid(name) {
    return new Promise((resolve, reject) => {
        if ((name == undefined) || (name.trim() == "")) {
            reject("Invalid name!");
        }

        resolve("");
    });
}

function EmailIsValid(email) {
    return new Promise((resolve, reject) => {
        if ((email == undefined) || (email.trim() == "")) {
            reject("Invalid e-mail!");
        }

        if (!email.includes("@")) {
            reject("Invalid e-mail");
        }

        resolve("");
    });
}

function PasswordIsValid(password) {
    return new Promise((resolve, reject) => {
        if ((password == undefined) || (password.trim() == "")) {
            reject("Invalid password!");
        }

        resolve("");
    });
}

function EmailAlreadyExists(email) {
    return new Promise((resolve, reject) => {
        user.findOne({
            where: { email: email }
        }).then(userFound => {
            if (userFound != undefined) {
                reject("This e-mail is associated to another user");
            } else {
                resolve("")
            }
        }).catch((msgError) => {
            reject(msgError);
        });
    });
}

async function AddUser(req, res) {
    var { name, email, password } = req.body;

    try {
        await NameIsValid(name);
        await EmailIsValid(email);
        await PasswordIsValid(password);
        await EmailAlreadyExists(email);

        user.create({
            name: name,
            email: email,
            password: password
        }).then(() => {
            res.status = 200;
            res.json({ msg: "Success!" });
        });
    } catch (msgError) {
        res.statusCode = 400;
        res.json({ error: msgError });
    }
}

async function AuthenticateUser(req, res) {
    var { email, password } = req.body;

    try {
        await EmailIsValid(email);
        await PasswordIsValid(password);

        user.findOne({
            where: { email: email }
        }).then(userFound => {
            if (userFound != undefined) {
                if (userFound.password == password) {
                    jwt.sign(
                        { id: userFound.id, email: userFound.email },
                        jwtTokenPrivate,
                        { expiresIn: "24h" },
                        (error, token) => {
                            if (error) {
                                res.statusCode = 400;
                                res.json({ error: error });
                            } else {
                                res.statusCode = 200;
                                res.json({ token: token });
                            }
                        }
                    );
                } else {
                    res.statusCode = 401;
                    res.json({ error: "Invalid password" });
                }
            } else {
                res.statusCode = 404;
                res.json({ error: "User not found" });
            }
        });
    } catch (msgError) {
        res.statusCode = 400;
        res.json({ error: msgError });
    }
}


//Routes
router.post("/user", (req, res) => {
    AddUser(req, res);
});

router.post("/auth", (req, res) => {
    AuthenticateUser(req, res);
});

module.exports = router;