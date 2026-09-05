// const express = require("express");
// const router = express.Router();

// const { getPool, sql } = require("../config/db");

// // =====================================================
// // GET ALL RECEIPTS
// // =====================================================

// router.get("/", async (req, res) => {
//   try {
//     const pool = await getPool();

//     const result = await pool.request().query(`
//       SELECT
//         r.ReceiptCode,
//         r.ReceiptNo,
//         r.ReceiptDate,
//         r.HeadCode,
//         h.HeadName,
//         r.ReceivedFrom,
//         r.MNo,
//         r.Receivedby,
//         r.ReceivedAmount
//       FROM tbl_Receipt r
//       LEFT JOIN tbl_Head h
//         ON r.HeadCode = h.HeadCode
//       ORDER BY r.ReceiptCode DESC
//     `);

//     res.json(result.recordset);
//   } catch (error) {
//     console.error(
//       "GET RECEIPTS ERROR:",
//       error
//     );

//     res.status(500).json({
//       success: false,
//       message: "Unable to load receipts",
//       error: error.message,
//     });
//   }
// });

// // =====================================================
// // GET RECEIPT BY CODE
// // =====================================================

// router.get("/:id", async (req, res) => {
//   try {
//     const receiptCode =
//       Number(req.params.id);

//     if (!Number.isInteger(receiptCode)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid ReceiptCode",
//       });
//     }

//     const pool = await getPool();

//     const result =
//       await pool
//         .request()
//         .input(
//           "ReceiptCode",
//           sql.Int,
//           receiptCode
//         )
//         .query(`
//           SELECT
//             r.ReceiptCode,
//             r.ReceiptNo,
//             r.ReceiptDate,
//             r.HeadCode,
//             h.HeadName,
//             r.ReceivedFrom,
//             r.MNo,
//             r.Receivedby,
//             r.ReceivedAmount
//           FROM tbl_Receipt r
//           LEFT JOIN tbl_Head h
//             ON r.HeadCode = h.HeadCode
//           WHERE r.ReceiptCode = @ReceiptCode
//         `);

//     if (result.recordset.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Receipt not found",
//       });
//     }

//     res.json(result.recordset[0]);
//   } catch (error) {
//     console.error(
//       "GET RECEIPT ERROR:",
//       error
//     );

//     res.status(500).json({
//       success: false,
//       message: "Unable to load receipt",
//       error: error.message,
//     });
//   }
// });

// // =====================================================
// // ADD RECEIPT
// // =====================================================

// router.post("/", async (req, res) => {
//   try {
//     const {
//       ReceiptNo,
//       ReceiptDate,
//       HeadCode,
//       ReceivedFrom,
//       MNo,
//       Receivedby,
//       ReceivedAmount,
//     } = req.body;

//     if (!ReceiptDate) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Receipt date is required",
//       });
//     }

//     if (!HeadCode) {
//       return res.status(400).json({
//         success: false,
//         message: "Head is required",
//       });
//     }

//     if (!ReceivedFrom) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Received From is required",
//       });
//     }

//     if (!Receivedby) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Received By is required",
//       });
//     }

//     if (
//       ReceivedAmount === undefined ||
//       ReceivedAmount === null ||
//       Number(ReceivedAmount) <= 0
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Received amount must be greater than zero",
//       });
//     }

//     const pool = await getPool();

//     const codeResult =
//       await pool.request().query(`
//         SELECT
//           ISNULL(MAX(ReceiptCode), 0) + 1
//           AS ReceiptCode
//         FROM tbl_Receipt
//       `);

//     const receiptCode =
//       codeResult.recordset[0]
//         .ReceiptCode;

