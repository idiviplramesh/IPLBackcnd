// ============================================================
// TEMPLE MANAGEMENT - AUTH ROUTES
// ============================================================

const express = require("express");
const jwt = require("jsonwebtoken");

const { getPool, sql } = require("../config/db");

const router = express.Router();

const JWT_SECRET =
  process.env.JWT_SECRET || "ipltemple_secret_2026";

// ============================================================
// AUTHENTICATE TOKEN
// ============================================================

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    console.error("JWT ERROR:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

// ============================================================
// ADMIN ONLY
// ============================================================

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const userType = String(
    req.user.UserType || ""
  )
    .trim()
    .toUpperCase();

  if (userType !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Only ADMIN users can perform this action",
    });
  }

  next();
}

// ============================================================
// AUTH TEST
// GET /api/auth
// ============================================================

router.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Authentication API is working",
  });
});

// ============================================================
// AUTH TEST
// GET /api/auth/test
// ============================================================

router.get("/test", (req, res) => {
  return res.json({
    success: true,
    message: "Auth router is working",
  });
});

// ============================================================
// GET FINANCIAL YEARS
// GET /api/auth/financial-years
// ============================================================

router.get("/financial-years", async (req, res) => {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT
        FYCode,
        FYear,
        FYStart,
        FYEnd,
        LSDate
      FROM dbo.tbl_FYear
      ORDER BY FYStart DESC
    `);

    return res.status(200).json({
      success: true,
      data: result.recordset || [],
      financialYears: result.recordset || [],
      count: result.recordset.length,
    });
  } catch (error) {
    console.error(
      "FINANCIAL YEAR ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load financial years",
      error: error.message,
    });
  }
});

// ============================================================
// CREATE ADMIN
// POST /api/auth/create-admin
// ============================================================

router.post("/create-admin", async (req, res) => {
  try {
    const {
      username,
      password,
    } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Username and password are required",
      });
    }

    const cleanUsername =
      String(username).trim();

    const cleanPassword =
      String(password);

    if (cleanUsername.length < 3) {
      return res.status(400).json({
        success: false,
        message:
          "Username must contain at least 3 characters",
      });
    }

    if (cleanUsername.length > 50) {
      return res.status(400).json({
        success: false,
        message:
          "Username cannot exceed 50 characters",
      });
    }

    if (cleanPassword.length < 4) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 4 characters",
      });
    }

    if (cleanPassword.length > 50) {
      return res.status(400).json({
        success: false,
        message:
          "Password cannot exceed 50 characters",
      });
    }

    const pool = await getPool();

    // Check username
    const existingUser =
      await pool
        .request()
        .input(
          "UserName",
          sql.VarChar(50),
          cleanUsername
        )
        .query(`
          SELECT TOP 1
            UserCode,
            UserName
          FROM dbo.tbl_User
          WHERE UserName = @UserName
        `);

    if (existingUser.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }

    // Next user code
    const nextCodeResult =
      await pool.request().query(`
        SELECT
          ISNULL(MAX(UserCode), 0) + 1 AS NextUserCode
        FROM dbo.tbl_User
      `);

    const userCode =
      nextCodeResult.recordset[0].NextUserCode;

    // Create ADMIN
    await pool
      .request()
      .input(
        "UserCode",
        sql.Int,
        userCode
      )
      .input(
        "UserName",
        sql.VarChar(50),
        cleanUsername
      )
      .input(
        "Password",
        sql.NVarChar(50),
        cleanPassword
      )
      .input(
        "UserType",
        sql.VarChar(20),
        "ADMIN"
      )
      .input(
        "CreatedDate",
        sql.DateTime,
        new Date()
      )
      .query(`
        INSERT INTO dbo.tbl_User
        (
          UserCode,
          UserName,
          Password,
          UserType,
          CreatedDate
        )
        VALUES
        (
          @UserCode,
          @UserName,
          @Password,
          @UserType,
          @CreatedDate
        )
      `);

    return res.status(201).json({
      success: true,
      message: "Admin user created successfully",
      user: {
        UserCode: userCode,
        UserName: cleanUsername,
        UserType: "ADMIN",
      },
    });

  } catch (error) {
    console.error(
      "CREATE ADMIN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to create admin user",
      error: error.message,
    });
  }
});

// ============================================================
// CREATE USER
// POST /api/auth/create-user
//
// ONLY ADMIN CAN CREATE USERS
// ============================================================

router.post(
  "/create-user",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        userCode,
        username,
        password,
        userType,
      } = req.body;

      // ------------------------------------------------------
      // VALIDATION
      // ------------------------------------------------------

      if (
        userCode === undefined ||
        userCode === null ||
        userCode === ""
      ) {
        return res.status(400).json({
          success: false,
          message: "User Code is required",
        });
      }

      const cleanUserCode =
        Number(userCode);

      if (
        !Number.isInteger(cleanUserCode) ||
        cleanUserCode <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid User Code",
        });
      }

      if (!username) {
        return res.status(400).json({
          success: false,
          message: "Username is required",
        });
      }

      if (!password) {
        return res.status(400).json({
          success: false,
          message: "Password is required",
        });
      }

      const cleanUsername =
        String(username).trim();

      const cleanPassword =
        String(password);

      const cleanUserType =
        String(userType || "MEMBER")
          .trim()
          .toUpperCase();

      if (cleanUsername.length < 3) {
        return res.status(400).json({
          success: false,
          message:
            "Username must contain at least 3 characters",
        });
      }

      if (cleanUsername.length > 50) {
        return res.status(400).json({
          success: false,
          message:
            "Username cannot exceed 50 characters",
        });
      }

      if (cleanPassword.length < 4) {
        return res.status(400).json({
          success: false,
          message:
            "Password must contain at least 4 characters",
        });
      }

      if (cleanPassword.length > 50) {
        return res.status(400).json({
          success: false,
          message:
            "Password cannot exceed 50 characters",
        });
      }

      if (
        !["ADMIN", "MEMBER"].includes(
          cleanUserType
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "User Type must be ADMIN or MEMBER",
        });
      }

      const pool = await getPool();

      // ------------------------------------------------------
      // CHECK USER CODE
      // ------------------------------------------------------

      const codeExists =
        await pool
          .request()
          .input(
            "UserCode",
            sql.Int,
            cleanUserCode
          )
          .query(`
            SELECT TOP 1
              UserCode,
              UserName
            FROM dbo.tbl_User
            WHERE UserCode = @UserCode
          `);

      if (codeExists.recordset.length > 0) {
        return res.status(409).json({
          success: false,
          message:
            "User Code already exists",
        });
      }

      // ------------------------------------------------------
      // CHECK USERNAME
      // ------------------------------------------------------

      const usernameExists =
        await pool
          .request()
          .input(
            "UserName",
            sql.VarChar(50),
            cleanUsername
          )
          .query(`
            SELECT TOP 1
              UserCode,
              UserName
            FROM dbo.tbl_User
            WHERE UserName = @UserName
          `);

      if (usernameExists.recordset.length > 0) {
        return res.status(409).json({
          success: false,
          message:
            "Username already exists",
        });
      }

      // ------------------------------------------------------
      // CREATE USER
      // ------------------------------------------------------

      await pool
        .request()
        .input(
          "UserCode",
          sql.Int,
          cleanUserCode
        )
        .input(
          "UserName",
          sql.VarChar(50),
          cleanUsername
        )
        .input(
          "Password",
          sql.NVarChar(50),
          cleanPassword
        )
        .input(
          "UserType",
          sql.VarChar(20),
          cleanUserType
        )
        .input(
          "CreatedDate",
          sql.DateTime,
          new Date()
        )
        .query(`
          INSERT INTO dbo.tbl_User
          (
            UserCode,
            UserName,
            Password,
            UserType,
            CreatedDate
          )
          VALUES
          (
            @UserCode,
            @UserName,
            @Password,
            @UserType,
            @CreatedDate
          )
        `);

      console.log(
        "USER CREATED:",
        cleanUserCode,
        cleanUsername,
        cleanUserType
      );

      return res.status(201).json({
        success: true,
        message:
          "User created successfully",
        user: {
          UserCode: cleanUserCode,
          UserName: cleanUsername,
          UserType: cleanUserType,
        },
      });

    } catch (error) {
      console.error(
        "CREATE USER ERROR:",
        error
      );

      if (
        error.number === 2627 ||
        error.number === 2601
      ) {
        return res.status(409).json({
          success: false,
          message:
            "User Code or Username already exists",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Unable to create user",
        error: error.message,
      });
    }
  }
);

// ============================================================
// LOGIN
// POST /api/auth/login
// ============================================================

router.post("/login", async (req, res) => {
  try {
    const {
      username,
      password,
      fyCode,
    } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Username and password are required",
      });
    }

    if (
      fyCode === undefined ||
      fyCode === null ||
      fyCode === ""
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Financial Year is required",
      });
    }

    const cleanUsername =
      String(username).trim();

    const cleanPassword =
      String(password);

    const cleanFYCode =
      Number(fyCode);

    if (!Number.isInteger(cleanFYCode)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Financial Year",
      });
    }

    const pool = await getPool();

    // ------------------------------------------------------
    // FIND USER
    // IMPORTANT: UserType included
    // ------------------------------------------------------

    const result =
      await pool
        .request()
        .input(
          "UserName",
          sql.VarChar(50),
          cleanUsername
        )
        .query(`
          SELECT TOP 1
            UserCode,
            UserName,
            Password,
            UserType,
            CreatedDate
          FROM dbo.tbl_User
          WHERE UserName = @UserName
        `);

    if (result.recordset.length === 0) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid username or password",
      });
    }

    const user =
      result.recordset[0];

    // ------------------------------------------------------
    // PASSWORD
    // ------------------------------------------------------

    if (
      String(user.Password) !==
      cleanPassword
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid username or password",
      });
    }

    // ------------------------------------------------------
    // FINANCIAL YEAR
    // ------------------------------------------------------

    const fyResult =
      await pool
        .request()
        .input(
          "FYCode",
          sql.Int,
          cleanFYCode
        )
        .query(`
          SELECT TOP 1
            FYCode,
            FYear,
            FYStart,
            FYEnd,
            LSDate
          FROM dbo.tbl_FYear
          WHERE FYCode = @FYCode
        `);

    if (fyResult.recordset.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Selected Financial Year does not exist",
      });
    }

    const financialYear =
      fyResult.recordset[0];

    // ------------------------------------------------------
    // JWT
    // ------------------------------------------------------

    const token = jwt.sign(
      {
        UserCode: user.UserCode,
        UserName: user.UserName,

        // IMPORTANT
        UserType:
          user.UserType || "MEMBER",

        FYCode:
          financialYear.FYCode,

        FYear:
          financialYear.FYear,
      },
      JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    // ------------------------------------------------------
    // SUCCESS
    // ------------------------------------------------------

    return res.json({
      success: true,
      message: "Login successful",

      token,

      user: {
        UserCode:
          user.UserCode,

        UserName:
          user.UserName,

        UserType:
          user.UserType || "MEMBER",

        CreatedDate:
          user.CreatedDate,

        FYCode:
          financialYear.FYCode,

        FYear:
          financialYear.FYear,

        FYStart:
          financialYear.FYStart,

        FYEnd:
          financialYear.FYEnd,

        LSDate:
          financialYear.LSDate,
      },

      financialYear: {
        FYCode:
          financialYear.FYCode,

        FYear:
          financialYear.FYear,

        FYStart:
          financialYear.FYStart,

        FYEnd:
          financialYear.FYEnd,

        LSDate:
          financialYear.LSDate,
      },
    });

  } catch (error) {
    console.error(
      "LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
});

// ============================================================
// GET CURRENT USER
// GET /api/auth/me
// ============================================================

router.get("/me", async (req, res) => {
  try {
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authorization token required",
      });
    }

    const token =
      authHeader.substring(7);

    const decoded =
      jwt.verify(
        token,
        JWT_SECRET
      );

    const pool =
      await getPool();

    const result =
      await pool
        .request()
        .input(
          "UserCode",
          sql.Int,
          decoded.UserCode
        )
        .query(`
          SELECT TOP 1
            UserCode,
            UserName,
            Password,
            UserType,
            CreatedDate
          FROM dbo.tbl_User
          WHERE UserCode = @UserCode
        `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    const user =
      result.recordset[0];

    // ------------------------------------------------------
    // FINANCIAL YEAR FROM TOKEN
    // ------------------------------------------------------

    let financialYear = null;

    if (
      decoded.FYCode !== undefined &&
      decoded.FYCode !== null
    ) {
      const fyResult =
        await pool
          .request()
          .input(
            "FYCode",
            sql.Int,
            Number(decoded.FYCode)
          )
          .query(`
            SELECT TOP 1
              FYCode,
              FYear,
              FYStart,
              FYEnd,
              LSDate
            FROM dbo.tbl_FYear
            WHERE FYCode = @FYCode
          `);

      if (
        fyResult.recordset.length > 0
      ) {
        financialYear =
          fyResult.recordset[0];
      }
    }

    return res.json({
      success: true,

      user: {
        UserCode:
          user.UserCode,

        UserName:
          user.UserName,

        UserType:
          user.UserType || "MEMBER",

        CreatedDate:
          user.CreatedDate,

        FYCode:
          financialYear?.FYCode ??
          decoded.FYCode ??
          null,

        FYear:
          financialYear?.FYear ??
          decoded.FYear ??
          null,

        FYStart:
          financialYear?.FYStart ??
          null,

        FYEnd:
          financialYear?.FYEnd ??
          null,

        LSDate:
          financialYear?.LSDate ??
          null,
      },

      financialYear,
    });

  } catch (error) {
    console.error(
      "ME ERROR:",
      error
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired token",
    });
  }
});

// ============================================================
// EXPORT
// ============================================================

module.exports = router;