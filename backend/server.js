// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");

// // =====================================================
// // Routes
// // =====================================================

// const { getPool } = require("./config/db");

// const authRoutes = require("./routes/auth");
// const banksRoutes = require("./routes/banks");
// const areasRoutes = require("./routes/areas");
// const companiesRoutes = require("./routes/companies");
// const headsRoutes = require("./routes/heads");
// const membersRoutes = require("./routes/members");
// const paymentsRoutes = require("./routes/payments");
// const receiptsRoutes = require("./routes/receipts");
// const reportsRoutes = require("./routes/reports");
// const dayBookRoutes = require("./routes/dayBook");
// const dayClosingRoutes = require("./routes/dayClosing");
// const headOpeningRoutes = require("./routes/headOpening");

// const app = express();

// const PORT = process.env.PORT || 5000;

// const CLIENT_URL =
//   process.env.CLIENT_URL || "http://localhost:5173";

// // =====================================================
// // STARTUP CONFIG CHECK
// // =====================================================

// console.log("=================================");
// console.log("ENVIRONMENT CONFIGURATION");
// console.log("=================================");
// console.log("DB_SERVER:", process.env.DB_SERVER);
// console.log("DB_INSTANCE:", process.env.DB_INSTANCE);
// console.log("DB_DATABASE:", process.env.DB_DATABASE);
// console.log("DB_USER:", process.env.DB_USER);
// console.log("=================================");

// // =====================================================
// // CORS
// // =====================================================

// app.use(
//   cors({
//     origin: CLIENT_URL,
//     credentials: true,
//   })
// );

// // =====================================================
// // BODY PARSER
// // =====================================================

// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true }));

// // =====================================================
// // REQUEST LOGGER
// // =====================================================

// app.use((req, res, next) => {
//   console.log(
//     `${new Date().toISOString()} ${req.method} ${req.originalUrl}`
//   );

//   next();
// });

// // =====================================================
// // ROOT
// // =====================================================

// app.get("/", (req, res) => {
//   res.json({
//     success: true,
//     message: "IPL Temple API is running",
//   });
// });

// // =====================================================
// // HEALTH
// // =====================================================

// app.get("/api/health", async (req, res) => {
//   try {
//     const pool = await getPool();

//     await pool.request().query(
//       "SELECT 1 AS Test"
//     );

//     res.json({
//       success: true,
//       message: "API and database are working",
//       database: true,
//     });
//   } catch (error) {
//     console.error("HEALTH CHECK ERROR:", error);

//     res.status(500).json({
//       success: false,
//       message: "Database connection failed",
//       error: error.message,
//     });
//   }
// });

// // =====================================================
// // AUTH
// // =====================================================

// app.use(
//   "/api/auth",
//   authRoutes
// );

// // =====================================================
// // MASTER ROUTES
// // =====================================================

// app.use(
//   "/api/banks",
//   banksRoutes
// );

// app.use(
//   "/api/areas",
//   areasRoutes
// );

// app.use(
//   "/api/companies",
//   companiesRoutes
// );

// app.use(
//   "/api/heads",
//   headsRoutes
// );

// app.use(
//   "/api/members",
//   membersRoutes
// );

// // =====================================================
// // OPENING BALANCES
// // =====================================================

// app.use(
//   "/api/opening-balances",
//   headOpeningRoutes
// );

// // =====================================================
// // TRANSACTIONS
// // =====================================================

// app.use(
//   "/api/payments",
//   paymentsRoutes
// );

// app.use(
//   "/api/receipts",
//   receiptsRoutes
// );

// // =====================================================
// // REPORTS
// // =====================================================

// app.use(
//   "/api/reports",
//   reportsRoutes
// );

// app.use(
//   "/api/reports",
//   dayBookRoutes
// );

// // =====================================================
// // DAY CLOSING
// // =====================================================

// app.use(
//   "/api/day-closing",
//   dayClosingRoutes
// );

// // =====================================================
// // 404
// // =====================================================

// app.use((req, res) => {
//   console.log(
//     "404 NOT FOUND:",
//     req.method,
//     req.originalUrl
//   );

//   res.status(404).json({
//     success: false,
//     message: "API endpoint not found",
//     path: req.originalUrl,
//   });
// });

// // =====================================================
// // GLOBAL ERROR HANDLER
// // =====================================================

// app.use(
//   (error, req, res, next) => {
//     console.error(
//       "================================="
//     );
//     console.error(
//       "GLOBAL SERVER ERROR"
//     );
//     console.error(
//       "================================="
//     );
//     console.error(error);
//     console.error(
//       "================================="
//     );

//     if (res.headersSent) {
//       return next(error);
//     }

//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// );

// // =====================================================
// // START SERVER
// // =====================================================

// async function startServer() {
//   try {
//     console.log(
//       "================================="
//     );
//     console.log(
//       "STARTING IPL TEMPLE API"
//     );
//     console.log(
//       "================================="
//     );

//     const pool = await getPool();

//     await pool.request().query(
//       "SELECT 1 AS Test"
//     );

//     console.log(
//       "Database connection successful"
//     );

//     app.listen(PORT, () => {
//       console.log(
//         "================================="
//       );
//       console.log(
//         `Server running on port ${PORT}`
//       );
//       console.log(
//         `API: http://localhost:${PORT}/api`
//       );
//       console.log(
//         `Health: http://localhost:${PORT}/api/health`
//       );
//       console.log(
//         `Client: ${CLIENT_URL}`
//       );
//       console.log(
//         "================================="
//       );
//     });
//   } catch (error) {
//     console.error(
//       "================================="
//     );
//     console.error(
//       "SERVER STARTUP FAILED"
//     );
//     console.error(
//       "================================="
//     );
//     console.error(error);
//     console.error(
//       "================================="
//     );