//     await pool
//       .request()
//       .input(
//         "ReceiptCode",
//         sql.Int,
//         receiptCode
//       )
//       .input(
//         "ReceiptNo",
//         sql.Int,
//         ReceiptNo
//           ? Number(ReceiptNo)
//           : null
//       )
//       .input(
//         "ReceiptDate",
//         sql.DateTime,
//         new Date(ReceiptDate)
//       )
//       .input(
//         "HeadCode",
//         sql.Int,
//         Number(HeadCode)
//       )
//       .input(
//         "ReceivedFrom",
//         sql.VarChar(50),
//         String(ReceivedFrom).trim()
//       )
//       .input(
//         "MNo",
//         sql.Int,
//         MNo
//           ? Number(MNo)
//           : null
//       )
//       .input(
//         "Receivedby",
//         sql.VarChar(50),
//         String(Receivedby).trim()
//       )
//       .input(
//         "ReceivedAmount",
//         sql.Numeric(12, 3),
//         Number(ReceivedAmount)
//       )
//       .query(`
//         INSERT INTO tbl_Receipt
//         (
//           ReceiptCode,
//           ReceiptNo,
//           ReceiptDate,
//           HeadCode,
//           ReceivedFrom,
//           MNo,
//           Receivedby,
//           ReceivedAmount
//         )
//         VALUES
//         (
//           @ReceiptCode,
//           @ReceiptNo,
//           @ReceiptDate,
//           @HeadCode,
//           @ReceivedFrom,
//           @MNo,
//           @Receivedby,
//           @ReceivedAmount
//         )
//       `);

//     res.status(201).json({
//       success: true,
//       message:
//         "Receipt added successfully",
//       ReceiptCode: receiptCode,
//     });
//   } catch (error) {
//     console.error(
//       "ADD RECEIPT ERROR:",
//       error
//     );

//     res.status(500).json({
//       success: false,
//       message:
//         "Unable to add receipt",
//       error: error.message,
//     });
//   }
// });

// // =====================================================
// // UPDATE RECEIPT
// // =====================================================

// router.put("/:id", async (req, res) => {
//   try {
//     const receiptCode =
//       Number(req.params.id);

//     const {
//       ReceiptNo,
//       ReceiptDate,
//       HeadCode,
//       ReceivedFrom,
//       MNo,
//       Receivedby,
//       ReceivedAmount,
//     } = req.body;

//     if (!Number.isInteger(receiptCode)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid ReceiptCode",
//       });
//     }

//     if (!ReceiptDate) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Receipt date is required",
//       });
//     }

//     if (!HeadCode) {
//       return res.status(400).json({
//         success: false,
//         message: "Head is required",
//       });
//     }

//     if (!ReceivedFrom) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Received From is required",
//       });
//     }

//     if (!Receivedby) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Received By is required",
//       });
//     }

//     if (
//       ReceivedAmount === undefined ||
//       Number(ReceivedAmount) <= 0
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Received amount must be greater than zero",
//       });
//     }

//     const pool = await getPool();

//     const result =
//       await pool
//         .request()
//         .input(
//           "ReceiptCode",
//           sql.Int,
//           receiptCode
//         )
//         .input(
//           "ReceiptNo",
//           sql.Int,
//           ReceiptNo
//             ? Number(ReceiptNo)
//             : null
//         )
//         .input(
//           "ReceiptDate",
//           sql.DateTime,
//           new Date(ReceiptDate)
//         )
//         .input(
//           "HeadCode",
//           sql.Int,
//           Number(HeadCode)
//         )
//         .input(
//           "ReceivedFrom",
//           sql.VarChar(50),
//           String(
//             ReceivedFrom
//           ).trim()
//         )
//         .input(
//           "MNo",
//           sql.Int,
//           MNo
//             ? Number(MNo)
//             : null
//         )
//         .input(
//           "Receivedby",
//           sql.VarChar(50),
//           String(
//             Receivedby
//           ).trim()
//         )
//         .input(
//           "ReceivedAmount",
//           sql.Numeric(12, 3),
//           Number(ReceivedAmount)
//         )
//         .query(`
//           UPDATE tbl_Receipt
//           SET
//             ReceiptNo = @ReceiptNo,
//             ReceiptDate = @ReceiptDate,
//             HeadCode = @HeadCode,
//             ReceivedFrom = @ReceivedFrom,
//             MNo = @MNo,
//             Receivedby = @Receivedby,
//             ReceivedAmount = @ReceivedAmount
//           WHERE ReceiptCode = @ReceiptCode
//         `);

//     if (result.rowsAffected[0] === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Receipt not found",
//       });
//     }

//     res.json({
//       success: true,
//       message:
//         "Receipt updated successfully",
//     });
//   } catch (error) {
//     console.error(
//       "UPDATE RECEIPT ERROR:",
//       error
//     );

//     res.status(500).json({
//       success: false,
//       message:
//         "Unable to update receipt",
//       error: error.message,
//     });
//   }
// });

// // =====================================================
// // DELETE RECEIPT
// // =====================================================

// router.delete("/:id", async (req, res) => {
//   try {
//     const receiptCode =
//       Number(req.params.id);

