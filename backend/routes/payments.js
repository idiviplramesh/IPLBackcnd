// const express = require("express");
// const router = express.Router();

// const { getPool, sql } = require("../config/db");

// // =====================================================
// // GET ALL PAYMENTS
// // =====================================================

// router.get("/", async (req, res) => {
//   try {
//     const pool = await getPool();

//     const result = await pool.request().query(`
//       SELECT
//         p.PaymentCode,
//         p.PaymentNo,
//         p.PaymentDate,
//         p.HeadCode,
//         h.HeadName,

//         -- IMPORTANT: convert Notes to normal string
//         CAST(p.Notes AS NVARCHAR(500)) AS Notes,

//         p.[Paid By] AS PaidBy,
//         p.PaymentAmount

//       FROM tbl_Payment p

//       LEFT JOIN tbl_Head h
//         ON p.HeadCode = h.HeadCode

//       ORDER BY p.PaymentCode DESC
//     `);

//     res.json(result.recordset);

//   } catch (error) {
//     console.error("GET PAYMENTS ERROR:", error);

//     res.status(500).json({
//       success: false,
//       message: "Unable to load payments",
//       error: error.message,
//     });
//   }
// });

// // =====================================================
// // GET PAYMENT BY CODE
// // =====================================================

// router.get("/:id", async (req, res) => {
//   try {
//     const paymentCode = Number(req.params.id);

//     if (!Number.isInteger(paymentCode)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid PaymentCode",
//       });
//     }

//     const pool = await getPool();

//     const result = await pool
//       .request()
//       .input(
//         "PaymentCode",
//         sql.Int,
//         paymentCode
//       )
//       .query(`
//         SELECT
//           p.PaymentCode,
//           p.PaymentNo,
//           p.PaymentDate,
//           p.HeadCode,
//           h.HeadName,

//           CAST(p.Notes AS NVARCHAR(500)) AS Notes,

//           p.[Paid By] AS PaidBy,
//           p.PaymentAmount

//         FROM tbl_Payment p

//         LEFT JOIN tbl_Head h
//           ON p.HeadCode = h.HeadCode

//         WHERE p.PaymentCode = @PaymentCode
//       `);

//     if (result.recordset.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Payment not found",
//       });
//     }

//     res.json(result.recordset[0]);

//   } catch (error) {
//     console.error("GET PAYMENT ERROR:", error);

//     res.status(500).json({
//       success: false,
//       message: "Unable to load payment",
//       error: error.message,
//     });
//   }
// });

// // =====================================================
// // ADD PAYMENT
// // =====================================================

// router.post("/", async (req, res) => {
//   try {
//     const {
//       PaymentDate,
//       HeadCode,
//       Notes,
//       PaidBy,
//       PaymentAmount,
//     } = req.body;

//     // =================================================
//     // VALIDATION
//     // =================================================

//     if (!PaymentDate) {
//       return res.status(400).json({
//         success: false,
//         message: "Payment date is required",
//       });
//     }

//     if (!HeadCode) {
//       return res.status(400).json({
//         success: false,
//         message: "Head is required",
//       });
//     }

//     if (!PaidBy || String(PaidBy).trim() === "") {
//       return res.status(400).json({
//         success: false,
//         message: "Paid By is required",
//       });
//     }

//     if (
//       PaymentAmount === undefined ||
//       PaymentAmount === null ||
//       PaymentAmount === "" ||
//       Number(PaymentAmount) <= 0
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Payment amount must be greater than zero",
//       });
//     }

//     // =================================================
//     // DATE VALIDATION
//     // =================================================

//     const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

//     if (!dateRegex.test(String(PaymentDate))) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid payment date. Expected YYYY-MM-DD",
//       });
//     }

//     const pool = await getPool();

//     // =================================================
//     // GENERATE PAYMENT CODE
//     // =================================================

//     const codeResult = await pool
//       .request()
//       .query(`
//         SELECT
//           ISNULL(MAX(PaymentCode), 0) + 1 AS NextPaymentCode
//         FROM tbl_Payment
//       `);

//     const paymentCode = Number(
//       codeResult.recordset[0].NextPaymentCode
//     );

//     // =================================================
//     // GENERATE PAYMENT NO
//     // =================================================

//     const noResult = await pool
//       .request()
//       .query(`
//         SELECT
//           ISNULL(MAX(PaymentNo), 0) + 1 AS NextPaymentNo
//         FROM tbl_Payment
//       `);

