const express = require("express");
const { body, check } = require("express-validator");
const router = express.Router();
const {
  addExercise,
  getExerciseById,
  deleteExercise,
  updateExercise,
} = require("../controllers/exercise");
const { verifyToken } = require("../utils/isAuth");

router.use(verifyToken);
router.post(
  "/add",
  [
    body("type")
      .notEmpty()
      .withMessage("Type is required")
      .isString()
      .isLength({ min: 5, max: 15 })
      .withMessage(
        "Minimum length for type is 5, Maximum length for type is 15."
      )
      .trim(),
    body("name")
      .notEmpty()
      .withMessage("Name is required")
      .isString()
      .isLength({ min: 5, max: 25 })
      .withMessage(
        "Minimum length for name is 5, Maximum length for name is 15."
      )
      .trim(),
    body("duration")
      .notEmpty()
      .withMessage("Duration is required")
      .isNumeric()
      .withMessage("Duration must be number")
      .trim(),
    body("date")
      .notEmpty()
      .withMessage("Date is required")
      .isDate()
      .withMessage("Date format is invalid")
      .trim(),
    check("userId")
      .notEmpty()
      .withMessage("UserId is required")
      .isMongoId()
      .withMessage("UserId must only contain UUIDs."),
  ],
  addExercise
);

router.get("/all", getExerciseById);
router.delete("/delete/:id", deleteExercise);
router.patch("/updateExercise/:id", updateExercise);

module.exports = router;