//     if (!Number.isInteger(receiptCode)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid ReceiptCode",
//       });
//     }

//     const pool = await getPool();

//     const result =
//       await pool
//         .request()
//         .input(
//           "ReceiptCode",
//           sql.Int,
//           receiptCode
//         )
//         .query(`
//           DELETE FROM tbl_Receipt
//           WHERE ReceiptCode = @ReceiptCode
//         `);

//     if (result.rowsAffected[0] === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Receipt not found",
//       });
//     }

//     res.json({
//       success: true,
//       message:
//         "Receipt deleted successfully",
//     });
//   } catch (error) {
//     console.error(
//       "DELETE RECEIPT ERROR:",
//       error
//     );

//     res.status(500).json({
//       success: false,
//       message:
//         "Unable to delete receipt",
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
    console.error("RECEIPT AUTH ERROR:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

// =====================================================
// GET SELECTED FINANCIAL YEAR
// =====================================================

async function getSelectedFinancialYear(pool, fyCode) {
  const result = await pool
    .request()
    .input("FYCode", sql.Int, fyCode)
    .query(`
      SELECT
        FYCode,
        FYear,
        FYStart,
        FYEnd
      FROM dbo.tbl_FYear
      WHERE FYCode = @FYCode
    `);

  if (result.recordset.length === 0) {
    return null;
  }

  return result.recordset[0];
}

// =====================================================
// GET ALL RECEIPTS
// =====================================================

router.get("/", authenticateToken, async (req, res) => {
  try {
    const fyCode = Number(req.user?.FYCode);

    if (!Number.isInteger(fyCode)) {
      return res.status(400).json({
        success: false,
        message: "Financial year is missing from login session",
      });
    }

    const pool = await getPool();

    const financialYear =
      await getSelectedFinancialYear(pool, fyCode);

    if (!financialYear) {
      return res.status(400).json({
        success: false,
        message: "Selected financial year was not found",
      });
    }

    const result = await pool
      .request()
      .input(
        "FYStart",
        sql.DateTime,
        financialYear.FYStart
      )
      .input(
        "FYEnd",
        sql.DateTime,
        financialYear.FYEnd
      )
      .query(`
        SELECT
          r.ReceiptCode,
          r.ReceiptNo,
          r.ReceiptDate,
          r.HeadCode,
          h.HeadName,
          r.ReceivedFrom,
          r.MNo,
          r.Receivedby,
          r.ReceivedAmount

        FROM dbo.tbl_Receipt r

        LEFT JOIN dbo.tbl_Head h
          ON r.HeadCode = h.HeadCode

        WHERE
          r.ReceiptDate >= @FYStart
          AND r.ReceiptDate < @FYEnd

        ORDER BY
          r.ReceiptCode DESC
      `);

    res.json(result.recordset);
  } catch (error) {
    console.error("GET RECEIPTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load receipts",
      error: error.message,
    });
  }
});

