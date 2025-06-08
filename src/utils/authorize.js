const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.checkAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const decoded = await jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.userId);
    if (user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Only admin user is allowed to take this action!!",
      });
    }
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Something went wrong" });
  }
};
