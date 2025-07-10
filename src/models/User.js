const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  username: {
    type: String,
    trim: true,
    unique: true,
    required: "Username is required",
  },
  email: { type: String, unique: true, match: [/.+@.+\..+/] },
  password: {
    type: String,
    trim: true,
    minLength: 6,
    required: "Password is required",
  },
  role: {
    type: String,
    enum: ["admin", "mentor"],
    default: "admin",
  },
  online: { type: Boolean, default: false },
});

const User = model("User", userSchema);

module.exports = User;
