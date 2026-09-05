// const express = require("express");
// const { getPool, sql } = require("../config/db");

// const router = express.Router();

// // =====================================================
// // GET ALL AREAS
// // GET /api/areas
// // =====================================================

// router.get("/", async (req, res) => {
//   try {
//     const pool = await getPool();

//     const result = await pool.request().query(`
//       SELECT
//         AreaCode,
//         AreaName,
//         C_Date,
//         C_User,
//         C_Node,
//         E_Date,
//         E_User,
//         E_Node
//       FROM dbo.tbl_Area
//       ORDER BY AreaName
//     `);

//     return res.json({
//       success: true,
//       data: result.recordset,
//     });
//   } catch (error) {
//     console.error("GET AREAS ERROR:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to load areas",
//       error: error.message,
//     });
//   }
// });

// // =====================================================
// // GET ONE AREA
// // GET /api/areas/:id
// // =====================================================

// router.get("/:id", async (req, res) => {
//   try {
//     const areaCode = Number(req.params.id);

//     if (!Number.isInteger(areaCode)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid area code",
//       });
//     }

//     const pool = await getPool();

//     const result = await pool
//       .request()
//       .input("AreaCode", sql.Int, areaCode)
//       .query(`
//         SELECT
//           AreaCode,
//           AreaName,
//           C_Date,
//           C_User,
//           C_Node,
//           E_Date,
//           E_User,
//           E_Node
//         FROM dbo.tbl_Area
//         WHERE AreaCode = @AreaCode
//       `);

//     if (result.recordset.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Area not found",
//       });
//     }

//     return res.json({
//       success: true,
//       data: result.recordset[0],
//     });
//   } catch (error) {
//     console.error("GET AREA ERROR:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to load area",
//       error: error.message,
//     });
//   }
// });

// // =====================================================
// // CREATE AREA
// // POST /api/areas
// // =====================================================

// router.post("/", async (req, res) => {
//   try {
//     const { AreaCode, AreaName } = req.body;

//     const cleanName = String(AreaName || "").trim();

//     if (!cleanName) {
//       return res.status(400).json({
//         success: false,
//         message: "Area name is required",
//       });
//     }

//     if (cleanName.length > 50) {
//       return res.status(400).json({
//         success: false,
//         message: "Area name cannot exceed 50 characters",
//       });
//     }

//     const pool = await getPool();

//     // =================================================
//     // CHECK DUPLICATE AREA NAME
//     // =================================================

//     const duplicateName = await pool
//       .request()
//       .input(
//         "AreaName",
//         sql.VarChar(50),
//         cleanName
//       )
//       .query(`
//         SELECT TOP 1
//           AreaCode
//         FROM dbo.tbl_Area
//         WHERE AreaName = @AreaName
//       `);

//     if (duplicateName.recordset.length > 0) {
//       return res.status(409).json({
//         success: false,
//         message: "Area already exists",
//       });
//     }

//     // =================================================
//     // AREA CODE
//     // =================================================

//     let newAreaCode;

//     if (
//       AreaCode !== undefined &&
//       AreaCode !== null &&
//       String(AreaCode).trim() !== ""
//     ) {
//       newAreaCode = Number(AreaCode);

//       if (!Number.isInteger(newAreaCode)) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid area code",
//         });
//       }

//       const duplicateCode = await pool
//         .request()
//         .input(
//           "AreaCode",
//           sql.Int,
//           newAreaCode
//         )
//         .query(`
//           SELECT TOP 1
//             AreaCode
//           FROM dbo.tbl_Area
//           WHERE AreaCode = @AreaCode
//         `);

//       if (duplicateCode.recordset.length > 0) {
//         return res.status(409).json({
//           success: false,
//           message: "Area code already exists",
//         });
//       }
//     } else {
//       // =================================================
//       // AUTO GENERATE NEXT AREA CODE
//       // =================================================

//       const nextCodeResult =
//         await pool.request().query(`
//           SELECT
//             ISNULL(MAX(AreaCode), 0) + 1
//               AS NextAreaCode
//           FROM dbo.tbl_Area
//         `);

//       newAreaCode =
//         nextCodeResult.recordset[0].NextAreaCode;
//     }

//     // =================================================
//     // CREATE
//     // =================================================

