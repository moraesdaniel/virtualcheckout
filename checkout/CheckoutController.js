const express = require("express");
const router = express.Router();

router.get("/checkouts", (req, res) => {
    res.send("Rota de checkouts");
});

module.exports = router;