//     const paymentNo = Number(
//       noResult.recordset[0].NextPaymentNo
//     );

//     // =================================================
//     // NOTES
//     // =================================================

//     const notesValue =
//       Notes !== undefined &&
//       Notes !== null &&
//       String(Notes).trim() !== ""
//         ? String(Notes).trim()
//         : null;

//     console.log("PAYMENT NOTES:", notesValue);

//     // =================================================
//     // INSERT
//     // =================================================

//     await pool
//       .request()

//       .input(
//         "PaymentCode",
//         sql.Int,
//         paymentCode
//       )

//       .input(
//         "PaymentNo",
//         sql.Int,
//         paymentNo
//       )

//       .input(
//         "PaymentDate",
//         sql.Date,
//         PaymentDate
//       )

//       .input(
//         "HeadCode",
//         sql.Int,
//         Number(HeadCode)
//       )

//       // IMPORTANT
//       // Notes is NVARCHAR
//       .input(
//         "Notes",
//         sql.NVarChar(500),
//         notesValue
//       )

//       .input(
//         "PaidBy",
//         sql.NVarChar(50),
//         String(PaidBy).trim()
//       )

//       .input(
//         "PaymentAmount",
//         sql.Numeric(12, 3),
//         Number(PaymentAmount)
//       )

//       .query(`
//         INSERT INTO tbl_Payment
//         (
//           PaymentCode,
//           PaymentNo,
//           PaymentDate,
//           HeadCode,
//           Notes,
//           [Paid By],
//           PaymentAmount
//         )
//         VALUES
//         (
//           @PaymentCode,
//           @PaymentNo,
//           @PaymentDate,
//           @HeadCode,
//           @Notes,
//           @PaidBy,
//           @PaymentAmount
//         )
//       `);

//     // =================================================
//     // RESPONSE
//     // =================================================

//     res.status(201).json({
//       success: true,
//       message: "Payment added successfully",
//       PaymentCode: paymentCode,
//       PaymentNo: paymentNo,
//     });

//   } catch (error) {
//     console.error("ADD PAYMENT ERROR:", error);

//     res.status(500).json({
//       success: false,
//       message: "Unable to add payment",
//       error: error.message,
//     });
//   }
// });

// // =====================================================
// // UPDATE PAYMENT
// // =====================================================

// router.put("/:id", async (req, res) => {
//   try {
//     const paymentCode = Number(req.params.id);

//     const {
//       PaymentDate,
//       HeadCode,
//       Notes,
//       PaidBy,
//       PaymentAmount,
//     } = req.body;

//     // =================================================
//     // VALIDATION
//     // =================================================

//     if (!Number.isInteger(paymentCode)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid PaymentCode",
//       });
//     }

//     if (!PaymentDate) {
//       return res.status(400).json({
//         success: false,
//         message: "Payment date is required",
//       });
//     }

//     if (!HeadCode) {
//       return res.status(400).json({
//         success: false,
//         message: "Head is required",
//       });
//     }

//     if (!PaidBy || String(PaidBy).trim() === "") {
//       return res.status(400).json({
//         success: false,
//         message: "Paid By is required",
//       });
//     }

//     if (
//       PaymentAmount === undefined ||
//       PaymentAmount === null ||
//       PaymentAmount === "" ||
//       Number(PaymentAmount) <= 0
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Payment amount must be greater than zero",
//       });
//     }

//     // =================================================
//     // DATE VALIDATION
//     // =================================================

//     const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

//     if (!dateRegex.test(String(PaymentDate))) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid payment date. Expected YYYY-MM-DD",
//       });
//     }

//     const pool = await getPool();

//     // =================================================
//     // NOTES
//     // =================================================

//     const notesValue =
//       Notes !== undefined &&
//       Notes !== null &&
//       String(Notes).trim() !== ""
//         ? String(Notes).trim()
//         : null;

//     console.log(
//       "UPDATE PAYMENT NOTES:",
//       notesValue
//     );

//     // =================================================
//     // UPDATE
//     // =================================================

//     const result = await pool
//       .request()

//       .input(
//         "PaymentCode",
//         sql.Int,
//         paymentCode
//       )

//       .input(
//         "PaymentDate",
//         sql.Date,
//         PaymentDate
//       )

//       .input(
//         "HeadCode",
//         sql.Int,
//         Number(HeadCode)
//       )

