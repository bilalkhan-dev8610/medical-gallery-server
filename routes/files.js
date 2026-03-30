const express = require("express");
const router = express.Router();
const File = require("../models/File");
const { upload, cloudinary } = require("../middleware/cloudinary");

// POST /api/upload — Upload file to Cloudinary and save to MongoDB
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { title, category } = req.body;

    if (!title || !category) {
      return res.status(400).json({ error: "Title and category are required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const isPdf = req.file.mimetype === "application/pdf";

    const newFile = new File({
      title: title.trim(),
      fileUrl: req.file.path,       // Cloudinary URL
      publicId: req.file.filename,  // Cloudinary public_id
      fileType: isPdf ? "pdf" : "image",
      category,
    });

    await newFile.save();

    res.status(201).json({
      message: "File uploaded successfully",
      file: newFile,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message || "Upload failed" });
  }
});

// GET /api/files — Get all files (optional ?category=XYZ filter)
router.get("/files", async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category && category !== "All" ? { category } : {};

    const files = await File.find(filter).sort({ createdAt: -1 });
    res.json(files);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

// DELETE /api/file/:id — Delete from MongoDB and Cloudinary
router.delete("/file/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Delete from Cloudinary
    const resourceType = file.fileType === "pdf" ? "raw" : "image";
    await cloudinary.uploader.destroy(file.publicId, {
      resource_type: resourceType,
    });

    // Delete from MongoDB
    await File.findByIdAndDelete(req.params.id);

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

module.exports = router;
