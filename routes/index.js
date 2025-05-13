const express = require("express");
const router = express.Router();

const userRouter = require("./user");
const usersRouter = require("./customer");
const fileRouter = require("./file");

router.use("/user", userRouter);
router.use("/users", usersRouter);
router.use("/files", fileRouter);

module.exports = router;