//     const result = await pool
//       .request()
//       .input(
//         "AreaCode",
//         sql.Int,
//         newAreaCode
//       )
//       .input(
//         "AreaName",
//         sql.VarChar(50),
//         cleanName
//       )
//       .input(
//         "C_Date",
//         sql.DateTime,
//         new Date()
//       )
//       .input(
//         "C_User",
//         sql.Int,
//         1
//       )
//       .input(
//         "C_Node",
//         sql.Int,
//         1
//       )
//       .query(`
//         INSERT INTO dbo.tbl_Area
//         (
//           AreaCode,
//           AreaName,
//           C_Date,
//           C_User,
//           C_Node
//         )
//         OUTPUT
//           INSERTED.AreaCode,
//           INSERTED.AreaName,
//           INSERTED.C_Date,
//           INSERTED.C_User,
//           INSERTED.C_Node,
//           INSERTED.E_Date,
//           INSERTED.E_User,
//           INSERTED.E_Node
//         VALUES
//         (
//           @AreaCode,
//           @AreaName,
//           @C_Date,
//           @C_User,
//           @C_Node
//         )
//       `);

//     return res.status(201).json({
//       success: true,
//       message: "Area created successfully",
//       data: result.recordset[0],
//     });
//   } catch (error) {
//     console.error("CREATE AREA ERROR:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to create area",
//       error: error.message,
//     });
//   }
// });

// // =====================================================
// // UPDATE AREA
// // PUT /api/areas/:id
// // =====================================================

// router.put("/:id", async (req, res) => {
//   try {
//     const areaCode = Number(req.params.id);

//     const { AreaName } = req.body;

//     if (!Number.isInteger(areaCode)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid area code",
//       });
//     }

//     const cleanName = String(AreaName || "").trim();

//     if (!cleanName) {
//       return res.status(400).json({
//         success: false,
//         message: "Area name is required",
//       });
//     }

//     if (cleanName.length > 50) {
//       return res.status(400).json({
//         success: false,
//         message: "Area name cannot exceed 50 characters",
//       });
//     }

//     const pool = await getPool();

//     // =================================================
//     // CHECK DUPLICATE NAME
//     // =================================================

//     const duplicate = await pool
//       .request()
//       .input(
//         "AreaCode",
//         sql.Int,
//         areaCode
//       )
//       .input(
//         "AreaName",
//         sql.VarChar(50),
//         cleanName
//       )
//       .query(`
//         SELECT TOP 1
//           AreaCode
//         FROM dbo.tbl_Area
//         WHERE AreaName = @AreaName
//           AND AreaCode <> @AreaCode
//       `);

//     if (duplicate.recordset.length > 0) {
//       return res.status(409).json({
//         success: false,
//         message: "Area name already exists",
//       });
//     }

//     // =================================================
//     // UPDATE
//     // =================================================

//     const result = await pool
//       .request()
//       .input(
//         "AreaCode",
//         sql.Int,
//         areaCode
//       )
//       .input(
//         "AreaName",
//         sql.VarChar(50),
//         cleanName
//       )
//       .input(
//         "E_Date",
//         sql.DateTime,
//         new Date()
//       )
//       .input(
//         "E_User",
//         sql.Int,
//         1
//       )
//       .input(
//         "E_Node",
//         sql.Int,
//         1
//       )
//       .query(`
//         UPDATE dbo.tbl_Area
//         SET
//           AreaName = @AreaName,
//           E_Date = @E_Date,
//           E_User = @E_User,
//           E_Node = @E_Node
//         OUTPUT
//           INSERTED.AreaCode,
//           INSERTED.AreaName,
//           INSERTED.C_Date,
//           INSERTED.C_User,
//           INSERTED.C_Node,
//           INSERTED.E_Date,
//           INSERTED.E_User,
//           INSERTED.E_Node
//         WHERE AreaCode = @AreaCode
//       `);

//     if (result.recordset.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Area not found",
//       });
//     }

//     return res.json({
//       success: true,
//       message: "Area updated successfully",
//       data: result.recordset[0],
//     });
//   } catch (error) {
//     console.error("UPDATE AREA ERROR:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to update area",
//       error: error.message,
//     });
//   }
// });

// // =====================================================
// // DELETE AREA
// // DELETE /api/areas/:id
// // =====================================================

// router.delete("/:id", async (req, res) => {
//   try {
//     const areaCode = Number(req.params.id);

//     if (!Number.isInteger(areaCode)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid area code",
//       });
//     }

//     const pool = await getPool();

//     // =================================================
//     // CHECK COMPANY REFERENCE
//     // tbl_Company uses AreaCode
//     // =================================================

//     const reference = await pool
//       .request()
//       .input(
//         "AreaCode",
//         sql.Int,
//         areaCode
//       )
//       .query(`
//         SELECT COUNT(*) AS Total
//         FROM dbo.tbl_Company
//         WHERE AreaCode = @AreaCode
//       `);

//     if (
//       reference.recordset[0].Total > 0
//     ) {
//       return res.status(409).json({
//         success: false,
//         message:
//           "Area cannot be deleted because companies are using it",
//       });
//     }

