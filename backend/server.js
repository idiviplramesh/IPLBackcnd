require("dotenv").config();

const express = require("express");
const cors = require("cors");

// =====================================================
// Routes
// =====================================================

const { getPool } = require("./config/db");

const authRoutes = require("./routes/auth");
const banksRoutes = require("./routes/banks");
const areasRoutes = require("./routes/areas");
const companiesRoutes = require("./routes/companies");
const headsRoutes = require("./routes/heads");
const membersRoutes = require("./routes/members");
const paymentsRoutes = require("./routes/payments");
const receiptsRoutes = require("./routes/receipts");
const reportsRoutes = require("./routes/reports");
const dayBookRoutes = require("./routes/dayBook");
const dayClosingRoutes = require("./routes/dayClosing");
const headOpeningRoutes = require("./routes/headOpening");

const app = express();

const PORT = process.env.PORT || 5000;

const CLIENT_URL =
  process.env.CLIENT_URL || "http://localhost:5173";

// =====================================================
// STARTUP CONFIG CHECK
// =====================================================

console.log("=================================");
console.log("ENVIRONMENT CONFIGURATION");
console.log("=================================");
console.log("DB_SERVER:", process.env.DB_SERVER);
console.log("DB_INSTANCE:", process.env.DB_INSTANCE);
console.log("DB_DATABASE:", process.env.DB_DATABASE);
console.log("DB_USER:", process.env.DB_USER);
console.log("=================================");

// =====================================================
// CORS
// =====================================================

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

// =====================================================
// BODY PARSER
// =====================================================

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// =====================================================
// REQUEST LOGGER
// =====================================================

app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} ${req.method} ${req.originalUrl}`
  );

  next();
});

// =====================================================
// ROOT
// =====================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "IPL Temple API is running",
  });
});

// =====================================================
// HEALTH
// =====================================================

app.get("/api/health", async (req, res) => {
  try {
    const pool = await getPool();

    await pool.request().query(
      "SELECT 1 AS Test"
    );

    res.json({
      success: true,
      message: "API and database are working",
      database: true,
    });
  } catch (error) {
    console.error("HEALTH CHECK ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// =====================================================
// AUTH
// =====================================================

app.use(
  "/api/auth",
  authRoutes
);

// =====================================================
// MASTER ROUTES
// =====================================================

app.use(
  "/api/banks",
  banksRoutes
);

app.use(
  "/api/areas",
  areasRoutes
);

app.use(
  "/api/companies",
  companiesRoutes
);

app.use(
  "/api/heads",
  headsRoutes
);

app.use(
  "/api/members",
  membersRoutes
);

// =====================================================
// OPENING BALANCES
// =====================================================

app.use(
  "/api/opening-balances",
  headOpeningRoutes
);

// =====================================================
// TRANSACTIONS
// =====================================================

app.use(
  "/api/payments",
  paymentsRoutes
);

app.use(
  "/api/receipts",
  receiptsRoutes
);

// =====================================================
// REPORTS
// =====================================================

app.use(
  "/api/reports",
  reportsRoutes
);

app.use(
  "/api/reports",
  dayBookRoutes
);

// =====================================================
// DAY CLOSING
// =====================================================

app.use(
  "/api/day-closing",
  dayClosingRoutes
);

// =====================================================
// 404
// =====================================================

app.use((req, res) => {
  console.log(
    "404 NOT FOUND:",
    req.method,
    req.originalUrl
  );

  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
  });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
  (error, req, res, next) => {
    console.error(
      "================================="
    );
    console.error(
      "GLOBAL SERVER ERROR"
    );
    console.error(
      "================================="
    );
    console.error(error);
    console.error(
      "================================="
    );

    if (res.headersSent) {
      return next(error);
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
);

// =====================================================
// START SERVER
// =====================================================

async function startServer() {
  try {
    console.log(
      "================================="
    );
    console.log(
      "STARTING IPL TEMPLE API"
    );
    console.log(
      "================================="
    );

    const pool = await getPool();

    await pool.request().query(
      "SELECT 1 AS Test"
    );

    console.log(
      "Database connection successful"
    );

    app.listen(PORT, () => {
      console.log(
        "================================="
      );
      console.log(
        `Server running on port ${PORT}`
      );
      console.log(
        `API: http://localhost:${PORT}/api`
      );
      console.log(
        `Health: http://localhost:${PORT}/api/health`
      );
      console.log(
        `Client: ${CLIENT_URL}`
      );
      console.log(
        "================================="
      );
    });
  } catch (error) {
    console.error(
      "================================="
    );
    console.error(
      "SERVER STARTUP FAILED"
    );
    console.error(
      "================================="
    );
    console.error(error);
    console.error(
      "================================="
    );

    process.exit(1);
  }
}

startServer();