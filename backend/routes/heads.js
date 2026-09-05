// const express = require("express");
// const router = express.Router();

// const { getPool, sql } = require("../config/db");

// // =====================================================
// // GET ALL HEADS
// // =====================================================

// router.get("/", async (req, res) => {
//   try {
//     const pool = await getPool();

//     const result = await pool.request().query(`
//       SELECT
//         HeadCode,
//         HeadName,
//         Status,
//         C_Date,
//         C_User,
//         C_Node,
//         E_Date,
//         E_User,
//         E_Node
//       FROM tbl_Head
//       ORDER BY HeadCode DESC
//     `);

//     res.json(result.recordset);
//   } catch (error) {
//     console.error("GET HEADS ERROR:", error);

//     res.status(500).json({
//       success: false,
//       message: "Unable to load heads",
//       error: error.message,
//     });
//   }
// });

// // =====================================================
// // GET HEAD BY CODE
// // =====================================================

// router.get("/:id", async (req, res) => {
//   try {
//     const headCode = Number(req.params.id);

//     if (!Number.isInteger(headCode)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid HeadCode",
//       });
//     }

//     const pool = await getPool();

//     const result = await pool
//       .request()
//       .input("HeadCode", sql.Int, headCode)
//       .query(`
//         SELECT
//           HeadCode,
//           HeadName,
//           Status,
//           C_Date,
//           C_User,
//           C_Node,
//           E_Date,
//           E_User,
//           E_Node
//         FROM tbl_Head
//         WHERE HeadCode = @HeadCode
//       `);

//     if (result.recordset.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Head not found",
//       });
//     }

//     res.json(result.recordset[0]);
//   } catch (error) {
//     console.error("GET HEAD ERROR:", error);

//     res.status(500).json({
//       success: false,
//       message: "Unable to load head",
//       error: error.message,
//     });
//   }
// });

// // =====================================================
// // ADD HEAD
// // =====================================================

// router.post("/", async (req, res) => {
//   try {
//     const {
//       HeadName,
//       Status = true,
//       User = 1,
//       Node = 1,
//     } = req.body;

//     if (!HeadName || !String(HeadName).trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Head name is required",
//       });
//     }

//     const pool = await getPool();

//     const codeResult = await pool.request().query(`
//       SELECT ISNULL(MAX(HeadCode), 0) + 1 AS HeadCode
//       FROM tbl_Head
//     `);

//     const headCode =
//       codeResult.recordset[0].HeadCode;

//     await pool
//       .request()
//       .input(
//         "HeadCode",
//         sql.Int,
//         headCode
//       )
//       .input(
//         "HeadName",
//         sql.VarChar(100),
//         String(HeadName).trim()
//       )
//       .input(
//         "Status",
//         sql.Bit,
//         Status
//       )
//       .input(
//         "C_User",
//         sql.Int,
//         Number(User)
//       )
//       .input(
//         "C_Node",
//         sql.Int,
//         Number(Node)
//       )
//       .query(`
//         INSERT INTO tbl_Head
//         (
//           HeadCode,
//           HeadName,
//           Status,
//           C_Date,
//           C_User,
//           C_Node
//         )
//         VALUES
//         (
//           @HeadCode,
//           @HeadName,
//           @Status,
//           GETDATE(),
//           @C_User,
//           @C_Node
//         )
//       `);

//     res.status(201).json({
//       success: true,
//       message: "Head added successfully",
//       HeadCode: headCode,
//     });
//   } catch (error) {
//     console.error("ADD HEAD ERROR:", error);

//     res.status(500).json({
//       success: false,
//       message: "Unable to add head",
//       error: error.message,
//     });
//   }
// });

// // =====================================================
// // UPDATE HEAD
// // =====================================================

// router.put("/:id", async (req, res) => {
//   try {
//     const headCode = Number(req.params.id);

//     const {
//       HeadName,
//       Status = true,
//       User = 1,
//       Node = 1,
//     } = req.body;

//     if (!Number.isInteger(headCode)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid HeadCode",
//       });
//     }

//     if (!HeadName || !String(HeadName).trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Head name is required",
//       });
//     }

//     const pool = await getPool();

//     const result = await pool
//       .request()
//       .input(
//         "HeadCode",
//         sql.Int,
//         headCode
//       )
//       .input(
//         "HeadName",
//         sql.VarChar(100),
//         String(HeadName).trim()
//       )
//       .input(
//         "Status",
//         sql.Bit,
//         Status
//       )
//       .input(
//         "E_User",
//         sql.Int,
//         Number(User)
//       )
//       .input(
//         "E_Node",
//         sql.Int,
//         Number(Node)
//       )
//       .query(`
//         UPDATE tbl_Head
//         SET
//           HeadName = @HeadName,
//           Status = @Status,
//           E_Date = GETDATE(),
//           E_User = @E_User,
//           E_Node = @E_Node
//         WHERE HeadCode = @HeadCode
//       `);