// =====================================================
// GET RECEIPT BY CODE
// =====================================================

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const receiptCode = Number(req.params.id);
    const fyCode = Number(req.user?.FYCode);

    if (!Number.isInteger(receiptCode) || receiptCode <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid ReceiptCode",
      });
    }

    if (!Number.isInteger(fyCode)) {
      return res.status(400).json({
        success: false,
        message: "Financial year is missing from login session",
      });
    }

    const pool = await getPool();

    const financialYear =
      await getSelectedFinancialYear(pool, fyCode);

    if (!financialYear) {
      return res.status(400).json({
        success: false,
        message: "Selected financial year was not found",
      });
    }

    const result = await pool
      .request()
      .input(
        "ReceiptCode",
        sql.Int,
        receiptCode
      )
      .input(
        "FYStart",
        sql.DateTime,
        financialYear.FYStart
      )
      .input(
        "FYEnd",
        sql.DateTime,
        financialYear.FYEnd
      )
      .query(`
        SELECT
          r.ReceiptCode,
          r.ReceiptNo,
          r.ReceiptDate,
          r.HeadCode,
          h.HeadName,
          r.ReceivedFrom,
          r.MNo,
          r.Receivedby,
          r.ReceivedAmount

        FROM dbo.tbl_Receipt r

        LEFT JOIN dbo.tbl_Head h
          ON r.HeadCode = h.HeadCode

        WHERE
          r.ReceiptCode = @ReceiptCode
          AND r.ReceiptDate >= @FYStart
          AND r.ReceiptDate < @FYEnd
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Receipt not found in selected financial year",
      });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error("GET RECEIPT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load receipt",
      error: error.message,
    });
  }
});

// =====================================================
// ADD RECEIPT
// =====================================================

router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      ReceiptNo,
      ReceiptDate,
      HeadCode,
      ReceivedFrom,
      MNo,
      Receivedby,
      ReceivedAmount,
    } = req.body;

    const fyCode = Number(req.user?.FYCode);

    // =================================================
    // FY VALIDATION
    // =================================================

    if (!Number.isInteger(fyCode)) {
      return res.status(400).json({
        success: false,
        message: "Financial year is missing from login session",
      });
    }

    // =================================================
    // BASIC VALIDATION
    // =================================================

    if (!ReceiptDate) {
      return res.status(400).json({
        success: false,
        message: "Receipt date is required",
      });
    }

    if (!HeadCode) {
      return res.status(400).json({
        success: false,
        message: "Head is required",
      });
    }

    if (
      !ReceivedFrom ||
      String(ReceivedFrom).trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Received From is required",
      });
    }

    if (
      !Receivedby ||
      String(Receivedby).trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Received By is required",
      });
    }

    if (
      ReceivedAmount === undefined ||
      ReceivedAmount === null ||
      ReceivedAmount === "" ||
      !Number.isFinite(Number(ReceivedAmount)) ||
      Number(ReceivedAmount) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Received amount must be greater than zero",
      });
    }

    // =================================================
    // DATE VALIDATION
    // =================================================

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(String(ReceiptDate))) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid receipt date. Expected YYYY-MM-DD",
      });
    }

    const pool = await getPool();

    // =================================================
    // GET FINANCIAL YEAR
    // =================================================

    const financialYear =
      await getSelectedFinancialYear(pool, fyCode);

    if (!financialYear) {
      return res.status(400).json({
        success: false,
        message: "Selected financial year was not found",
      });
    }

    // =================================================
    // CHECK RECEIPT DATE IS IN FY
    // =================================================

    const receiptDate =
      new Date(`${ReceiptDate}T00:00:00`);

    if (
      receiptDate < new Date(financialYear.FYStart) ||
      receiptDate >= new Date(financialYear.FYEnd)
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Receipt date must be within financial year ${financialYear.FYear}`,
      });
    }

    // =================================================
    // CHECK HEAD
    // =================================================

    const headResult = await pool
      .request()
      .input(
        "HeadCode",
        sql.Int,
        Number(HeadCode)
      )
      .query(`
        SELECT HeadCode
        FROM dbo.tbl_Head
        WHERE HeadCode = @HeadCode
      `);

    if (headResult.recordset.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Selected head was not found",
      });
    }

    // =================================================
    // GENERATE RECEIPT CODE
    // =================================================

    const codeResult =
      await pool.request().query(`
        SELECT
          ISNULL(MAX(ReceiptCode), 0) + 1
          AS ReceiptCode
        FROM dbo.tbl_Receipt
      `);

    const receiptCode =
      Number(codeResult.recordset[0].ReceiptCode);

    // =================================================
    // GENERATE RECEIPT NO
    // WITHIN SELECTED FY
    // =================================================

    const noResult = await pool
      .request()
      .input(
        "FYStart",
        sql.DateTime,
        financialYear.FYStart
      )
      .input(
        "FYEnd",
        sql.DateTime,
        financialYear.FYEnd
      )
      .query(`
        SELECT
          ISNULL(MAX(ReceiptNo), 0) + 1
          AS NextReceiptNo
        FROM dbo.tbl_Receipt
        WHERE
          ReceiptDate >= @FYStart
          AND ReceiptDate < @FYEnd
      `);

    const receiptNo =
      ReceiptNo !== undefined &&
      ReceiptNo !== null &&
      ReceiptNo !== ""
        ? Number(ReceiptNo)
        : Number(noResult.recordset[0].NextReceiptNo);

    // =================================================
    // STRING VALIDATION
    // =================================================

    const receivedFromValue =
      String(ReceivedFrom).trim();

    const receivedByValue =
      String(Receivedby).trim();

    if (receivedFromValue.length > 50) {
      return res.status(400).json({
        success: false,
        message:
          "Received From cannot exceed 50 characters",
      });
    }

    if (receivedByValue.length > 50) {
      return res.status(400).json({
        success: false,
        message:
          "Received By cannot exceed 50 characters",
      });
    }

    // =================================================
    // INSERT
    // =================================================

    await pool
      .request()
      .input(
        "ReceiptCode",
        sql.Int,
        receiptCode
      )
      .input(
        "ReceiptNo",
        sql.Int,
        receiptNo
      )
      .input(
        "ReceiptDate",
        sql.DateTime,
        receiptDate
      )
      .input(
        "HeadCode",
        sql.Int,
        Number(HeadCode)
      )
      .input(
        "ReceivedFrom",
        sql.VarChar(50),
        receivedFromValue
      )
      .input(
        "MNo",
        sql.Int,
        MNo !== undefined &&
        MNo !== null &&
        MNo !== ""
          ? Number(MNo)
          : null
      )
      .input(
        "Receivedby",
        sql.VarChar(50),
        receivedByValue
      )
      .input(
        "ReceivedAmount",
        sql.Numeric(12, 3),
        Number(ReceivedAmount)
      )
      .query(`
        INSERT INTO dbo.tbl_Receipt
        (
          ReceiptCode,
          ReceiptNo,
          ReceiptDate,
          HeadCode,
          ReceivedFrom,
          MNo,
          Receivedby,
          ReceivedAmount
        )
        VALUES
        (
          @ReceiptCode,
          @ReceiptNo,
          @ReceiptDate,
          @HeadCode,
          @ReceivedFrom,
          @MNo,
          @Receivedby,
          @ReceivedAmount
        )
      `);

    res.status(201).json({
      success: true,
      message: "Receipt added successfully",
      ReceiptCode: receiptCode,
      ReceiptNo: receiptNo,
    });
  } catch (error) {
    console.error("ADD RECEIPT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to add receipt",
      error: error.message,
    });
  }
});

