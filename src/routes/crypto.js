const express = require("express");
const { fetchAllCryptos } = require("../controllers/watchlist");
const router = express.Router();

router.get("/allCryptos", fetchAllCryptos);

module.exports = router;
