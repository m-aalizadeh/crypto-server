const express = require("express");
const router = express.Router();

const userRouter = require("./user");
const usersRouter = require("./customer");
const fileRouter = require("./file");
const watchlistRouter = require("./watchlist");
const cryptoRouter = require("./crypto");

router.use("/user", userRouter);
router.use("/users", usersRouter);
router.use("/files", fileRouter);
router.use("/watchlist", watchlistRouter);
router.use("/", cryptoRouter);

module.exports = router;