//     process.exit(1);
//   }
// }

// startServer();


require("dotenv").config();

const express = require("express");
const cors = require("cors");

// =====================================================
// DATABASE
// =====================================================

const { getPool } = require("./config/db");

// =====================================================
// ROUTES
// =====================================================

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

// =====================================================
// APP
// =====================================================

const app = express();

// Render provides PORT automatically
const PORT = Number(process.env.PORT) || 5000;

// =====================================================
// CLIENT URL
// =====================================================

const CLIENT_URL =
  process.env.CLIENT_URL || "http://localhost:5173";

// =====================================================
// STARTUP CONFIGURATION
// =====================================================

console.log("");
console.log("=================================");
console.log("IPL TEMPLE API");
console.log("ENVIRONMENT CONFIGURATION");
console.log("=================================");

console.log("NODE_ENV:", process.env.NODE_ENV || "development");
console.log("PORT:", PORT);

console.log(
  "DB_SERVER:",
  process.env.DB_SERVER || "NOT SET"
);

console.log(
  "DB_PORT:",
  process.env.DB_PORT || "1433"
);

console.log(
  "DB_DATABASE:",
  process.env.DB_DATABASE || "NOT SET"
);

console.log(
  "DB_USER:",
  process.env.DB_USER ? "CONFIGURED" : "NOT SET"
);

console.log(
  "DB_PASSWORD:",
  process.env.DB_PASSWORD ? "CONFIGURED" : "NOT SET"
);

console.log(
  "CLIENT_URL:",
  CLIENT_URL
);

console.log("=================================");
console.log("");

// =====================================================
// CORS
// =====================================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  CLIENT_URL,
].filter(Boolean);

console.log("Allowed CORS Origins:");
console.log(allowedOrigins);
console.log("");

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests such as Postman/server-to-server
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("CORS BLOCKED:", origin);

      return callback(
        new Error("Not allowed by CORS")
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// =====================================================
// BODY PARSER
// =====================================================

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

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
  res.status(200).json({
    success: true,
    message: "IPL Temple API is running",
    environment: process.env.NODE_ENV || "development",
    port: PORT,
  });
});

// =====================================================
// API ROOT
// =====================================================

app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "IPL Temple API",
    version: "1.0.0",
  });
});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", async (req, res) => {
  console.log("HEALTH CHECK STARTED");

  try {
    const pool = await getPool();

    await pool.request().query(
      "SELECT 1 AS Test"
    );

    console.log(
      "HEALTH CHECK: DATABASE CONNECTED"
    );

    res.status(200).json({
      success: true,
      message: "API and database are working",
      database: true,
    });

  } catch (error) {
    console.error(
      "================================="
    );

    console.error(
      "HEALTH CHECK DATABASE ERROR"
    );

    console.error(
      error.message
    );

    console.error(
      "================================="
    );

    res.status(500).json({
      success: false,
      message: "Database connection failed",
      database: false,
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
// 404 HANDLER
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

    console.error(
      error
    );

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
      "STARTING IPL TEMPLE SERVER"
    );

    console.log(
      "================================="
    );

    // =================================================
    // IMPORTANT:
    // Start HTTP server FIRST.
    //
    // Do NOT connect to SQL Server before app.listen().
    // If SQL Server is unavailable, Render can still
    // start the web service and /api/health will report
    // the database problem.
    // =================================================

    const server = app.listen(
      PORT,
      "0.0.0.0",
      () => {
        console.log("");
        console.log(
          "================================="
        );

        console.log(
          "IPL TEMPLE BACKEND STARTED"
        );

        console.log(
          "================================="
        );

        console.log(
          `Server Port: ${PORT}`
        );

        console.log(
          "Host: 0.0.0.0"
        );

        console.log(
          `Health: /api/health`
        );

        console.log(
          `Client: ${CLIENT_URL}`
        );

        console.log(
          "================================="
        );

        console.log("");
      }
    );

    // =================================================
    // OPTIONAL DATABASE STARTUP TEST
    // =================================================

    try {
      console.log(
        "Testing SQL Server connection..."
      );

      const pool = await getPool();

      await pool.request().query(
        "SELECT 1 AS Test"
      );

      console.log("");
      console.log(
        "================================="
      );

      console.log(
        "DATABASE CONNECTION SUCCESSFUL"
      );

      console.log(
        "================================="
      );

      console.log("");

    } catch (dbError) {

      console.error("");
      console.error(
        "================================="
      );

      console.error(
        "DATABASE CONNECTION FAILED"
      );

      console.error(
        "================================="
      );

      console.error(
        dbError.message
      );

      console.error(
        "================================="
      );

      console.error("");

      console.error(
        "IMPORTANT:"
      );

      console.error(
        "The API server is still running."
      );

      console.error(
        "Check /api/health for database status."
      );

      console.error("");
    }

    // =================================================
    // GRACEFUL SHUTDOWN
    // =================================================

    process.on(
      "SIGTERM",
      () => {
        console.log(
          "SIGTERM received. Closing server..."
        );

        server.close(() => {
          console.log(
            "HTTP server closed."
          );

          process.exit(0);
        });
      }
    );

    process.on(
      "SIGINT",
      () => {
        console.log(
          "SIGINT received. Closing server..."
        );

        server.close(() => {
          console.log(
            "HTTP server closed."
          );

          process.exit(0);
        });
      }
    );

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

    console.error(
      error
    );

    console.error(
      "================================="
    );

    process.exit(1);
  }
}

// =====================================================
// START APPLICATION
// =====================================================

startServer();