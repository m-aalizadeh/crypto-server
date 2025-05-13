const { Schema, model } = require("mongoose");

const fileSchema = new Schema({
  userId: String,
  name: String,
  data: Buffer,
  contentType: String,
  size: Number,
  uploadDate: { type: Date, default: Date.now },
});

const File = model("File", fileSchema);
module.exports = File;
