const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const { signToken } = require("../utils/isAuth");

exports.signUp = async (req, res) => {
  try {
    const { username, password, email, role } = req.body;
    const errors = validationResult(req).array();
    console.log(errors);
    if (errors.length) {
      return res.status(422).json({
        status: "error",
        message: "User creation got failed!",
        oldInput: {
          email,
          username,
          role,
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
      // token: signToken({ username, userId: newUser._id.toString() }),
      newUser,
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
    const token = signToken({ username, userId: user._id.toString() });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    return res.status(200).json({
      status: "success",
      message: "User signed in successfully",
      data: user,
      // token: token,
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

exports.logout = (req, res) => {
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
      .json({ status: "error", message: "Error during fetching users " });
  }
};