//       // IMPORTANT
//       // Notes as NVARCHAR
//       .input(
//         "Notes",
//         sql.NVarChar(500),
//         notesValue
//       )

//       .input(
//         "PaidBy",
//         sql.NVarChar(50),
//         String(PaidBy).trim()
//       )

//       .input(
//         "PaymentAmount",
//         sql.Numeric(12, 3),
//         Number(PaymentAmount)
//       )

//       .query(`
//         UPDATE tbl_Payment
//         SET
//           PaymentDate = @PaymentDate,
//           HeadCode = @HeadCode,
//           Notes = @Notes,
//           [Paid By] = @PaidBy,
//           PaymentAmount = @PaymentAmount
//         WHERE PaymentCode = @PaymentCode
//       `);

//     // =================================================
//     // NOT FOUND
//     // =================================================

//     if (result.rowsAffected[0] === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Payment not found",
//       });
//     }

//     // =================================================
//     // RESPONSE
//     // =================================================

//     res.json({
//       success: true,
//       message: "Payment updated successfully",
//     });

//   } catch (error) {
//     console.error("UPDATE PAYMENT ERROR:", error);

//     res.status(500).json({
//       success: false,
//       message: "Unable to update payment",
//       error: error.message,
//     });
//   }
// });

// // =====================================================
// // DELETE PAYMENT
// // =====================================================

// router.delete("/:id", async (req, res) => {
//   try {
//     const paymentCode = Number(req.params.id);

//     if (!Number.isInteger(paymentCode)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid PaymentCode",
//       });
//     }

//     const pool = await getPool();

//     const result = await pool
//       .request()
//       .input(
//         "PaymentCode",
//         sql.Int,
//         paymentCode
//       )
//       .query(`
//         DELETE FROM tbl_Payment
//         WHERE PaymentCode = @PaymentCode
//       `);

//     if (result.rowsAffected[0] === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Payment not found",
//       });
//     }

//     res.json({
//       success: true,
//       message: "Payment deleted successfully",
//     });

//   } catch (error) {
//     console.error("DELETE PAYMENT ERROR:", error);

//     res.status(500).json({
//       success: false,
//       message: "Unable to delete payment",
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
    console.error("PAYMENT AUTH ERROR:", error);

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
// GET ALL PAYMENTS
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
      .input("FYStart", sql.DateTime, financialYear.FYStart)
      .input("FYEnd", sql.DateTime, financialYear.FYEnd)
      .query(`
        SELECT
          p.PaymentCode,
          p.PaymentNo,
          p.PaymentDate,
          p.HeadCode,
          h.HeadName,

          CAST(p.Notes AS NVARCHAR(500)) AS Notes,

          p.[Paid By] AS PaidBy,
          p.PaymentAmount

        FROM dbo.tbl_Payment p

        LEFT JOIN dbo.tbl_Head h
          ON p.HeadCode = h.HeadCode

        WHERE
          p.PaymentDate >= @FYStart
          AND p.PaymentDate < @FYEnd

        ORDER BY
          p.PaymentCode DESC
      `);

    res.json(result.recordset);
  } catch (error) {
    console.error("GET PAYMENTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load payments",
      error: error.message,
    });
  }
});

