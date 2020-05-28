const express = require("express");
const router = express.Router();
const user = require("./User");
const jwt = require("jsonwebtoken");
const authentication = require("../middleware/authentication");

const jwtTokenPrivate = "virtualcheckout2020";

router.post("/user", (req, res) => {
    var { name, email, password } = req.body;
    
    if (name == undefined) {
        res.statusCode = 400;
        res.json({ error: "Invalid name" });
    }

    if (email == undefined) {
        res.statusCode = 400;
        res.json({ error: "Invalid e-mail" });
    } else {
        user.findOne({
            where: { email: email }
        }).then(userFound => {
            if (userFound != undefined) {
                res.statusCode = 400;
                res.json({ error: "This e-mail is associated to another user" });
            }
        });
    }

    if (password == undefined) {
        res.statusCode = 400;
        res.json({ error: "Invalid password" });
    }

    user.create({
        name: name,
        email: email,
        password: password
    }).then(() => {
        res.status = 200;
        res.redirect("/");
    }).catch((msgErro) => {
        res.status = 500;
        res.send(msgErro)
    })
});

router.post("/auth", (req, res) => {
    var { email, password } = req.body;

    if (email != undefined) {
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
    }
});

router.get("/users", authentication, (req, res) => {
    res.send("Rota de usuários" + " ID: "+ req.userId + " Email: " + req.userEmail);
});

module.exports = router;