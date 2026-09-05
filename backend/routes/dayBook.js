const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

const {
  sql,
  getPool,
} = require("../config/db");

// =====================================================
// JWT SECRET
// Must be the SAME secret used in auth.js
// =====================================================

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "ipltemple_secret_2026";

// =====================================================
// CONFIG
// =====================================================

const DEFAULT_LOOKBACK_DAYS = 31;

// =====================================================
// AUTHENTICATION
// =====================================================

function authenticateToken(req, res, next) {
  const authHeader =
    req.headers.authorization;

  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {
    return res.status(401).json({
      success: false,
      message:
        "Authentication token required",
    });
  }

  const token =
    authHeader.substring(7);

  try {
    const decoded =
      jwt.verify(
        token,
        JWT_SECRET
      );

    req.user = decoded;

    next();
  } catch (error) {
    console.error(
      "JWT ERROR:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired token",
    });
  }
}

// =====================================================
// DATE HELPER
//
// Accepts only YYYY-MM-DD.
//
// Empty / null / "null" returns null.
// =====================================================

function parseDate(dateString) {
  if (
    dateString === undefined ||
    dateString === null ||
    String(dateString).trim() === "" ||
    String(dateString).trim().toLowerCase() ===
      "null"
  ) {
    return null;
  }

  const value =
    String(dateString).trim();

  // YYYY-MM-DD
  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      value
    );

  if (!match) {
    return null;
  }

  const year =
    Number(match[1]);

  const month =
    Number(match[2]);

  const day =
    Number(match[3]);

  const date =
    new Date(
      year,
      month - 1,
      day,
      0,
      0,
      0,
      0
    );

  // Invalid date check
  if (
    date.getFullYear() !== year ||
    date.getMonth() !==
      month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

// =====================================================
// DATE ONLY
// =====================================================

function dateOnly(date) {
  const result =
    new Date(date);

  result.setHours(
    0,
    0,
    0,
    0
  );

  return result;
}

// =====================================================
// ADD DAYS
// =====================================================

function addDays(date, days) {
  const result =
    new Date(date);

  result.setDate(
    result.getDate() + days
  );

  return result;
}

// =====================================================
// FORMAT DATE AS YYYY-MM-DD
//
// Avoid UTC timezone problems.
// =====================================================

function formatDate(date) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// =====================================================
// SAFE NUMBER
// =====================================================

function safeNumber(value) {
  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

// =====================================================
// DAY BOOK
//
// GET:
// /api/reports/day-book
//
// Examples:
//
// /api/reports/day-book
//
// /api/reports/day-book?fromDate=2026-08-04&toDate=2026-09-04
//
// Financial Year comes from JWT.
//
// IMPORTANT:
//
// Opening Balance:
//
//     tbl_HeadOpening
//     +
//     Previous Receipts
//     -
//     Previous Payments
//
// =====================================================

router.get(
  "/day-book",
  authenticateToken,
  async (req, res) => {
    try {
      console.log(
        "================================="
      );

      console.log(
        "DAY BOOK ROUTE HIT"
      );

      console.log(
        "USER:",
        req.user
      );

      console.log(
        "QUERY:",
        req.query
      );

      console.log(
        "================================="
      );

      const {
        fromDate,
        toDate,
      } = req.query;

      // =================================================
      // CHECK FINANCIAL YEAR
      // =================================================

      if (!req.user?.FYCode) {
        return res.status(400).json({
          success: false,
          message:
            "Financial Year is not selected",
        });
      }

      const fyCode =
        Number(
          req.user.FYCode
        );

      if (
        !Number.isInteger(
          fyCode
        ) ||
        fyCode <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid Financial Year",
        });
      }

      // =================================================
      // DATABASE
      // =================================================

      const pool =
        await getPool();

      // =================================================
      // GET FINANCIAL YEAR
      // =================================================

      const fyRequest =
        pool.request();

      fyRequest.input(
        "FYCode",
        sql.Int,
        fyCode
      );

      const fyResult =
        await fyRequest.query(`
          SELECT
            FYCode,
            FYear,
            FYStart,
            FYEnd,
            LSDate
          FROM dbo.tbl_FYear
          WHERE FYCode = @FYCode
        `);

      if (
        !fyResult.recordset.length
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Financial Year not found",
        });
      }

      const financialYear =
        fyResult.recordset[0];

      // =================================================
      // FINANCIAL YEAR DATES
      // =================================================

      const fyStart =
        dateOnly(
          new Date(
            financialYear.FYStart
          )
        );

      const fyEnd =
        dateOnly(
          new Date(
            financialYear.FYEnd
          )
        );

      // =================================================
      // VALIDATE FY DATES
      // =================================================

      if (
        Number.isNaN(
          fyStart.getTime()
        ) ||
        Number.isNaN(
          fyEnd.getTime()
        )
      ) {
        return res.status(500).json({
          success: false,
          message:
            "Invalid Financial Year dates",
        });
      }

      if (
        fyStart >= fyEnd
      ) {
        return res.status(500).json({
          success: false,
          message:
            "Financial Year dates are invalid",
        });
      }

      // =================================================
      // REQUEST DATE RANGE
      // =================================================

      let startDate =
        parseDate(fromDate);

      let endDate =
        parseDate(toDate);

      // =================================================
      // TODAY
      // =================================================

      const today =
        dateOnly(
          new Date()
        );

      // =================================================
      // DEFAULT DATE LOGIC
      //
      // If BOTH dates are empty/null/"null":
      //
      //     From = last 31 days
      //     To   = today
      //
      // If only From is empty:
      //
      //     From = today - 31 days
      //
      // If only To is empty:
      //
      //     To = today
      //
      // =================================================

      if (!startDate) {
        startDate =
          addDays(
            today,
            -DEFAULT_LOOKBACK_DAYS
          );
      }

      if (!endDate) {
        endDate =
          new Date(today);
      }

      // =================================================
      // KEEP REQUEST INSIDE FINANCIAL YEAR
      // =================================================

      if (
        startDate < fyStart
      ) {
        startDate =
          new Date(fyStart);
      }

      // FYEnd is exclusive.
      //
      // Last valid transaction date:
      //
      //     FYEnd - 1 day
      // =================================================

      const lastFYDate =
        addDays(
          fyEnd,
          -1
        );

      if (
        endDate > lastFYDate
      ) {
        endDate =
          new Date(lastFYDate);
      }

      // =================================================
      // VALIDATE DATE RANGE
      // =================================================

      if (
        startDate > endDate
      ) {
        return res.status(400).json({
          success: false,
          message:
            "From Date cannot be greater than To Date",
        });
      }

      console.log(
        "FINAL DAY BOOK DATE RANGE:",
        formatDate(startDate),
        "TO",
        formatDate(endDate)
      );

      // =================================================
      // END DATE EXCLUSIVE
      //
      // If ToDate = 2026-09-04
      //
      // SQL uses:
      //
      //     < 2026-09-05
      //
      // This includes the complete ToDate.
      // =================================================

      const endExclusive =
        addDays(
          endDate,
          1
        );

      // =================================================
      // OPENING BALANCE
      //
      // IMPORTANT FIX
      //
      // Master Opening Balance comes from:
      //
      //     dbo.tbl_HeadOpening
      //
      // Current FY only.
      //
      // RP:
      //
      //     RP = 1 => positive
      //     RP = 0 => negative
      //
      // Then:
      //
      // Opening Balance =
      //
      //     Master Opening
      //     + Previous Receipts
      //     - Previous Payments
      //
      // =================================================

      const openingRequest =
        pool.request();

      openingRequest.input(
        "FYCode",
        sql.Int,
        fyCode
      );

      openingRequest.input(
        "FYStart",
        sql.DateTime,
        fyStart
      );

      openingRequest.input(
        "FYEnd",
        sql.DateTime,
        fyEnd
      );

      openingRequest.input(
        "StartDate",
        sql.DateTime,
        startDate
      );

      const openingResult =
        await openingRequest.query(`
          SELECT

            /* ============================================
               MASTER OPENING BALANCE
               ============================================ */

            ISNULL(
              (
                SELECT
                  SUM(
                    CASE
                      WHEN ISNULL(HO.RP, 1) = 1
                        THEN ISNULL(
                          HO.OpeningBalance,
                          0
                        )
                      ELSE
                        -ISNULL(
                          HO.OpeningBalance,
                          0
                        )
                    END
                  )
                FROM dbo.tbl_HeadOpening HO
                WHERE
                  HO.fycode = @FYCode
              ),
              0
            ) AS MasterOpeningBalance,

            /* ============================================
               PREVIOUS RECEIPTS
               ============================================ */

            ISNULL(
              (
                SELECT
                  SUM(
                    ISNULL(
                      r.ReceivedAmount,
                      0
                    )
                  )
                FROM dbo.tbl_Receipt r
                WHERE
                  r.ReceiptDate >= @FYStart
                  AND r.ReceiptDate < @FYEnd
                  AND r.ReceiptDate < @StartDate
              ),
              0
            ) AS TotalReceipt,

            /* ============================================
               PREVIOUS PAYMENTS
               ============================================ */

            ISNULL(
              (
                SELECT
                  SUM(
                    ISNULL(
                      p.PaymentAmount,
                      0
                    )
                  )
                FROM dbo.tbl_Payment p
                WHERE
                  p.PaymentDate >= @FYStart
                  AND p.PaymentDate < @FYEnd
                  AND p.PaymentDate < @StartDate
              ),
              0
            ) AS TotalPayment
        `);

      const openingRow =
        openingResult.recordset[0] ||
        {};

      const masterOpeningBalance =
        safeNumber(
          openingRow.MasterOpeningBalance
        );

      const openingReceipt =
        safeNumber(
          openingRow.TotalReceipt
        );

      const openingPayment =
        safeNumber(
          openingRow.TotalPayment
        );

      // =================================================
      // FINAL OPENING BALANCE
      // =================================================

      let openingBalance =
        masterOpeningBalance +
        openingReceipt -
        openingPayment;

      console.log(
        "================================="
      );

      console.log(
        "OPENING BALANCE CALCULATION"
      );

      console.log(
        "FY CODE:",
        fyCode
      );

      console.log(
        "MASTER OPENING BALANCE:",
        masterOpeningBalance
      );

      console.log(
        "PREVIOUS RECEIPTS:",
        openingReceipt
      );

      console.log(
        "PREVIOUS PAYMENTS:",
        openingPayment
      );

      console.log(
        "FINAL OPENING BALANCE:",
        openingBalance
      );

      console.log(
        "================================="
      );

      // =================================================
      // DAILY RECEIPTS
      // =================================================

      const receiptRequest =
        pool.request();

      receiptRequest.input(
        "FYStart",
        sql.DateTime,
        fyStart
      );

      receiptRequest.input(
        "FYEnd",
        sql.DateTime,
        fyEnd
      );

      receiptRequest.input(
        "StartDate",
        sql.DateTime,
        startDate
      );

      receiptRequest.input(
        "EndExclusive",
        sql.DateTime,
        endExclusive
      );

      const receiptResult =
        await receiptRequest.query(`
          SELECT

            CAST(
              r.ReceiptDate AS DATE
            ) AS TransactionDate,

            ISNULL(
              SUM(
                ISNULL(
                  r.ReceivedAmount,
                  0
                )
              ),
              0
            ) AS ReceiptAmount,

            COUNT(*) AS ReceiptCount

          FROM dbo.tbl_Receipt r

          WHERE
            r.ReceiptDate >= @FYStart
            AND r.ReceiptDate < @FYEnd

            AND r.ReceiptDate >= @StartDate
            AND r.ReceiptDate < @EndExclusive

          GROUP BY
            CAST(
              r.ReceiptDate AS DATE
            )

          ORDER BY
            TransactionDate
        `);

      // =================================================
      // DAILY PAYMENTS
      // =================================================

      const paymentRequest =
        pool.request();

      paymentRequest.input(
        "FYStart",
        sql.DateTime,
        fyStart
      );

      paymentRequest.input(
        "FYEnd",
        sql.DateTime,
        fyEnd
      );

      paymentRequest.input(
        "StartDate",
        sql.DateTime,
        startDate
      );

      paymentRequest.input(
        "EndExclusive",
        sql.DateTime,
        endExclusive
      );

      const paymentResult =
        await paymentRequest.query(`
          SELECT

            CAST(
              p.PaymentDate AS DATE
            ) AS TransactionDate,

            ISNULL(
              SUM(
                ISNULL(
                  p.PaymentAmount,
                  0
                )
              ),
              0
            ) AS PaymentAmount,

            COUNT(*) AS PaymentCount

          FROM dbo.tbl_Payment p

          WHERE
            p.PaymentDate >= @FYStart
            AND p.PaymentDate < @FYEnd

            AND p.PaymentDate >= @StartDate
            AND p.PaymentDate < @EndExclusive

          GROUP BY
            CAST(
              p.PaymentDate AS DATE
            )

          ORDER BY
            TransactionDate
        `);

      // =================================================
      // COMBINE DAILY DATA
      // =================================================

      const dailyMap =
        new Map();

      // =================================================
      // RECEIPTS
      // =================================================

      for (
        const row of
          receiptResult.recordset
      ) {
        const transactionDate =
          new Date(
            row.TransactionDate
          );

        const key =
          formatDate(
            transactionDate
          );

        dailyMap.set(
          key,
          {
            date: key,

            receiptAmount:
              safeNumber(
                row.ReceiptAmount
              ),

            paymentAmount: 0,

            receiptCount:
              Number(
                row.ReceiptCount || 0
              ),

            paymentCount: 0,
          }
        );
      }

      // =================================================
      // PAYMENTS
      // =================================================

      for (
        const row of
          paymentResult.recordset
      ) {
        const transactionDate =
          new Date(
            row.TransactionDate
          );

        const key =
          formatDate(
            transactionDate
          );

        if (
          !dailyMap.has(key)
        ) {
          dailyMap.set(
            key,
            {
              date: key,

              receiptAmount: 0,

              paymentAmount:
                safeNumber(
                  row.PaymentAmount
                ),

              receiptCount: 0,

              paymentCount:
                Number(
                  row.PaymentCount || 0
                ),
            }
          );
        } else {
          const existing =
            dailyMap.get(key);

          existing.paymentAmount =
            safeNumber(
              row.PaymentAmount
            );

          existing.paymentCount =
            Number(
              row.PaymentCount || 0
            );
        }
      }

      // =================================================
      // SORT DATES
      // =================================================

      const sortedDates =
        Array.from(
          dailyMap.keys()
        ).sort();

      // =================================================
      // CREATE DAILY DATA
      // =================================================

      const data = [];

      let runningBalance =
        openingBalance;

      let totalReceipt = 0;

      let totalPayment = 0;

      let totalReceiptCount = 0;

      let totalPaymentCount = 0;

      // =================================================
      // DAILY ROWS
      // =================================================

      for (
        const date of sortedDates
      ) {
        const row =
          dailyMap.get(date);

        const dayOpening =
          runningBalance;

        const receiptAmount =
          safeNumber(
            row.receiptAmount
          );

        const paymentAmount =
          safeNumber(
            row.paymentAmount
          );

        // =================================================
        // CLOSING BALANCE
        //
        // Opening
        // + Receipt
        // - Payment
        // =================================================

        const closingBalance =
          dayOpening +
          receiptAmount -
          paymentAmount;

        data.push({
          date: row.date,

          openingBalance:
            Number(
              dayOpening.toFixed(2)
            ),

          receiptAmount:
            Number(
              receiptAmount.toFixed(2)
            ),

          paymentAmount:
            Number(
              paymentAmount.toFixed(2)
            ),

          closingBalance:
            Number(
              closingBalance.toFixed(2)
            ),

          receiptCount:
            row.receiptCount,

          paymentCount:
            row.paymentCount,

          transactionCount:
            row.receiptCount +
            row.paymentCount,
        });

        // =================================================
        // NEXT DAY OPENING =
        // PREVIOUS DAY CLOSING
        // =================================================

        runningBalance =
          closingBalance;

        totalReceipt +=
          receiptAmount;

        totalPayment +=
          paymentAmount;

        totalReceiptCount +=
          row.receiptCount;

        totalPaymentCount +=
          row.paymentCount;
      }

      // =================================================
      // FINAL CLOSING
      // =================================================

      const finalClosingBalance =
        runningBalance;

      // =================================================
      // RESPONSE
      // =================================================

      return res.json({
        success: true,

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
            financialYear.LSDate ||
            null,
        },

        period: {
          fromDate:
            formatDate(
              startDate
            ),

          toDate:
            formatDate(
              endDate
            ),
        },

        openingBalanceDetails: {
          masterOpeningBalance:
            Number(
              masterOpeningBalance.toFixed(
                2
              )
            ),

          previousReceipt:
            Number(
              openingReceipt.toFixed(
                2
              )
            ),

          previousPayment:
            Number(
              openingPayment.toFixed(
                2
              )
            ),

          finalOpeningBalance:
            Number(
              openingBalance.toFixed(
                2
              )
            ),
        },

        summary: {
          openingBalance:
            Number(
              openingBalance.toFixed(
                2
              )
            ),

          totalReceipt:
            Number(
              totalReceipt.toFixed(
                2
              )
            ),

          totalPayment:
            Number(
              totalPayment.toFixed(
                2
              )
            ),

          closingBalance:
            Number(
              finalClosingBalance.toFixed(
                2
              )
            ),

          netMovement:
            Number(
              (
                totalReceipt -
                totalPayment
              ).toFixed(2)
            ),

          receiptCount:
            totalReceiptCount,

          paymentCount:
            totalPaymentCount,

          transactionCount:
            totalReceiptCount +
            totalPaymentCount,
        },

        data,
      });
    } catch (error) {
      console.error(
        "================================="
      );

      console.error(
        "DAY BOOK ERROR:"
      );

      console.error(
        error
      );

      console.error(
        "================================="
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to generate Day Book",

        error:
          error.message,
      });
    }
  }
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;