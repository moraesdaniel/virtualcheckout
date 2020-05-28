const jwt = require("jsonwebtoken");

const jwtTokenPrivate = "virtualcheckout2020";

function auth(req, res, next) {
    const authToken = req.headers['authorization'];
    if (authToken != undefined) {
        const tokenArray = authToken.split(" ");
        var token = tokenArray[1];

        jwt.verify(token, jwtTokenPrivate, (error, data) => {
            if (error) {
                res.statusCode = 401;
                res.json({ error: error });
            } else {
                req.userId = data.id;
                req.userEmail = data.email;
                next();
            }
        });
    } else {
        res.statusCode = 401;
        res.json({ error: "Invalid token!" });
    }
}

module.exports = auth;