// =====================================================
// UPDATE RECEIPT
// =====================================================

router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const receiptCode = Number(req.params.id);

    const {
      ReceiptNo,
      ReceiptDate,
      HeadCode,
      ReceivedFrom,
      MNo,
      Receivedby,
      ReceivedAmount,
    } = req.body;

    const fyCode = Number(req.user?.FYCode);

    // =================================================
    // VALIDATION
    // =================================================

    if (!Number.isInteger(receiptCode) || receiptCode <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid ReceiptCode",
      });
    }

    if (!Number.isInteger(fyCode)) {
      return res.status(400).json({
        success: false,
        message: "Financial year is missing from login session",
      });
    }

    if (!ReceiptDate) {
      return res.status(400).json({
        success: false,
        message: "Receipt date is required",
      });
    }

    if (!HeadCode) {
      return res.status(400).json({
        success: false,
        message: "Head is required",
      });
    }

    if (
      !ReceivedFrom ||
      String(ReceivedFrom).trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Received From is required",
      });
    }

    if (
      !Receivedby ||
      String(Receivedby).trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Received By is required",
      });
    }

    if (
      ReceivedAmount === undefined ||
      ReceivedAmount === null ||
      ReceivedAmount === "" ||
      !Number.isFinite(Number(ReceivedAmount)) ||
      Number(ReceivedAmount) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Received amount must be greater than zero",
      });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(String(ReceiptDate))) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid receipt date. Expected YYYY-MM-DD",
      });
    }

    const pool = await getPool();

    // =================================================
    // GET FY
    // =================================================

    const financialYear =
      await getSelectedFinancialYear(pool, fyCode);

    if (!financialYear) {
      return res.status(400).json({
        success: false,
        message: "Selected financial year was not found",
      });
    }

    // =================================================
    // CHECK EXISTING RECEIPT BELONGS TO FY
    // =================================================

    const existing = await pool
      .request()
      .input(
        "ReceiptCode",
        sql.Int,
        receiptCode
      )
      .input(
        "FYStart",
        sql.DateTime,
        financialYear.FYStart
      )
      .input(
        "FYEnd",
        sql.DateTime,
        financialYear.FYEnd
      )
      .query(`
        SELECT ReceiptCode
        FROM dbo.tbl_Receipt
        WHERE
          ReceiptCode = @ReceiptCode
          AND ReceiptDate >= @FYStart
          AND ReceiptDate < @FYEnd
      `);

    if (existing.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Receipt not found in selected financial year",
      });
    }

    // =================================================
    // CHECK NEW DATE
    // =================================================

    const receiptDate =
      new Date(`${ReceiptDate}T00:00:00`);

    if (
      receiptDate < new Date(financialYear.FYStart) ||
      receiptDate >= new Date(financialYear.FYEnd)
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Receipt date must be within financial year ${financialYear.FYear}`,
      });
    }

    // =================================================
    // CHECK HEAD
    // =================================================

    const headResult = await pool
      .request()
      .input(
        "HeadCode",
        sql.Int,
        Number(HeadCode)
      )
      .query(`
        SELECT HeadCode
        FROM dbo.tbl_Head
        WHERE HeadCode = @HeadCode
      `);

    if (headResult.recordset.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Selected head was not found",
      });
    }

    // =================================================
    // STRING VALIDATION
    // =================================================

    const receivedFromValue =
      String(ReceivedFrom).trim();

    const receivedByValue =
      String(Receivedby).trim();

    if (receivedFromValue.length > 50) {
      return res.status(400).json({
        success: false,
        message:
          "Received From cannot exceed 50 characters",
      });
    }

    if (receivedByValue.length > 50) {
      return res.status(400).json({
        success: false,
        message:
          "Received By cannot exceed 50 characters",
      });
    }

    // =================================================
    // UPDATE
    // =================================================

    const result = await pool
      .request()
      .input(
        "ReceiptCode",
        sql.Int,
        receiptCode
      )
      .input(
        "ReceiptNo",
        sql.Int,
        ReceiptNo !== undefined &&
        ReceiptNo !== null &&
        ReceiptNo !== ""
          ? Number(ReceiptNo)
          : null
      )
      .input(
        "ReceiptDate",
        sql.DateTime,
        receiptDate
      )
      .input(
        "HeadCode",
        sql.Int,
        Number(HeadCode)
      )
      .input(
        "ReceivedFrom",
        sql.VarChar(50),
        receivedFromValue
      )
      .input(
        "MNo",
        sql.Int,
        MNo !== undefined &&
        MNo !== null &&
        MNo !== ""
          ? Number(MNo)
          : null
      )
      .input(
        "Receivedby",
        sql.VarChar(50),
        receivedByValue
      )
      .input(
        "ReceivedAmount",
        sql.Numeric(12, 3),
        Number(ReceivedAmount)
      )
      .query(`
        UPDATE dbo.tbl_Receipt
        SET
          ReceiptNo = @ReceiptNo,
          ReceiptDate = @ReceiptDate,
          HeadCode = @HeadCode,
          ReceivedFrom = @ReceivedFrom,
          MNo = @MNo,
          Receivedby = @Receivedby,
          ReceivedAmount = @ReceivedAmount
        WHERE ReceiptCode = @ReceiptCode
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found",
      });
    }

    res.json({
      success: true,
      message: "Receipt updated successfully",
    });
  } catch (error) {
    console.error("UPDATE RECEIPT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update receipt",
      error: error.message,
    });
  }
});

