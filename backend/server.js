const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { getPool } = require("./config/db");
const authRoutes = require("./routes/auth");
const areaRoutes = require("./routes/areas");
const bankRoutes = require("./routes/banks");
const companyRoutes = require("./routes/companies");
const memberRoutes = require("./routes/members");

const app = express();

const PORT = process.env.PORT || 5000;

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// =====================================================
// TEST ROUTE
// =====================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "IPL Temple Backend API",
  });
});

// =====================================================
// HEALTH
// =====================================================

app.get("/api/health", async (req, res) => {
  try {
    const pool = await getPool();

    await pool.request().query("SELECT 1 AS Connected");

    res.json({
      success: true,
      message: "Backend and SQL Server are connected",
    });
  } catch (error) {
    console.error("DATABASE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// =====================================================
// AUTH ROUTES
// =====================================================

app.use("/api/auth", authRoutes);

// =====================================================
// FEATURE ROUTES
// =====================================================

app.use("/api/areas", areaRoutes);
app.use("/api/banks", bankRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/members", memberRoutes);

// =====================================================
// 404
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
  });
});

// =====================================================
// START SERVER
// =====================================================

const server = app.listen(PORT, () => {
  console.log("=================================");
  console.log("Temple Backend Started");
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`Auth: http://localhost:${PORT}/api/auth`);
  console.log("=================================");
});

// =====================================================
// SERVER ERROR
// =====================================================

server.on("error", (error) => {
  console.error("SERVER START ERROR:", error);
});

// =====================================================
// PROCESS ERROR
// =====================================================

process.on("uncaughtException", (error) => {
  console.error("UNCAUGHT EXCEPTION:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("UNHANDLED REJECTION:", error);
});