const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const { signToken } = require("../utils/isAuth");

exports.signUp = async (req, res) => {
  try {
    const { username, password, email, role, status } = req.body;
    const errors = validationResult(req).array();
    if (errors.length) {
      return res.status(422).json({
        status: "error",
        message: "User creation got failed!",
        oldInput: {
          email,
          username,
          role,
          status,
        },
        validationErrors: errors,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
      status: "active",
      online: true,
    });
    await newUser.save();
    const token = signToken({ username, userId: newUser._id.toString() });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      status: "success",
      message: "User Created Successfully",
      token,
      user: newUser,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Error creating user" });
  }
};

exports.signin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const errors = validationResult(req).array();
    if (errors.length) {
      return res.status(422).json({
        status: "error",
        message: "User signin got failed!",
        validationErrors: errors,
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid username or password" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid password" });
    }
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        online: true,
      },
      { new: true }
    );
    const token = signToken({ username, userId: user._id.toString() });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      status: "success",
      message: "User signed in successfully",
      token,
      user: updatedUser,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Error during signin" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    return res.status(200).json({ status: "success", users });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Error during fetching users " });
  }
};

exports.logout = async (req, res) => {
  const token = req.cookies.token;
  const decoded = await jwt.verify(token, process.env.SECRET_KEY);
  await User.findByIdAndUpdate(
    decoded.userId,
    {
      online: false,
    },
    { new: true }
  );
  res.clearCookie("token");
  res
    .status(200)
    .json({ status: "success", message: "Logged out successfully" });
};

exports.getCurrentUser = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = await jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }
    return res.status(200).json({ status: "success", user });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Error during fetching users " });
  }
};

exports.validateToken = async (req, res) => {
  try {
    return res
      .status(200)
      .json({ status: "success", message: "Token is valid" });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Token got expired! " });
  }
};

exports.updateUser = async (req, res) => {
  const { params = {}, body } = req;
  try {
    if (!Object.keys(body).length) {
      return res
        .status(400)
        .json({ status: "error", message: "There is no data to update" });
    }
    const user = await User.findOne({ _id: params.id });
    const newData = {};
    Object.keys(body).forEach((field) => {
      if (body[field] !== user[field]) {
        newData[field] = body[field];
      }
    });
    if (!Object.keys(newData).length) {
      return res
        .status(400)
        .json({ status: "error", message: "Please modify the properties!" });
    }
    const newUser = await User.findOneAndUpdate({ _id: params.id }, newData, {
      new: true,
    });
    return res.status(200).json({
      status: "success",
      message: "User updated Successfully!",
      user: newUser,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Error during update customer  " + err.message,
    });
  }
};

exports.deleteUser = async ({ params }, res) => {
  User.findOneAndDelete({ _id: params.id })
    .then((dbUserData) => {
      if (!dbUserData) {
        return res.status(404).json({
          message: "No user data found with this id!",
          status: "error",
        });
      }
      res.json({ message: "User deleted successfully!", status: "success" });
    })
    .catch((err) =>
      res
        .status(500)
        .json({ status: "error", message: "Error during delete user" })
    );
};
