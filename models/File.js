const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  publicId: {
    type: String, // Cloudinary public_id for deletion
    required: true,
  },
  fileType: {
    type: String, // "image" or "pdf"
    enum: ["image", "pdf"],
    required: true,
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    enum: ["X-ray", "MRI", "Reports", "Other"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("File", fileSchema);
