const { Schema, model } = require("mongoose");

const exerciseSchema = new Schema({
  type: { type: String },
  name: { type: String, maxLength: 30 },
  duration: { type: Number },
  date: { type: Date },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const Exercise = model("Exercise", exerciseSchema);

module.exports = Exercise;
