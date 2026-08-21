const express = require("express");
const jwt = require("jsonwebtoken");

const { getPool, sql } = require("../config/db");

const router = express.Router();

const JWT_SECRET =
  process.env.JWT_SECRET || "ipltemple_secret_2026";

// =====================================================
// GET /api/auth
// =====================================================

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Authentication API is working",
  });
});

// =====================================================
// POST /api/auth/create-admin
// =====================================================

router.post("/create-admin", async (req, res) => {
  try {
    const { username, password } = req.body;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const cleanUsername = String(username).trim();
    const cleanPassword = String(password);

    if (cleanUsername.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Username must contain at least 3 characters",
      });
    }

    if (cleanUsername.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Username cannot exceed 50 characters",
      });
    }

    if (cleanPassword.length < 4) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 4 characters",
      });
    }

    if (cleanPassword.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Password cannot exceed 50 characters",
      });
    }

    // -------------------------------------------------
    // DATABASE
    // -------------------------------------------------

    const pool = await getPool();

    // -------------------------------------------------
    // CHECK EXISTING USER
    // -------------------------------------------------

    const existingUser = await pool
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

    // -------------------------------------------------
    // GET NEXT USER CODE
    // -------------------------------------------------

    const nextCodeResult = await pool.request().query(`
      SELECT
        ISNULL(MAX(UserCode), 0) + 1 AS NextUserCode
      FROM dbo.tbl_User
    `);

    const userCode =
      nextCodeResult.recordset[0].NextUserCode;

    // -------------------------------------------------
    // INSERT ADMIN
    // -------------------------------------------------

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
          CreatedDate
        )
        VALUES
        (
          @UserCode,
          @UserName,
          @Password,
          @CreatedDate
        )
      `);

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Admin user created successfully",
      user: {
        UserCode: userCode,
        UserName: cleanUsername,
      },
    });
  } catch (error) {
    console.error("CREATE ADMIN ERROR:");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to create admin user",
      error: error.message,
    });
  }
});

// =====================================================
// POST /api/auth/login
// =====================================================

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("=================================");
    console.log("LOGIN REQUEST");
    console.log("Username:", username);
    console.log("=================================");

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const cleanUsername = String(username).trim();
    const cleanPassword = String(password);

    // -------------------------------------------------
    // DATABASE
    // -------------------------------------------------

    const pool = await getPool();

    // -------------------------------------------------
    // FIND USER
    // -------------------------------------------------

    const result = await pool
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
          CreatedDate
        FROM dbo.tbl_User
        WHERE UserName = @UserName
      `);

    // -------------------------------------------------
    // USER NOT FOUND
    // -------------------------------------------------

    if (result.recordset.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const user = result.recordset[0];

    // -------------------------------------------------
    // PASSWORD CHECK
    // -------------------------------------------------

    if (
      String(user.Password) !==
      cleanPassword
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // -------------------------------------------------
    // CREATE JWT
    // -------------------------------------------------

    const token = jwt.sign(
      {
        UserCode: user.UserCode,
        UserName: user.UserName,
      },
      JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    console.log("LOGIN SUCCESS");
    console.log("UserCode:", user.UserCode);
    console.log("UserName:", user.UserName);
    console.log("=================================");

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        UserCode: user.UserCode,
        UserName: user.UserName,
        CreatedDate: user.CreatedDate,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
});

// =====================================================
// GET /api/auth/me
// =====================================================

router.get("/me", async (req, res) => {
  try {
    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization token required",
      });
    }

    const token =
      authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : authHeader;

    const decoded = jwt.verify(
      token,
      JWT_SECRET
    );

    // -------------------------------------------------
    // DATABASE
    // -------------------------------------------------

    const pool = await getPool();

    const result = await pool
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
          CreatedDate
        FROM dbo.tbl_User
        WHERE UserCode = @UserCode
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = result.recordset[0];

    return res.json({
      success: true,
      user: {
        UserCode: user.UserCode,
        UserName: user.UserName,
        CreatedDate: user.CreatedDate,
      },
    });
  } catch (error) {
    console.error("ME ERROR:");
    console.error(error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
});

// =====================================================
// EXPORT
// =====================================================

module.exports = router;