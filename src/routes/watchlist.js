const express = require("express");
const { verifyToken } = require("../utils/isAuth");
const {
  getWatchlist,
  removeFromWatchlist,
  addToWatchlist,
} = require("../controllers/watchlist");
const router = express.Router();

router.use(verifyToken);
router.post("/addWatchlist", addToWatchlist);
router.delete("/removeFromWatchlist", removeFromWatchlist);
router.get("/:userId", getWatchlist);

module.exports = router;
