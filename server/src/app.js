const express = require("express");
const cors = require("cors");
const path = require("path");
const routes = require("./routes");

const app = express();

// ── Global middleware ──
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads folder
const uploadsDir = process.env.UPLOAD_DIR || "uploads";
app.use("/uploads", express.static(path.resolve(uploadsDir)));

// ── API routes ──
app.use("/api", routes);

// ── Health check ──
app.get("/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// ── 404 handler ──
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
});

// ── Global error handler ──
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

module.exports = app;
