const express = require("express");
const { check, body } = require("express-validator");
const Customer = require("../models/Customer");
const {
  addUser,
  getUser,
  getAllUsers,
  updateUser,
  deleteUser,
} = require("../controllers/customer");
const { verifyToken } = require("../utils/isAuth");
const { checkAdmin } = require("../utils/authorize");
const router = express.Router();

const UserStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

router.use(verifyToken);
router.use(checkAdmin);
router.post(
  "/addUser",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value) => {
        return Customer.findOne({ email: value }).then((userDoc) => {
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
      .isLength({ min: 4, max: 20 })
      .withMessage(
        "Minimum length for username is 5, Maximum length for username is 20."
      )
      .custom((value, { req }) => {
        return Customer.findOne({ username: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "Username exists already, please pick a different one."
            );
          }
        });
      })
      .trim(),
    body("name")
      .isString()
      .isLength({ min: 10, max: 25 })
      .withMessage(
        "Minimum length for name is 15, Maximum length for name is 25."
      )
      .trim(),
    body("status")
      .isString()
      .isIn(Object.values(UserStatus))
      .withMessage("Invalid status"),
    body("phoneNumber")
      .trim()
      .notEmpty()
      .withMessage("Phone number is required")
      .matches(/^\d{10}$/)
      .withMessage("Invalid phone number format"),
  ],
  addUser
);

router.get("/allUsers", getAllUsers);
router.delete("/deleteUser/:id", deleteUser);
router.patch("/updateUser/:id", updateUser);
router.get("/getUser/:id", getUser);

module.exports = router;
