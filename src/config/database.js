const mongoose = require("mongoose");

exports.connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { authSource: "admin" });
    console.log("MongoDB connection established...");
  } catch (error) {
    console.error(error.message);
  }
};
