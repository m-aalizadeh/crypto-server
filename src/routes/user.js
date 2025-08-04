const express = require("express");
const { check, body } = require("express-validator");
const User = require("../models/User");
const {
  logout,
  signUp,
  signin,
  updateUser,
  getAllUsers,
  validateToken,
  getCurrentUser,
} = require("../controllers/user");
const { getCsrfToken } = require("../controllers/csrf");
const { verifyToken } = require("../utils/isAuth");
const { csrfProtection, ensureCsrfToken } = require("../utils/csrf");
const router = express.Router();

router.get("/csrf-token", csrfProtection, getCsrfToken);
router.post(
  "/signup",
  //csrfProtection,
  //ensureCsrfToken,
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "E-Mail exists already, please pick a different one."
            );
          }
        });
      })
      .normalizeEmail(),
    body("username")
      .isString()
      .withMessage("Username must be string!")
      .isLength({ min: 5, max: 20 })
      .withMessage(
        "Minimum length for username is 5, Maximum length for username is 20."
      )
      .custom((value, { req }) => {
        return User.findOne({ username: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "Username exists already, please pick a different one."
            );
          }
        });
      })
      .trim(),
    body("password")
      .isLength({ min: 5, max: 15 })
      .withMessage(
        "Minimum length for password is 5, Maximum length for password is 15."
      )
      .isAlphanumeric()
      .trim(),
  ],
  signUp
);

router.post(
  "/signin",
  //csrfProtection,
  //ensureCsrfToken,
  [
    body("username").isString().withMessage("Username must be string!").trim(),
    body("password")
      .isLength({ min: 5, max: 15 })
      .withMessage(
        "Minimum length for password is 5, Maximum length for password is 15."
      )
      .isAlphanumeric()
      .trim(),
  ],
  signin
);
router.get("/logout", logout);
router.get("/currentUser", verifyToken, getCurrentUser);
router.get("/allUsers", verifyToken, getAllUsers);
router.get("/verifyToken", verifyToken, validateToken);
router.patch("/updateUser/:id", updateUser);

module.exports = router;