// =====================================================
// DELETE RECEIPT
// =====================================================

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const receiptCode = Number(req.params.id);
    const fyCode = Number(req.user?.FYCode);

    if (!Number.isInteger(receiptCode) || receiptCode <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid ReceiptCode",
      });
    }

    if (!Number.isInteger(fyCode)) {
      return res.status(400).json({
        success: false,
        message: "Financial year is missing from login session",
      });
    }

    const pool = await getPool();

    const financialYear =
      await getSelectedFinancialYear(pool, fyCode);

    if (!financialYear) {
      return res.status(400).json({
        success: false,
        message: "Selected financial year was not found",
      });
    }

    const result = await pool
      .request()
      .input(
        "ReceiptCode",
        sql.Int,
        receiptCode
      )
      .input(
        "FYStart",
        sql.DateTime,
        financialYear.FYStart
      )
      .input(
        "FYEnd",
        sql.DateTime,
        financialYear.FYEnd
      )
      .query(`
        DELETE FROM dbo.tbl_Receipt
        WHERE
          ReceiptCode = @ReceiptCode
          AND ReceiptDate >= @FYStart
          AND ReceiptDate < @FYEnd
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Receipt not found in selected financial year",
      });
    }

    res.json({
      success: true,
      message: "Receipt deleted successfully",
    });
  } catch (error) {
    console.error("DELETE RECEIPT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete receipt",
      error: error.message,
    });
  }
});

module.exports = router;