//     // =================================================
//     // DELETE
//     // =================================================

//     const result = await pool
//       .request()
//       .input(
//         "AreaCode",
//         sql.Int,
//         areaCode
//       )
//       .query(`
//         DELETE FROM dbo.tbl_Area
//         WHERE AreaCode = @AreaCode
//       `);

//     if (result.rowsAffected[0] === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Area not found",
//       });
//     }

//     return res.json({
//       success: true,
//       message: "Area deleted successfully",
//     });
//   } catch (error) {
//     console.error("DELETE AREA ERROR:", error);

//     // Foreign key constraint
//     if (error.number === 547) {
//       return res.status(409).json({
//         success: false,
//         message:
//           "Area cannot be deleted because it is being used by another record",
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Failed to delete area",
//       error: error.message,
//     });
//   }
// });

// module.exports = router;

const express = require("express");
const { getPool, sql } = require("../config/db");

const router = express.Router();

// =====================================================
// AUTHENTICATION
// =====================================================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const jwt = require("jsonwebtoken");

    const JWT_SECRET =
      process.env.JWT_SECRET ||
      "ipltemple_secret_2026";

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    console.error("AREA AUTH ERROR:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// =====================================================
// GET ALL AREAS
// GET /api/areas
// =====================================================

router.get("/", authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT
        AreaCode,
        AreaName,
        C_Date,
        C_User,
        C_Node,
        E_Date,
        E_User,
        E_Node
      FROM dbo.tbl_Area
      ORDER BY AreaName
    `);

    return res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error("GET AREAS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load areas",
      error: error.message,
    });
  }
});

// =====================================================
// GET ONE AREA
// GET /api/areas/:id
// =====================================================

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const areaCode = Number(req.params.id);

    if (!Number.isInteger(areaCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid area code",
      });
    }

    const pool = await getPool();

    const result = await pool
      .request()
      .input("AreaCode", sql.Int, areaCode)
      .query(`
        SELECT
          AreaCode,
          AreaName,
          C_Date,
          C_User,
          C_Node,
          E_Date,
          E_User,
          E_Node
        FROM dbo.tbl_Area
        WHERE AreaCode = @AreaCode
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Area not found",
      });
    }

    return res.json({
      success: true,
      data: result.recordset[0],
    });
  } catch (error) {
    console.error("GET AREA ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load area",
      error: error.message,
    });
  }
});

// =====================================================
// CREATE AREA
// POST /api/areas
// =====================================================

router.post("/", authenticateToken, async (req, res) => {
  try {
    const { AreaCode, AreaName } = req.body;

    const cleanName = String(AreaName || "").trim();

    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message: "Area name is required",
      });
    }

    if (cleanName.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Area name cannot exceed 50 characters",
      });
    }

    const pool = await getPool();

    // =================================================
    // CHECK DUPLICATE AREA NAME
    // =================================================

    const duplicateName = await pool
      .request()
      .input("AreaName", sql.VarChar(50), cleanName)
      .query(`
        SELECT TOP 1
          AreaCode
        FROM dbo.tbl_Area
        WHERE AreaName = @AreaName
      `);

    if (duplicateName.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Area already exists",
      });
    }

    // =================================================
    // AREA CODE
    // =================================================

    let newAreaCode;

    if (
      AreaCode !== undefined &&
      AreaCode !== null &&
      String(AreaCode).trim() !== ""
    ) {
      newAreaCode = Number(AreaCode);

      if (!Number.isInteger(newAreaCode)) {
        return res.status(400).json({
          success: false,
          message: "Invalid area code",
        });
      }

      const duplicateCode = await pool
        .request()
        .input("AreaCode", sql.Int, newAreaCode)
        .query(`
          SELECT TOP 1
            AreaCode
          FROM dbo.tbl_Area
          WHERE AreaCode = @AreaCode
        `);

      if (duplicateCode.recordset.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Area code already exists",
        });
      }
    } else {
      // =================================================
      // AUTO GENERATE NEXT AREA CODE
      // =================================================

      const nextCodeResult = await pool.request().query(`
        SELECT
          ISNULL(MAX(AreaCode), 0) + 1 AS NextAreaCode
        FROM dbo.tbl_Area
      `);

      newAreaCode =
        nextCodeResult.recordset[0].NextAreaCode;
    }

    // =================================================
    // LOGGED-IN USER
    // =================================================

    const userCode = Number(req.user?.UserCode);

    if (!Number.isInteger(userCode)) {
      return res.status(401).json({
        success: false,
        message: "Invalid user information in token",
      });
    }

    // =================================================
    // CREATE
    // =================================================

    const result = await pool
      .request()
      .input("AreaCode", sql.Int, newAreaCode)
      .input("AreaName", sql.VarChar(50), cleanName)
      .input("C_Date", sql.DateTime, new Date())
      .input("C_User", sql.Int, userCode)
      .input("C_Node", sql.Int, 1)
      .query(`
        INSERT INTO dbo.tbl_Area
        (
          AreaCode,
          AreaName,
          C_Date,
          C_User,
          C_Node
        )
        OUTPUT
          INSERTED.AreaCode,
          INSERTED.AreaName,
          INSERTED.C_Date,
          INSERTED.C_User,
          INSERTED.C_Node,
          INSERTED.E_Date,
          INSERTED.E_User,
          INSERTED.E_Node
        VALUES
        (
          @AreaCode,
          @AreaName,
          @C_Date,
          @C_User,
          @C_Node
        )
      `);

    return res.status(201).json({
      success: true,
      message: "Area created successfully",
      data: result.recordset[0],
    });
  } catch (error) {
    console.error("CREATE AREA ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create area",
      error: error.message,
    });
  }
});

