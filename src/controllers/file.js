const File = require("../models/file");

exports.uploadFile = async (req, res) => {
  const { originalName, buffer, mimetype, size } = req.file;
  const { userId } = req.params;
  try {
    const newFile = new File({
      name: originalName,
      data: buffer,
      contentType: mimetype,
      size,
      userId,
    });
    await newFile.save();
    return res.status(200).json({
      status: "success",
      message: "File uploaded successfully",
      file: newFile,
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

exports.getFile = async (req, res) => {
  try {
    const file = await File.findOne({ userId: req.params.userId }).sort({
      uploadDate: -1,
    });
    if (!file) {
      return res
        .status(404)
        .json({ status: "error", message: "File not found" });
    }
    res.set("Content-Type", file.contentType);
    res.set("Content-Disposition", `attachment; filename="${file.name}"`);
    return res.status(200).json({ status: "success", file: file.data });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
