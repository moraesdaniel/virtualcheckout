const express = require("express");
const router = express.Router();

router.get("/moves", (req, res) => {
    res.send("Rota de movimenta��es");
});

module.exports = router;