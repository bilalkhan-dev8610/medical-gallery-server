const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const fileRoutes = require("./routes/files");

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000" ,"https://gallery-portal01.netlify.app",],
  
  methods: ["GET", "POST", "DELETE"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", fileRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Medical Gallery API is running" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// Connect to MongoDB, then start server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
