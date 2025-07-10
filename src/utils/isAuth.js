const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ status: "error", message: "Token is not available" });
    }
    const decoded = await jwt.verify(token, process.env.SECRET_KEY);
    if (!decoded) {
      throw new Error();
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ status: "error", message: "Token is not valid!" });
  }
};

exports.signToken = (payload) => {
  return jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

exports.validateToken = async (token) => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.SECRET_KEY || "1234!@#%<{*&)"
    );
    const user = await User.findById(decoded.userId);
    return user;
  } catch (error) {
    console.error("Token validation error:", error);
    return null;
  }
};