// =====================================================
// UPDATE AREA
// PUT /api/areas/:id
// =====================================================

router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const areaCode = Number(req.params.id);

    const { AreaName } = req.body;

    if (!Number.isInteger(areaCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid area code",
      });
    }

    const cleanName = String(AreaName || "").trim();

    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message: "Area name is required",
      });
    }

    if (cleanName.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Area name cannot exceed 50 characters",
      });
    }

    const pool = await getPool();

    // =================================================
    // CHECK DUPLICATE NAME
    // =================================================

    const duplicate = await pool
      .request()
      .input("AreaCode", sql.Int, areaCode)
      .input("AreaName", sql.VarChar(50), cleanName)
      .query(`
        SELECT TOP 1
          AreaCode
        FROM dbo.tbl_Area
        WHERE AreaName = @AreaName
          AND AreaCode <> @AreaCode
      `);

    if (duplicate.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Area name already exists",
      });
    }

    // =================================================
    // LOGGED-IN USER
    // =================================================

    const userCode = Number(req.user?.UserCode);

    if (!Number.isInteger(userCode)) {
      return res.status(401).json({
        success: false,
        message: "Invalid user information in token",
      });
    }

    // =================================================
    // UPDATE
    // =================================================

    const result = await pool
      .request()
      .input("AreaCode", sql.Int, areaCode)
      .input("AreaName", sql.VarChar(50), cleanName)
      .input("E_Date", sql.DateTime, new Date())
      .input("E_User", sql.Int, userCode)
      .input("E_Node", sql.Int, 1)
      .query(`
        UPDATE dbo.tbl_Area
        SET
          AreaName = @AreaName,
          E_Date = @E_Date,
          E_User = @E_User,
          E_Node = @E_Node
        OUTPUT
          INSERTED.AreaCode,
          INSERTED.AreaName,
          INSERTED.C_Date,
          INSERTED.C_User,
          INSERTED.C_Node,
          INSERTED.E_Date,
          INSERTED.E_User,
          INSERTED.E_Node
        WHERE AreaCode = @AreaCode
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Area not found",
      });
    }

    return res.json({
      success: true,
      message: "Area updated successfully",
      data: result.recordset[0],
    });
  } catch (error) {
    console.error("UPDATE AREA ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update area",
      error: error.message,
    });
  }
});

// =====================================================
// DELETE AREA
// DELETE /api/areas/:id
// =====================================================

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const areaCode = Number(req.params.id);

    if (!Number.isInteger(areaCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid area code",
      });
    }

    const pool = await getPool();

    // =================================================
    // CHECK COMPANY REFERENCE
    // tbl_Company uses AreaCode
    // =================================================

    const reference = await pool
      .request()
      .input("AreaCode", sql.Int, areaCode)
      .query(`
        SELECT COUNT(*) AS Total
        FROM dbo.tbl_Company
        WHERE AreaCode = @AreaCode
      `);

    if (reference.recordset[0].Total > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Area cannot be deleted because companies are using it",
      });
    }

    // =================================================
    // DELETE
    // =================================================

    const result = await pool
      .request()
      .input("AreaCode", sql.Int, areaCode)
      .query(`
        DELETE FROM dbo.tbl_Area
        WHERE AreaCode = @AreaCode
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message: "Area not found",
      });
    }

    return res.json({
      success: true,
      message: "Area deleted successfully",
    });
  } catch (error) {
    console.error("DELETE AREA ERROR:", error);

    // Foreign key constraint
    if (error.number === 547) {
      return res.status(409).json({
        success: false,
        message:
          "Area cannot be deleted because it is being used by another record",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete area",
      error: error.message,
    });
  }
});

module.exports = router;