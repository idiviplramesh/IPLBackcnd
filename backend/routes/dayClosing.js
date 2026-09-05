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
    console.error("DAY CLOSING AUTH ERROR:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

// =====================================================
// DAY CLOSING SUMMARY
// GET /api/day-closing?date=YYYY-MM-DD
// =====================================================

router.get("/", authenticateToken, async (req, res) => {
  try {
    const { date } = req.query;

    // =================================================
    // FY FROM LOGIN SESSION
    // =================================================

    const fyCode = Number(req.user?.FYCode);

    if (!Number.isInteger(fyCode)) {
      return res.status(400).json({
        success: false,
        message: "Financial year is missing from login session",
      });
    }

    // =================================================
    // DATE VALIDATION
    // =================================================

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required (YYYY-MM-DD)",
      });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(String(date))) {
      return res.status(400).json({
        success: false,
        message: "Invalid date. Expected YYYY-MM-DD",
      });
    }

    const pool = await getPool();

    // =================================================
    // GET SELECTED FINANCIAL YEAR
    // =================================================

    const fyResult = await pool
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

    if (fyResult.recordset.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Selected financial year was not found",
      });
    }

    const financialYear = fyResult.recordset[0];

    // =================================================
    // CONVERT REQUESTED DATE
    // =================================================

    const closingDate =
      new Date(`${date}T00:00:00`);

    if (Number.isNaN(closingDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid closing date",
      });
    }

    // =================================================
    // CHECK DATE IS INSIDE SELECTED FY
    // =================================================

    if (
      closingDate < new Date(financialYear.FYStart) ||
      closingDate >= new Date(financialYear.FYEnd)
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Date must be within financial year ${financialYear.FYear}`,
      });
    }

    // =================================================
    // CALCULATE NEXT DATE
    // =================================================

    const result = await pool
      .request()
      .input(
        "ClosingDate",
        sql.Date,
        date
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

          -- ===========================================
          -- RECEIPT COUNT
          -- ===========================================

          (
            SELECT COUNT(*)
            FROM dbo.tbl_Receipt
            WHERE
              ReceiptDate >= @ClosingDate
              AND ReceiptDate < DATEADD(day, 1, @ClosingDate)
              AND ReceiptDate >= @FYStart
              AND ReceiptDate < @FYEnd
          ) AS TotalReceipt,

          -- ===========================================
          -- RECEIPT AMOUNT
          -- ===========================================

          (
            SELECT ISNULL(SUM(ReceivedAmount), 0)
            FROM dbo.tbl_Receipt
            WHERE
              ReceiptDate >= @ClosingDate
              AND ReceiptDate < DATEADD(day, 1, @ClosingDate)
              AND ReceiptDate >= @FYStart
              AND ReceiptDate < @FYEnd
          ) AS ReceiptAmount,

          -- ===========================================
          -- PAYMENT COUNT
          -- ===========================================

          (
            SELECT COUNT(*)
            FROM dbo.tbl_Payment
            WHERE
              PaymentDate >= @ClosingDate
              AND PaymentDate < DATEADD(day, 1, @ClosingDate)
              AND PaymentDate >= @FYStart
              AND PaymentDate < @FYEnd
          ) AS TotalPayment,

          -- ===========================================
          -- PAYMENT AMOUNT
          -- ===========================================

          (
            SELECT ISNULL(SUM(PaymentAmount), 0)
            FROM dbo.tbl_Payment
            WHERE
              PaymentDate >= @ClosingDate
              AND PaymentDate < DATEADD(day, 1, @ClosingDate)
              AND PaymentDate >= @FYStart
              AND PaymentDate < @FYEnd
          ) AS PaymentAmount
      `);

    const row = result.recordset[0] || {};

    const totalReceipt =
      Number(row.TotalReceipt || 0);

    const receiptAmount =
      Number(row.ReceiptAmount || 0);

    const totalPayment =
      Number(row.TotalPayment || 0);

    const paymentAmount =
      Number(row.PaymentAmount || 0);

    // =================================================
    // DAILY NET BALANCE
    // =================================================

    const balance =
      receiptAmount - paymentAmount;

    // =================================================
    // RESPONSE
    // =================================================

    return res.json({
      success: true,

      date,

      FYCode: financialYear.FYCode,

      FYear: financialYear.FYear,

      summary: {
        totalReceipt,

        receiptAmount:
          Number(receiptAmount.toFixed(3)),

        totalPayment,

        paymentAmount:
          Number(paymentAmount.toFixed(3)),

        balance:
          Number(balance.toFixed(3)),
      },
    });

  } catch (error) {
    console.error("DAY CLOSING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load day closing summary",
      error: error.message,
    });
  }
});

module.exports = router;