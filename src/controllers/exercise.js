const User = require("../models/User");
const Exercise = require("../models/Exercise");
const { validationResult } = require("express-validator");

exports.addExercise = async (req, res) => {
  const errors = validationResult(req).array();
  const { body } = req;
  if (errors.length) {
    return res.status(422).json({
      status: "error",
      exercise: body,
      message: "Exercise creation got failed!",
      validationErrors: errors,
    });
  }
  Exercise.create(body)
    .then((dbExerciseData) => {
      return User.findOneAndUpdate(
        { _id: body.userId },
        { $push: { exercise: dbExerciseData._id } },
        { new: true }
      );
    })
    .then((dbUserData) => {
      if (!dbUserData) {
        return res.status(404).json({
          status: "error",
          message: "Exercise created but there is no user with this id!",
        });
      }
      res.json({ status: "error", message: "Exercise created successfully!" });
    })
    .catch((err) => err.status(500).json(err));
};

exports.getExerciseById = async ({ query = {} }, res) => {
  try {
    const { page = 0, limit = 5, userId } = query;
    const exercises = await Exercise.find({
      userId,
    })
      .limit(+limit)
      .skip(+page * +limit);
    const count = await Exercise.countDocuments();
    return res.status(200).json({
      status: "success",
      exercises,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Error during fetching exercises " + err.message,
    });
  }
};

exports.deleteExercise = async ({ params }, res) => {
  Exercise.findOneAndDelete({ _id: params.id })
    .then((dbExerciseData) => {
      if (!dbExerciseData) {
        return res.status(404).json({
          status: "error",
          message: "No exercise data found with this id!",
        });
      }
      return User.findOneAndUpdate(
        { exercise: params.id },
        { $pull: { exercise: params.id } },
        { new: true }
      );
    })
    .then((dbUserData) => {
      if (!dbUserData) {
        return res.status(404).json({
          status: "error",
          message: "Exercise deleted but there is no user with this id!",
        });
      }
      res.json({ status: "error", message: "Exercise deleted successfully!" });
    })
    .catch((err) =>
      res
        .status(500)
        .json({ status: "error", message: "Error while deleteing user" })
    );
};

exports.updateExercise = async (req, res) => {
  const { params = {}, body } = req;
  try {
    if (!Object.keys(body).length) {
      return res
        .status(400)
        .json({ status: "error", message: "There is no data to update" });
    }
    const exercise = await Exercise.findOne({ _id: params.id });
    const newData = {};
    Object.keys(body).forEach((field) => {
      if (body[field] !== exercise[field]) {
        newData[field] = body[field];
      }
    });
    if (!Object.keys(newData).length) {
      return res
        .status(400)
        .json({ status: "error", message: "Please modify the properties!" });
    }
    const newExercise = await Exercise.findOneAndUpdate(
      { _id: params.id },
      newData,
      { new: true }
    );
    return res.status(200).json({
      status: "success",
      message: "Exercise updated Successfully!",
      exercise: newExercise,
    });
  } catch (err) {
    return res
      .status(500)
      .json({
        status: "error",
        message: "Error during update exercise " + err.message,
      });
  }
};
