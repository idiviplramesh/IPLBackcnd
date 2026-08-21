const express = require("express");
const jwt = require("jsonwebtoken");

const { getPool, sql } = require("../config/db");

const router = express.Router();

// =====================================================
// CREATE JWT
// =====================================================

function createToken(user) {
  return jwt.sign(
    {
      UserCode: user.UserCode,
      UserName: user.UserName,
      UserType: user.UserType,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
}

// =====================================================
// AUTHENTICATE TOKEN
// =====================================================

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization token required",
      });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : authHeader;

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    console.error("TOKEN ERROR:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

// =====================================================
// ADMIN ONLY
// =====================================================

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
      message: "Only ADMIN can create users",
    });
  }

  next();
}

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

    // -------------------------------------------------
    // DATABASE
    // -------------------------------------------------

    const pool = await getPool();

    const result = await pool
      .request()
      .input(
        "UserName",
        sql.VarChar(50),
        cleanUsername
      )
      .query(`
        SELECT
          UserCode,
          UserName,
          Password,
          UserType,
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
      String(password)
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // -------------------------------------------------
    // CREATE TOKEN
    // -------------------------------------------------

    const token = createToken(user);

    // -------------------------------------------------
    // USER DATA
    // -------------------------------------------------

    const userData = {
      UserCode: user.UserCode,
      UserName: user.UserName,
      UserType: user.UserType,
      CreatedDate: user.CreatedDate,
    };

    console.log("LOGIN SUCCESS");
    console.log("UserCode:", user.UserCode);
    console.log("UserName:", user.UserName);
    console.log("UserType:", user.UserType);
    console.log("=================================");

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
});

// =====================================================
// POST /api/auth/create-user
// ADMIN ONLY
//
// UserCode is automatically generated.
// =====================================================

router.post(
  "/create-user",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        username,
        password,
        userType,
      } = req.body;

      // -------------------------------------------------
      // VALIDATION
      // -------------------------------------------------

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message:
            "Username and password are required",
        });
      }

      const cleanUsername =
        String(username).trim();

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

      if (String(password).length < 4) {
        return res.status(400).json({
          success: false,
          message:
            "Password must contain at least 4 characters",
        });
      }

      // -------------------------------------------------
      // ALLOWED USER TYPES
      // -------------------------------------------------

      if (
        !["ADMIN", "MEMBER"].includes(
          cleanUserType
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid user type. Only ADMIN or MEMBER allowed.",
        });
      }

      const pool = await getPool();

      // -------------------------------------------------
      // CHECK USERNAME
      // -------------------------------------------------

      const usernameExists =
        await pool
          .request()
          .input(
            "UserName",
            sql.VarChar(50),
            cleanUsername
          )
          .query(`
            SELECT UserCode
            FROM dbo.tbl_User
            WHERE UserName = @UserName
          `);

      if (
        usernameExists.recordset.length > 0
      ) {
        return res.status(409).json({
          success: false,
          message: "Username already exists",
        });
      }

      // -------------------------------------------------
      // GET NEXT USER CODE
      // -------------------------------------------------

      const nextCodeResult =
        await pool
          .request()
          .query(`
            SELECT
              ISNULL(MAX(UserCode), 0) + 1
              AS NextUserCode
            FROM dbo.tbl_User
          `);

      const nextUserCode =
        nextCodeResult.recordset[0]
          .NextUserCode;

      // -------------------------------------------------
      // INSERT USER
      // -------------------------------------------------

      const result =
        await pool
          .request()
          .input(
            "UserCode",
            sql.Int,
            nextUserCode
          )
          .input(
            "UserName",
            sql.VarChar(50),
            cleanUsername
          )
          .input(
            "Password",
            sql.NVarChar(50),
            String(password)
          )
          .input(
            "UserType",
            sql.VarChar(20),
            cleanUserType
          )
          .query(`
            INSERT INTO dbo.tbl_User
            (
              UserCode,
              UserName,
              Password,
              UserType
            )
            OUTPUT
              INSERTED.UserCode,
              INSERTED.UserName,
              INSERTED.UserType,
              INSERTED.CreatedDate
            VALUES
            (
              @UserCode,
              @UserName,
              @Password,
              @UserType
            )
          `);

      console.log("=================================");
      console.log("USER CREATED");
      console.log(
        "UserCode:",
        nextUserCode
      );
      console.log(
        "UserName:",
        cleanUsername
      );
      console.log(
        "UserType:",
        cleanUserType
      );
      console.log("=================================");

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        user: result.recordset[0],
      });
    } catch (error) {
      console.error(
        "CREATE USER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to create user",
        error: error.message,
      });
    }
  }
);

// =====================================================
// GET /api/auth/me
// =====================================================

router.get(
  "/me",
  authenticateToken,
  async (req, res) => {
    try {
      const pool = await getPool();

      const result = await pool
        .request()
        .input(
          "UserCode",
          sql.Int,
          req.user.UserCode
        )
        .query(`
          SELECT
            UserCode,
            UserName,
            UserType,
            CreatedDate
          FROM dbo.tbl_User
          WHERE UserCode = @UserCode
        `);

      if (
        result.recordset.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const user =
        result.recordset[0];

      return res.json({
        success: true,
        user,
      });
    } catch (error) {
      console.error(
        "GET CURRENT USER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to get current user",
        error: error.message,
      });
    }
  }
);

module.exports = router;