//     if (result.rowsAffected[0] === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Head not found",
//       });
//     }

//     res.json({
//       success: true,
//       message: "Head updated successfully",
//     });
//   } catch (error) {
//     console.error("UPDATE HEAD ERROR:", error);

//     res.status(500).json({
//       success: false,
//       message: "Unable to update head",
//       error: error.message,
//     });
//   }
// });

// // =====================================================
// // DELETE HEAD
// // =====================================================

// router.delete("/:id", async (req, res) => {
//   try {
//     const headCode = Number(req.params.id);

//     if (!Number.isInteger(headCode)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid HeadCode",
//       });
//     }

//     const pool = await getPool();

//     const result = await pool
//       .request()
//       .input(
//         "HeadCode",
//         sql.Int,
//         headCode
//       )
//       .query(`
//         DELETE FROM tbl_Head
//         WHERE HeadCode = @HeadCode
//       `);

//     if (result.rowsAffected[0] === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Head not found",
//       });
//     }

//     res.json({
//       success: true,
//       message: "Head deleted successfully",
//     });
//   } catch (error) {
//     console.error("DELETE HEAD ERROR:", error);

//     // Foreign-key protection
//     if (error.number === 547) {
//       return res.status(409).json({
//         success: false,
//         message:
//           "This head is already used in payment or receipt records and cannot be deleted.",
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Unable to delete head",
//       error: error.message,
//     });
//   }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();

const { getPool, sql } = require("../config/db");

// =====================================================
// JWT AUTHENTICATION
// =====================================================

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "ipltemple_secret_2026";

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token required",
    });
  }

  try {
    const jwt = require("jsonwebtoken");

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    console.error("HEAD AUTH ERROR:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

// =====================================================
// GET ALL HEADS
// =====================================================

router.get("/", authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT
        HeadCode,
        HeadName,
        Status,
        C_Date,
        C_User,
        C_Node,
        E_Date,
        E_User,
        E_Node
      FROM dbo.tbl_Head
      ORDER BY HeadCode DESC
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error("GET HEADS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load heads",
      error: error.message,
    });
  }
});

