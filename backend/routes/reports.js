const express = require("express");

const router = express.Router();

const {
  getPool,
  sql,
} = require("../config/db");

// =====================================================
// AUTHENTICATE TOKEN
// =====================================================

const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "ipltemple_secret_2026";

function authenticateToken(req, res, next) {
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

    const decoded =
      jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    console.error(
      "REPORT TOKEN ERROR:",
      error
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

// =====================================================
// REPORT ROUTE
//
// Type:
// payment
// receipt
// all
//
// View:
// transaction
// head
//
// Period:
// date
// month
// quarter
// halfyear
// year
// custom
// =====================================================

router.get(
  "/",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        type = "all",
        view = "transaction",
        period = "date",

        date,
        month,
        year,
        quarter,
        halfyear,

        fromDate,
        toDate,
      } = req.query;

      const reportType =
        String(type)
          .trim()
          .toLowerCase();

      const reportView =
        String(view)
          .trim()
          .toLowerCase();

      const reportPeriod =
        String(period)
          .trim()
          .toLowerCase();

      console.log(
        "========================================"
      );

      console.log(
        "REPORT REQUEST"
      );

      console.log({
        UserCode: req.user?.UserCode,
        UserName: req.user?.UserName,
        FYCode: req.user?.FYCode,
        FYear: req.user?.FYear,

        type: reportType,
        view: reportView,
        period: reportPeriod,

        date,
        month,
        year,
        quarter,
        halfyear,

        fromDate,
        toDate,
      });

      console.log(
        "========================================"
      );

      // =====================================================
      // VALIDATE TYPE
      // =====================================================

      if (
        ![
          "payment",
          "receipt",
          "all",
        ].includes(reportType)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid report type",
        });
      }

      // =====================================================
      // VALIDATE VIEW
      // =====================================================

      if (
        ![
          "transaction",
          "head",
        ].includes(reportView)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid report view",
        });
      }

      // =====================================================
      // VALIDATE PERIOD
      // =====================================================

      if (
        ![
          "date",
          "month",
          "quarter",
          "halfyear",
          "year",
          "custom",
        ].includes(reportPeriod)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid report period",
        });
      }

      // =====================================================
      // FINANCIAL YEAR FROM JWT
      // =====================================================

      if (
        req.user?.FYCode === undefined ||
        req.user?.FYCode === null
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Financial Year is not available in login session",
        });
      }

      const fyCode =
        Number(req.user.FYCode);

      if (!Number.isInteger(fyCode)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid Financial Year in login session",
        });
      }

      // =====================================================
      // DATABASE
      // =====================================================

      const pool =
        await getPool();

      // =====================================================
      // GET SELECTED FINANCIAL YEAR
      // =====================================================

      const fyResult =
        await pool
          .request()
          .input(
            "FYCode",
            sql.Int,
            fyCode
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
        fyResult.recordset.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Selected Financial Year does not exist",
        });
      }

      const financialYear =
        fyResult.recordset[0];

      const fyStart =
        new Date(
          financialYear.FYStart
        );

      const fyEnd =
        new Date(
          financialYear.FYEnd
        );

      // =====================================================
      // REQUEST
      // =====================================================

      const request =
        pool.request();

      request.input(
        "FYStart",
        sql.DateTime,
        fyStart
      );

      request.input(
        "FYEnd",
        sql.DateTime,
        fyEnd
      );

      // =====================================================
      // BASE FINANCIAL YEAR FILTER
      //
      // We use:
      //
      // >= FYStart
      // < day after FYEnd
      //
      // This safely includes the complete FYEnd date.
      // =====================================================

      let paymentWhere = `
        p.PaymentDate >= @FYStart
        AND p.PaymentDate < DATEADD(day, 1, @FYEnd)
      `;

      let receiptWhere = `
        r.ReceiptDate >= @FYStart
        AND r.ReceiptDate < DATEADD(day, 1, @FYEnd)
      `;

      // =====================================================
      // DATE WISE
      // =====================================================

      if (
        reportPeriod === "date"
      ) {
        if (!date) {
          return res.status(400).json({
            success: false,
            message: "Date is required",
          });
        }

        paymentWhere += `
          AND CAST(p.PaymentDate AS DATE)
              = @ReportDate
        `;

        receiptWhere += `
          AND CAST(r.ReceiptDate AS DATE)
              = @ReportDate
        `;

        request.input(
          "ReportDate",
          sql.Date,
          date
        );
      }

      // =====================================================
      // MONTH WISE
      //
      // Month is restricted by FY dates automatically.
      // =====================================================

      else if (
        reportPeriod === "month"
      ) {
        if (!month) {
          return res.status(400).json({
            success: false,
            message: "Month is required",
          });
        }

        const monthValue =
          Number(month);

        if (
          !Number.isInteger(
            monthValue
          ) ||
          monthValue < 1 ||
          monthValue > 12
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid month",
          });
        }

        paymentWhere += `
          AND MONTH(p.PaymentDate)
              = @ReportMonth
        `;

        receiptWhere += `
          AND MONTH(r.ReceiptDate)
              = @ReportMonth
        `;

        request.input(
          "ReportMonth",
          sql.Int,
          monthValue
        );
      }

      // =====================================================
      // QUARTER WISE
      //
      // Financial Year quarters:
      //
      // Q1 = Apr-Jun
      // Q2 = Jul-Sep
      // Q3 = Oct-Dec
      // Q4 = Jan-Mar
      //
      // We calculate this from FYStart.
      // =====================================================

      else if (
        reportPeriod === "quarter"
      ) {
        if (!quarter) {
          return res.status(400).json({
            success: false,
            message: "Quarter is required",
          });
        }

        const quarterValue =
          Number(quarter);

        if (
          ![
            1,
            2,
            3,
            4,
          ].includes(
            quarterValue
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid quarter",
          });
        }

        const quarterStart =
          new Date(fyStart);

        quarterStart.setMonth(
          quarterStart.getMonth() +
            (quarterValue - 1) * 3
        );

        const quarterEnd =
          new Date(
            quarterStart
          );

        quarterEnd.setMonth(
          quarterEnd.getMonth() + 3
        );

        paymentWhere += `
          AND p.PaymentDate >= @QuarterStart
          AND p.PaymentDate < @QuarterEnd
        `;

        receiptWhere += `
          AND r.ReceiptDate >= @QuarterStart
          AND r.ReceiptDate < @QuarterEnd
        `;

        request.input(
          "QuarterStart",
          sql.DateTime,
          quarterStart
        );

        request.input(
          "QuarterEnd",
          sql.DateTime,
          quarterEnd
        );
      }

      // =====================================================
      // HALF YEAR WISE
      //
      // Financial Year halves:
      //
      // H1 = FYStart to +6 months
      // H2 = +6 months to FYEnd
      // =====================================================

      else if (
        reportPeriod === "halfyear"
      ) {
        if (!halfyear) {
          return res.status(400).json({
            success: false,
            message:
              "Half year is required",
          });
        }

        const halfValue =
          Number(halfyear);

        if (
          ![
            1,
            2,
          ].includes(
            halfValue
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid half year",
          });
        }

        const halfStart =
          new Date(fyStart);

        halfStart.setMonth(
          halfStart.getMonth() +
            (halfValue === 1
              ? 0
              : 6)
        );

        const halfEnd =
          new Date(
            halfStart
          );

        if (halfValue === 1) {
          halfEnd.setMonth(
            halfEnd.getMonth() + 6
          );
        } else {
          halfEnd.setTime(
            fyEnd.getTime()
          );
          halfEnd.setDate(
            halfEnd.getDate() + 1
          );
        }

        paymentWhere += `
          AND p.PaymentDate >= @HalfStart
          AND p.PaymentDate < @HalfEnd
        `;

        receiptWhere += `
          AND r.ReceiptDate >= @HalfStart
          AND r.ReceiptDate < @HalfEnd
        `;

        request.input(
          "HalfStart",
          sql.DateTime,
          halfStart
        );

        request.input(
          "HalfEnd",
          sql.DateTime,
          halfEnd
        );
      }

      // =====================================================
      // YEAR WISE
      //
      // "Year" means the complete selected Financial Year.
      //
      // No calendar year parameter is needed.
      // =====================================================

      else if (
        reportPeriod === "year"
      ) {
        // Base FY condition already gives
        // the complete financial year.
      }

      // =====================================================
      // CUSTOM DATE
      // =====================================================

      else if (
        reportPeriod === "custom"
      ) {
        if (
          !fromDate ||
          !toDate
        ) {
          return res.status(400).json({
            success: false,
            message:
              "From Date and To Date are required",
          });
        }

        const from =
          new Date(fromDate);

        const to =
          new Date(toDate);

        if (
          Number.isNaN(
            from.getTime()
          ) ||
          Number.isNaN(
            to.getTime()
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid date range",
          });
        }

        if (from > to) {
          return res.status(400).json({
            success: false,
            message:
              "From Date cannot be greater than To Date",
          });
        }

        // ---------------------------------------------
        // CUSTOM RANGE MUST BE INSIDE SELECTED FY
        // ---------------------------------------------

        const fyStartDate =
          new Date(fyStart);

        const fyEndDate =
          new Date(fyEnd);

        fyStartDate.setHours(
          0,
          0,
          0,
          0
        );

        fyEndDate.setHours(
          23,
          59,
          59,
          999
        );

        from.setHours(
          0,
          0,
          0,
          0
        );

        to.setHours(
          23,
          59,
          59,
          999
        );

        if (
          from < fyStartDate ||
          to > fyEndDate
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Custom date range must be within Financial Year ${financialYear.FYear}`,
          });
        }

        paymentWhere += `
          AND p.PaymentDate >= @FromDate
          AND p.PaymentDate < DATEADD(day, 1, @ToDate)
        `;

        receiptWhere += `
          AND r.ReceiptDate >= @FromDate
          AND r.ReceiptDate < DATEADD(day, 1, @ToDate)
        `;

        request.input(
          "FromDate",
          sql.Date,
          fromDate
        );

        request.input(
          "ToDate",
          sql.Date,
          toDate
        );
      }

      // =====================================================
      // PAYMENT DATA
      // =====================================================

      let paymentData = [];

      if (
        reportType === "payment" ||
        reportType === "all"
      ) {
        const paymentResult =
          await request.query(`
            SELECT

              p.PaymentCode
                AS TransactionCode,

              p.PaymentNo
                AS TransactionNo,

              p.PaymentDate
                AS TransactionDate,

              'Payment'
                AS TransactionType,

              p.HeadCode,

              h.HeadName,

              p.[Paid By]
                AS PersonName,

              p.Notes
                AS Notes,

              p.PaymentAmount
                AS Amount

            FROM dbo.tbl_Payment p

            LEFT JOIN dbo.tbl_Head h
              ON p.HeadCode =
                 h.HeadCode

            WHERE
              ${paymentWhere}
          `);

        paymentData =
          paymentResult.recordset || [];
      }

      // =====================================================
      // RECEIPT DATA
      // =====================================================

      let receiptData = [];

      if (
        reportType === "receipt" ||
        reportType === "all"
      ) {
        const receiptResult =
          await request.query(`
            SELECT

              r.ReceiptCode
                AS TransactionCode,

              r.ReceiptNo
                AS TransactionNo,

              r.ReceiptDate
                AS TransactionDate,

              'Receipt'
                AS TransactionType,

              r.HeadCode,

              h.HeadName,

              r.ReceivedFrom
                AS PersonName,

              NULL
                AS Notes,

              r.ReceivedAmount
                AS Amount

            FROM dbo.tbl_Receipt r

            LEFT JOIN dbo.tbl_Head h
              ON r.HeadCode =
                 h.HeadCode

            WHERE
              ${receiptWhere}
          `);

        receiptData =
          receiptResult.recordset || [];
      }

      // =====================================================
      // TOTALS
      // =====================================================

      const totalPayment =
        paymentData.reduce(
          (sum, item) =>
            sum +
            Number(
              item.Amount || 0
            ),
          0
        );

      const totalReceipt =
        receiptData.reduce(
          (sum, item) =>
            sum +
            Number(
              item.Amount || 0
            ),
          0
        );

      const balance =
        totalReceipt -
        totalPayment;

      // =====================================================
      // HEAD WISE REPORT
      // =====================================================

      if (
        reportView === "head"
      ) {
        const headMap =
          new Map();

        // ---------------------------------------------
        // PAYMENTS
        // ---------------------------------------------

        paymentData.forEach(
          (item) => {
            const headCode =
              item.HeadCode ?? "";

            const headName =
              item.HeadName ||
              "Unknown Head";

            const key =
              String(headCode);

            if (
              !headMap.has(key)
            ) {
              headMap.set(
                key,
                {
                  HeadCode:
                    headCode,

                  HeadName:
                    headName,

                  TotalReceipt: 0,

                  TotalPayment: 0,

                  Balance: 0,

                  TransactionCount: 0,
                }
              );
            }

            const head =
              headMap.get(key);

            head.TotalPayment +=
              Number(
                item.Amount || 0
              );

            head.TransactionCount++;
          }
        );

        // ---------------------------------------------
        // RECEIPTS
        // ---------------------------------------------

        receiptData.forEach(
          (item) => {
            const headCode =
              item.HeadCode ?? "";

            const headName =
              item.HeadName ||
              "Unknown Head";

            const key =
              String(headCode);

            if (
              !headMap.has(key)
            ) {
              headMap.set(
                key,
                {
                  HeadCode:
                    headCode,

                  HeadName:
                    headName,

                  TotalReceipt: 0,

                  TotalPayment: 0,

                  Balance: 0,

                  TransactionCount: 0,
                }
              );
            }

            const head =
              headMap.get(key);

            head.TotalReceipt +=
              Number(
                item.Amount || 0
              );

            head.TransactionCount++;
          }
        );

        // ---------------------------------------------
        // FINALIZE
        // ---------------------------------------------

        const headWiseData =
          Array.from(
            headMap.values()
          )
            .map(
              (item) => ({
                ...item,

                TotalReceipt:
                  Number(
                    item.TotalReceipt.toFixed(
                      3
                    )
                  ),

                TotalPayment:
                  Number(
                    item.TotalPayment.toFixed(
                      3
                    )
                  ),

                Balance:
                  Number(
                    (
                      item.TotalReceipt -
                      item.TotalPayment
                    ).toFixed(3)
                  ),

                TransactionCount:
                  Number(
                    item.TransactionCount
                  ),
              })
            )
            .sort(
              (a, b) =>
                String(
                  a.HeadName
                ).localeCompare(
                  String(
                    b.HeadName
                  )
                )
            );

        const response = {
          success: true,

          type:
            reportType,

          view:
            "head",

          period:
            reportPeriod,

          financialYear: {
            FYCode:
              financialYear.FYCode,

            FYear:
              financialYear.FYear,

            FYStart:
              financialYear.FYStart,

            FYEnd:
              financialYear.FYEnd,
          },

          count:
            headWiseData.length,

          total:
            Number(
              (
                totalPayment +
                totalReceipt
              ).toFixed(3)
            ),

          summary: {
            totalPayment:
              Number(
                totalPayment.toFixed(
                  3
                )
              ),

            totalReceipt:
              Number(
                totalReceipt.toFixed(
                  3
                )
              ),

            balance:
              Number(
                balance.toFixed(
                  3
                )
              ),

            transactionCount:
              paymentData.length +
              receiptData.length,

            headCount:
              headWiseData.length,
          },

          data:
            headWiseData,
        };

        console.log(
          "HEAD WISE REPORT RESPONSE:"
        );

        console.log(
          JSON.stringify(
            response,
            null,
            2
          )
        );

        return res.json(
          response
        );
      }

      // =====================================================
      // TRANSACTION WISE
      // =====================================================

      const data = [
        ...paymentData,
        ...receiptData,
      ];

      data.sort(
        (a, b) => {
          const dateA =
            new Date(
              a.TransactionDate
            ).getTime();

          const dateB =
            new Date(
              b.TransactionDate
            ).getTime();

          return dateB - dateA;
        }
      );

      // =====================================================
      // TOTAL
      // =====================================================

      let total = 0;

      if (
        reportType === "payment"
      ) {
        total =
          totalPayment;
      } else if (
        reportType === "receipt"
      ) {
        total =
          totalReceipt;
      } else {
        total =
          totalPayment +
          totalReceipt;
      }

      // =====================================================
      // RESPONSE
      // =====================================================

      const response = {
        success: true,

        type:
          reportType,

        view:
          "transaction",

        period:
          reportPeriod,

        financialYear: {
          FYCode:
            financialYear.FYCode,

          FYear:
            financialYear.FYear,

          FYStart:
            financialYear.FYStart,

          FYEnd:
            financialYear.FYEnd,
        },

        count:
          data.length,

        total:
          Number(
            total.toFixed(3)
          ),

        summary: {
          totalPayment:
            Number(
              totalPayment.toFixed(
                3
              )
            ),

          totalReceipt:
            Number(
              totalReceipt.toFixed(
                3
              )
            ),

          balance:
            Number(
              balance.toFixed(
                3
              )
            ),

          transactionCount:
            data.length,

          headCount:
            new Set(
              data.map(
                (item) =>
                  String(
                    item.HeadCode ??
                      ""
                  )
              )
            ).size,
        },

        data,
      };

      console.log(
        "REPORT RESPONSE:"
      );

      console.log(
        JSON.stringify(
          response,
          null,
          2
        )
      );

      return res.json(
        response
      );
    } catch (error) {
      console.error(
        "========================================"
      );

      console.error(
        "REPORT ERROR:"
      );

      console.error(
        error
      );

      console.error(
        "MESSAGE:",
        error.message
      );

      console.error(
        "========================================"
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to generate report",
        error:
          error.message,
      });
    }
  }
);

module.exports = router;