// =====================================================
// GET PAYMENT BY CODE
// =====================================================

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const paymentCode = Number(req.params.id);
    const fyCode = Number(req.user?.FYCode);

    if (!Number.isInteger(paymentCode) || paymentCode <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid PaymentCode",
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
      .input("PaymentCode", sql.Int, paymentCode)
      .input("FYStart", sql.DateTime, financialYear.FYStart)
      .input("FYEnd", sql.DateTime, financialYear.FYEnd)
      .query(`
        SELECT
          p.PaymentCode,
          p.PaymentNo,
          p.PaymentDate,
          p.HeadCode,
          h.HeadName,

          CAST(p.Notes AS NVARCHAR(500)) AS Notes,

          p.[Paid By] AS PaidBy,
          p.PaymentAmount

        FROM dbo.tbl_Payment p

        LEFT JOIN dbo.tbl_Head h
          ON p.HeadCode = h.HeadCode

        WHERE
          p.PaymentCode = @PaymentCode
          AND p.PaymentDate >= @FYStart
          AND p.PaymentDate < @FYEnd
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment not found in selected financial year",
      });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error("GET PAYMENT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load payment",
      error: error.message,
    });
  }
});

// =====================================================
// ADD PAYMENT
// =====================================================

router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      PaymentDate,
      HeadCode,
      Notes,
      PaidBy,
      PaymentAmount,
    } = req.body;

    const fyCode = Number(req.user?.FYCode);

    // =================================================
    // AUTH / FY VALIDATION
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

    if (!PaymentDate) {
      return res.status(400).json({
        success: false,
        message: "Payment date is required",
      });
    }

    if (!HeadCode) {
      return res.status(400).json({
        success: false,
        message: "Head is required",
      });
    }

    if (!PaidBy || String(PaidBy).trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Paid By is required",
      });
    }

    if (
      PaymentAmount === undefined ||
      PaymentAmount === null ||
      PaymentAmount === "" ||
      !Number.isFinite(Number(PaymentAmount)) ||
      Number(PaymentAmount) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment amount must be greater than zero",
      });
    }

    // =================================================
    // DATE VALIDATION
    // =================================================

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(String(PaymentDate))) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment date. Expected YYYY-MM-DD",
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
    // CHECK PAYMENT DATE IS IN SELECTED FY
    // =================================================

    const dateCheck = await pool
      .request()
      .input(
        "PaymentDate",
        sql.DateTime,
        new Date(`${PaymentDate}T00:00:00`)
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
          CASE
            WHEN @PaymentDate >= @FYStart
             AND @PaymentDate < @FYEnd
            THEN 1
            ELSE 0
          END AS IsValid
      `);

    if (dateCheck.recordset[0].IsValid !== 1) {
      return res.status(400).json({
        success: false,
        message:
          `Payment date must be within financial year ${financialYear.FYear}`,
      });
    }

    // =================================================
    // CHECK HEAD EXISTS
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
    // GENERATE PAYMENT CODE
    // =================================================

    const codeResult = await pool
      .request()
      .query(`
        SELECT
          ISNULL(MAX(PaymentCode), 0) + 1
          AS NextPaymentCode
        FROM dbo.tbl_Payment
      `);

    const paymentCode =
      Number(codeResult.recordset[0].NextPaymentCode);

    // =================================================
    // GENERATE PAYMENT NO
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
          ISNULL(MAX(PaymentNo), 0) + 1
          AS NextPaymentNo
        FROM dbo.tbl_Payment
        WHERE
          PaymentDate >= @FYStart
          AND PaymentDate < @FYEnd
      `);

    const paymentNo =
      Number(noResult.recordset[0].NextPaymentNo);

    // =================================================
    // NOTES
    // =================================================

    const notesValue =
      Notes !== undefined &&
      Notes !== null &&
      String(Notes).trim() !== ""
        ? String(Notes).trim()
        : null;

    if (notesValue && notesValue.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Notes cannot exceed 500 characters",
      });
    }

    const paidByValue =
      String(PaidBy).trim();

    if (paidByValue.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Paid By cannot exceed 50 characters",
      });
    }

    // =================================================
    // INSERT
    // =================================================

    await pool
      .request()
      .input(
        "PaymentCode",
        sql.Int,
        paymentCode
      )
      .input(
        "PaymentNo",
        sql.Int,
        paymentNo
      )
      .input(
        "PaymentDate",
        sql.DateTime,
        new Date(`${PaymentDate}T00:00:00`)
      )
      .input(
        "HeadCode",
        sql.Int,
        Number(HeadCode)
      )
      .input(
        "Notes",
        sql.NVarChar(500),
        notesValue
      )
      .input(
        "PaidBy",
        sql.VarChar(50),
        paidByValue
      )
      .input(
        "PaymentAmount",
        sql.Numeric(12, 3),
        Number(PaymentAmount)
      )
      .query(`
        INSERT INTO dbo.tbl_Payment
        (
          PaymentCode,
          PaymentNo,
          PaymentDate,
          HeadCode,
          Notes,
          [Paid By],
          PaymentAmount
        )
        VALUES
        (
          @PaymentCode,
          @PaymentNo,
          @PaymentDate,
          @HeadCode,
          @Notes,
          @PaidBy,
          @PaymentAmount
        )
      `);

    res.status(201).json({
      success: true,
      message: "Payment added successfully",
      PaymentCode: paymentCode,
      PaymentNo: paymentNo,
    });
  } catch (error) {
    console.error("ADD PAYMENT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to add payment",
      error: error.message,
    });
  }
});

// =====================================================
// UPDATE PAYMENT
// =====================================================

router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const paymentCode = Number(req.params.id);

    const {
      PaymentDate,
      HeadCode,
      Notes,
      PaidBy,
      PaymentAmount,
    } = req.body;

    const fyCode = Number(req.user?.FYCode);

    // =================================================
    // VALIDATION
    // =================================================

    if (!Number.isInteger(paymentCode) || paymentCode <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid PaymentCode",
      });
    }

    if (!Number.isInteger(fyCode)) {
      return res.status(400).json({
        success: false,
        message: "Financial year is missing from login session",
      });
    }

    if (!PaymentDate) {
      return res.status(400).json({
        success: false,
        message: "Payment date is required",
      });
    }

    if (!HeadCode) {
      return res.status(400).json({
        success: false,
        message: "Head is required",
      });
    }

    if (!PaidBy || String(PaidBy).trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Paid By is required",
      });
    }

    if (
      PaymentAmount === undefined ||
      PaymentAmount === null ||
      PaymentAmount === "" ||
      !Number.isFinite(Number(PaymentAmount)) ||
      Number(PaymentAmount) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment amount must be greater than zero",
      });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(String(PaymentDate))) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment date. Expected YYYY-MM-DD",
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
    // CHECK EXISTING PAYMENT BELONGS TO FY
    // =================================================

    const existing = await pool
      .request()
      .input(
        "PaymentCode",
        sql.Int,
        paymentCode
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
        SELECT PaymentCode
        FROM dbo.tbl_Payment
        WHERE
          PaymentCode = @PaymentCode
          AND PaymentDate >= @FYStart
          AND PaymentDate < @FYEnd
      `);

    if (existing.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Payment not found in selected financial year",
      });
    }

    // =================================================
    // CHECK DATE IS IN FY
    // =================================================

    const newDate =
      new Date(`${PaymentDate}T00:00:00`);

    if (
      newDate < new Date(financialYear.FYStart) ||
      newDate >= new Date(financialYear.FYEnd)
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Payment date must be within financial year ${financialYear.FYear}`,
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
    // NOTES
    // =================================================

    const notesValue =
      Notes !== undefined &&
      Notes !== null &&
      String(Notes).trim() !== ""
        ? String(Notes).trim()
        : null;

    if (notesValue && notesValue.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Notes cannot exceed 500 characters",
      });
    }

    const paidByValue =
      String(PaidBy).trim();

    if (paidByValue.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Paid By cannot exceed 50 characters",
      });
    }

    // =================================================
    // UPDATE
    // =================================================

    const result = await pool
      .request()
      .input(
        "PaymentCode",
        sql.Int,
        paymentCode
      )
      .input(
        "PaymentDate",
        sql.DateTime,
        newDate
      )
      .input(
        "HeadCode",
        sql.Int,
        Number(HeadCode)
      )
      .input(
        "Notes",
        sql.NVarChar(500),
        notesValue
      )
      .input(
        "PaidBy",
        sql.VarChar(50),
        paidByValue
      )
      .input(
        "PaymentAmount",
        sql.Numeric(12, 3),
        Number(PaymentAmount)
      )
      .query(`
        UPDATE dbo.tbl_Payment
        SET
          PaymentDate = @PaymentDate,
          HeadCode = @HeadCode,
          Notes = @Notes,
          [Paid By] = @PaidBy,
          PaymentAmount = @PaymentAmount
        WHERE PaymentCode = @PaymentCode
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.json({
      success: true,
      message: "Payment updated successfully",
    });
  } catch (error) {
    console.error("UPDATE PAYMENT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update payment",
      error: error.message,
    });
  }
});

// =====================================================
// DELETE PAYMENT
// =====================================================

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const paymentCode = Number(req.params.id);
    const fyCode = Number(req.user?.FYCode);

    if (!Number.isInteger(paymentCode) || paymentCode <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid PaymentCode",
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
        "PaymentCode",
        sql.Int,
        paymentCode
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
        DELETE FROM dbo.tbl_Payment
        WHERE
          PaymentCode = @PaymentCode
          AND PaymentDate >= @FYStart
          AND PaymentDate < @FYEnd
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Payment not found in selected financial year",
      });
    }

    res.json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PAYMENT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete payment",
      error: error.message,
    });
  }
});

module.exports = router;