// =====================================================
// GET HEAD BY CODE
// =====================================================

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const headCode = Number(req.params.id);

    if (!Number.isInteger(headCode) || headCode <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid HeadCode",
      });
    }

    const pool = await getPool();

    const result = await pool
      .request()
      .input("HeadCode", sql.Int, headCode)
      .query(`
        SELECT
          HeadCode,
          HeadName,
          Status,
          C_Date,
          C_User,
          C_Node,
          E_Date,
          E_User,
          E_Node
        FROM dbo.tbl_Head
        WHERE HeadCode = @HeadCode
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Head not found",
      });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error("GET HEAD ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load head",
      error: error.message,
    });
  }
});

// =====================================================
// ADD HEAD
// =====================================================

router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      HeadName,
      Status = true,
      Node = 1,
    } = req.body;

    if (!HeadName || !String(HeadName).trim()) {
      return res.status(400).json({
        success: false,
        message: "Head name is required",
      });
    }

    const headName = String(HeadName).trim();

    if (headName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Head name cannot exceed 100 characters",
      });
    }

    const pool = await getPool();

    // -------------------------------------------------
    // CHECK DUPLICATE HEAD NAME
    // -------------------------------------------------

    const duplicate = await pool
      .request()
      .input("HeadName", sql.VarChar(100), headName)
      .query(`
        SELECT TOP 1 HeadCode
        FROM dbo.tbl_Head
        WHERE LOWER(LTRIM(RTRIM(HeadName))) =
              LOWER(LTRIM(RTRIM(@HeadName)))
      `);

    if (duplicate.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A head with this name already exists",
      });
    }

    // -------------------------------------------------
    // GENERATE NEXT HEAD CODE
    // -------------------------------------------------

    const codeResult = await pool.request().query(`
      SELECT ISNULL(MAX(HeadCode), 0) + 1 AS HeadCode
      FROM dbo.tbl_Head
    `);

    const headCode = Number(
      codeResult.recordset[0].HeadCode
    );

    // -------------------------------------------------
    // CURRENT LOGGED-IN USER
    // -------------------------------------------------

    const userCode = Number(req.user?.UserCode);

    if (!Number.isInteger(userCode)) {
      return res.status(401).json({
        success: false,
        message: "Invalid user information in token",
      });
    }

    const nodeCode = Number(Node);

    // -------------------------------------------------
    // INSERT HEAD
    // -------------------------------------------------

    await pool
      .request()
      .input("HeadCode", sql.Int, headCode)
      .input("HeadName", sql.VarChar(100), headName)
      .input("Status", sql.Bit, Boolean(Status))
      .input("C_User", sql.Int, userCode)
      .input("C_Node", sql.Int, nodeCode)
      .query(`
        INSERT INTO dbo.tbl_Head
        (
          HeadCode,
          HeadName,
          Status,
          C_Date,
          C_User,
          C_Node
        )
        VALUES
        (
          @HeadCode,
          @HeadName,
          @Status,
          GETDATE(),
          @C_User,
          @C_Node
        )
      `);

    res.status(201).json({
      success: true,
      message: "Head added successfully",
      HeadCode: headCode,
    });
  } catch (error) {
    console.error("ADD HEAD ERROR:", error);

    // SQL Server duplicate/constraint protection
    if (error.number === 2627 || error.number === 2601) {
      return res.status(409).json({
        success: false,
        message: "A head with this code or name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to add head",
      error: error.message,
    });
  }
});

// =====================================================
// UPDATE HEAD
// =====================================================

router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const headCode = Number(req.params.id);

    const {
      HeadName,
      Status = true,
      Node = 1,
    } = req.body;

    if (!Number.isInteger(headCode) || headCode <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid HeadCode",
      });
    }

    if (!HeadName || !String(HeadName).trim()) {
      return res.status(400).json({
        success: false,
        message: "Head name is required",
      });
    }

    const headName = String(HeadName).trim();

    if (headName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Head name cannot exceed 100 characters",
      });
    }

    const userCode = Number(req.user?.UserCode);

    if (!Number.isInteger(userCode)) {
      return res.status(401).json({
        success: false,
        message: "Invalid user information in token",
      });
    }

    const nodeCode = Number(Node);

    const pool = await getPool();

    // -------------------------------------------------
    // CHECK HEAD EXISTS
    // -------------------------------------------------

    const existing = await pool
      .request()
      .input("HeadCode", sql.Int, headCode)
      .query(`
        SELECT HeadCode
        FROM dbo.tbl_Head
        WHERE HeadCode = @HeadCode
      `);

    if (existing.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Head not found",
      });
    }

    // -------------------------------------------------
    // CHECK DUPLICATE HEAD NAME
    // -------------------------------------------------

    const duplicate = await pool
      .request()
      .input("HeadCode", sql.Int, headCode)
      .input("HeadName", sql.VarChar(100), headName)
      .query(`
        SELECT TOP 1 HeadCode
        FROM dbo.tbl_Head
        WHERE LOWER(LTRIM(RTRIM(HeadName))) =
              LOWER(LTRIM(RTRIM(@HeadName)))
          AND HeadCode <> @HeadCode
      `);

    if (duplicate.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A head with this name already exists",
      });
    }

    // -------------------------------------------------
    // UPDATE HEAD
    // -------------------------------------------------

    const result = await pool
      .request()
      .input("HeadCode", sql.Int, headCode)
      .input("HeadName", sql.VarChar(100), headName)
      .input("Status", sql.Bit, Boolean(Status))
      .input("E_User", sql.Int, userCode)
      .input("E_Node", sql.Int, nodeCode)
      .query(`
        UPDATE dbo.tbl_Head
        SET
          HeadName = @HeadName,
          Status = @Status,
          E_Date = GETDATE(),
          E_User = @E_User,
          E_Node = @E_Node
        WHERE HeadCode = @HeadCode
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message: "Head not found",
      });
    }

    res.json({
      success: true,
      message: "Head updated successfully",
    });
  } catch (error) {
    console.error("UPDATE HEAD ERROR:", error);

    if (error.number === 2627 || error.number === 2601) {
      return res.status(409).json({
        success: false,
        message: "A head with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to update head",
      error: error.message,
    });
  }
});

// =====================================================
// DELETE HEAD
// =====================================================

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const headCode = Number(req.params.id);

    if (!Number.isInteger(headCode) || headCode <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid HeadCode",
      });
    }

    const pool = await getPool();

    // -------------------------------------------------
    // DELETE HEAD
    // -------------------------------------------------

    const result = await pool
      .request()
      .input("HeadCode", sql.Int, headCode)
      .query(`
        DELETE FROM dbo.tbl_Head
        WHERE HeadCode = @HeadCode
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message: "Head not found",
      });
    }

    res.json({
      success: true,
      message: "Head deleted successfully",
    });
  } catch (error) {
    console.error("DELETE HEAD ERROR:", error);

    // -------------------------------------------------
    // FOREIGN KEY PROTECTION
    // -------------------------------------------------

    if (error.number === 547) {
      return res.status(409).json({
        success: false,
        message:
          "This head is already used in payment, receipt, or opening balance records and cannot be deleted.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to delete head",
      error: error.message,
    });
  }
});

// =====================================================
// EXPORT
// =====================================================

module.exports = router;