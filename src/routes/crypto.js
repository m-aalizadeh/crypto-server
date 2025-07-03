const express = require("express");
const { fetchAllCryptos } = require("../controllers/crypto");
const router = express.Router();

router.get("/allCryptos", fetchAllCryptos);

module.exports = router;
