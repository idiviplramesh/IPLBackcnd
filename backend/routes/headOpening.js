const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const {
  sql,
  getPool,
} = require("../config/db");

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "ipltemple_secret_2026";

/* =========================================================
   AUTHENTICATION
========================================================= */

function authenticateToken(
  req,
  res,
  next
) {
  const authHeader =
    req.headers.authorization;

  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {
    return res.status(401).json({
      success: false,
      message:
        "Authentication required",
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
      error
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired token",
    });
  }
}

/* =========================================================
   GET ALL OPENING BALANCES
   ONLY CURRENT LOGIN FINANCIAL YEAR
========================================================= */

router.get(
  "/",
  authenticateToken,
  async (req, res) => {
    try {
      const fyCode =
        Number(req.user?.FYCode);

      if (
        !Number.isInteger(
          fyCode
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Financial Year is not available in login session",
        });
      }

      const pool =
        await getPool();

      const result =
        await pool
          .request()
          .input(
            "FYCode",
            sql.Int,
            fyCode
          )
          .query(`
            SELECT
              HO.HeadOpeningCode,
              HO.CompanyCode,
              HO.Headcode,
              HO.OpeningBalance,
              HO.RP,
              HO.fycode,

              C.CompanyName,

              H.HeadName,

              F.FYear

            FROM dbo.tbl_HeadOpening HO

            LEFT JOIN dbo.tbl_Company C
              ON C.CompanyCode =
                 HO.CompanyCode

            LEFT JOIN dbo.tbl_Head H
              ON H.HeadCode =
                 HO.Headcode

            LEFT JOIN dbo.tbl_FYear F
              ON F.FYCode =
                 HO.fycode

            WHERE HO.fycode =
                  @FYCode

            ORDER BY
              HO.CompanyCode,
              HO.Headcode
          `);

      return res.json(
        result.recordset
      );

    } catch (error) {
      console.error(
        "GET OPENING BALANCES ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load opening balances",
        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   GET SINGLE OPENING BALANCE
========================================================= */

router.get(
  "/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const id =
        Number(req.params.id);

      const fyCode =
        Number(req.user?.FYCode);

      if (
        !Number.isInteger(id)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid OpeningBalanceCode",
        });
      }

      if (
        !Number.isInteger(fyCode)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Financial Year is not available in login session",
        });
      }

      const pool =
        await getPool();

      const result =
        await pool
          .request()
          .input(
            "HeadOpeningCode",
            sql.Int,
            id
          )
          .input(
            "FYCode",
            sql.Int,
            fyCode
          )
          .query(`
            SELECT
              HO.HeadOpeningCode,
              HO.CompanyCode,
              HO.Headcode,
              HO.OpeningBalance,
              HO.RP,
              HO.fycode,

              C.CompanyName,
              H.HeadName,
              F.FYear

            FROM dbo.tbl_HeadOpening HO

            LEFT JOIN dbo.tbl_Company C
              ON C.CompanyCode =
                 HO.CompanyCode

            LEFT JOIN dbo.tbl_Head H
              ON H.HeadCode =
                 HO.Headcode

            LEFT JOIN dbo.tbl_FYear F
              ON F.FYCode =
                 HO.fycode

            WHERE
              HO.HeadOpeningCode =
                @HeadOpeningCode

              AND HO.fycode =
                @FYCode
          `);

      if (
        result.recordset.length ===
        0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Opening balance not found",
        });
      }

      return res.json(
        result.recordset[0]
      );

    } catch (error) {
      console.error(
        "GET OPENING BALANCE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load opening balance",
        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   CREATE OPENING BALANCE
========================================================= */

router.post(
  "/",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        CompanyCode,
        Headcode,
        OpeningBalance,
        RP,
      } = req.body;

      // -----------------------------------------------------
      // FY MUST COME FROM LOGIN TOKEN
      // -----------------------------------------------------

      const fyCode =
        Number(req.user?.FYCode);

      if (
        !Number.isInteger(
          fyCode
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Financial Year is not available in login session",
        });
      }

      // -----------------------------------------------------
      // VALIDATION
      // -----------------------------------------------------

      const companyCode =
        Number(CompanyCode);

      const headCode =
        Number(Headcode);

      const amount =
        Number(OpeningBalance);

      if (
        !Number.isInteger(
          companyCode
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Company is required",
        });
      }

      if (
        !Number.isInteger(
          headCode
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Head is required",
        });
      }

      if (
        OpeningBalance ===
          undefined ||
        OpeningBalance ===
          null ||
        OpeningBalance === ""
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Opening balance is required",
        });
      }

      if (
        !Number.isFinite(
          amount
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Opening balance must be a valid number",
        });
      }

      if (amount < 0) {
        return res.status(400).json({
          success: false,
          message:
            "Opening balance cannot be negative",
        });
      }

      const pool =
        await getPool();

      // -----------------------------------------------------
      // CHECK COMPANY
      // -----------------------------------------------------

      const company =
        await pool
          .request()
          .input(
            "CompanyCode",
            sql.Int,
            companyCode
          )
          .query(`
            SELECT CompanyCode
            FROM dbo.tbl_Company
            WHERE CompanyCode =
                  @CompanyCode
          `);

      if (
        company.recordset.length ===
        0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid Company",
        });
      }

      // -----------------------------------------------------
      // CHECK HEAD
      // -----------------------------------------------------

      const head =
        await pool
          .request()
          .input(
            "HeadCode",
            sql.Int,
            headCode
          )
          .query(`
            SELECT HeadCode
            FROM dbo.tbl_Head
            WHERE HeadCode =
                  @HeadCode
          `);

      if (
        head.recordset.length ===
        0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid Head",
        });
      }

      // -----------------------------------------------------
      // CHECK FINANCIAL YEAR
      // -----------------------------------------------------

      const financialYear =
        await pool
          .request()
          .input(
            "FYCode",
            sql.Int,
            fyCode
          )
          .query(`
            SELECT
              FYCode,
              FYear
            FROM dbo.tbl_FYear
            WHERE FYCode =
                  @FYCode
          `);

      if (
        financialYear.recordset.length ===
        0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid Financial Year",
        });
      }

      // -----------------------------------------------------
      // CHECK DUPLICATE
      //
      // Company + FY + Head is unique.
      // -----------------------------------------------------

      const duplicate =
        await pool
          .request()
          .input(
            "CompanyCode",
            sql.Int,
            companyCode
          )
          .input(
            "Headcode",
            sql.Int,
            headCode
          )
          .input(
            "FYCode",
            sql.Int,
            fyCode
          )
          .query(`
            SELECT
              HeadOpeningCode
            FROM dbo.tbl_HeadOpening

            WHERE CompanyCode =
                  @CompanyCode

              AND Headcode =
                  @Headcode

              AND fycode =
                  @FYCode
          `);

      if (
        duplicate.recordset.length >
        0
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Opening balance already exists for this Company, Financial Year and Head",
        });
      }

      // -----------------------------------------------------
      // NEXT CODE
      // -----------------------------------------------------

      const codeResult =
        await pool
          .request()
          .query(`
            SELECT
              ISNULL(
                MAX(HeadOpeningCode),
                0
              ) + 1 AS NextCode

            FROM dbo.tbl_HeadOpening
          `);

      const nextCode =
        codeResult.recordset[0]
          .NextCode;

      // -----------------------------------------------------
      // INSERT
      // -----------------------------------------------------

      await pool
        .request()

        .input(
          "HeadOpeningCode",
          sql.Int,
          nextCode
        )

        .input(
          "CompanyCode",
          sql.Int,
          companyCode
        )

        .input(
          "Headcode",
          sql.Int,
          headCode
        )

        .input(
          "OpeningBalance",
          sql.Numeric(12, 2),
          amount
        )

        .input(
          "RP",
          sql.Bit,
          RP ? 1 : 0
        )

        .input(
          "FYCode",
          sql.Int,
          fyCode
        )

        .query(`
          INSERT INTO dbo.tbl_HeadOpening
          (
            HeadOpeningCode,
            CompanyCode,
            Headcode,
            OpeningBalance,
            RP,
            fycode
          )

          VALUES
          (
            @HeadOpeningCode,
            @CompanyCode,
            @Headcode,
            @OpeningBalance,
            @RP,
            @FYCode
          )
        `);

      return res.status(201).json({
        success: true,
        message:
          "Opening balance saved successfully",
        HeadOpeningCode:
          nextCode,
      });

    } catch (error) {
      console.error(
        "CREATE OPENING BALANCE ERROR:",
        error
      );

      if (
        error.number === 2627 ||
        error.number === 2601
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Opening balance already exists for this Company, Financial Year and Head",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to save opening balance",
        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   UPDATE OPENING BALANCE
========================================================= */

router.put(
  "/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const id =
        Number(req.params.id);

      const {
        CompanyCode,
        Headcode,
        OpeningBalance,
        RP,
      } = req.body;

      const fyCode =
        Number(req.user?.FYCode);

      if (
        !Number.isInteger(id)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid OpeningBalanceCode",
        });
      }

      if (
        !Number.isInteger(
          fyCode
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Financial Year is not available in login session",
        });
      }

      const companyCode =
        Number(CompanyCode);

      const headCode =
        Number(Headcode);

      const amount =
        Number(OpeningBalance);

      if (
        !Number.isInteger(
          companyCode
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Company is required",
        });
      }

      if (
        !Number.isInteger(
          headCode
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Head is required",
        });
      }

      if (
        !Number.isFinite(
          amount
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Opening balance must be a valid number",
        });
      }

      if (amount < 0) {
        return res.status(400).json({
          success: false,
          message:
            "Opening balance cannot be negative",
        });
      }

      const pool =
        await getPool();

      // -----------------------------------------------------
      // CHECK EXISTING RECORD
      // -----------------------------------------------------

      const existing =
        await pool
          .request()
          .input(
            "HeadOpeningCode",
            sql.Int,
            id
          )
          .input(
            "FYCode",
            sql.Int,
            fyCode
          )
          .query(`
            SELECT
              HeadOpeningCode
            FROM dbo.tbl_HeadOpening

            WHERE HeadOpeningCode =
                  @HeadOpeningCode

              AND fycode =
                  @FYCode
          `);

      if (
        existing.recordset.length ===
        0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Opening balance not found",
        });
      }

      // -----------------------------------------------------
      // CHECK DUPLICATE
      // -----------------------------------------------------

      const duplicate =
        await pool
          .request()
          .input(
            "HeadOpeningCode",
            sql.Int,
            id
          )
          .input(
            "CompanyCode",
            sql.Int,
            companyCode
          )
          .input(
            "Headcode",
            sql.Int,
            headCode
          )
          .input(
            "FYCode",
            sql.Int,
            fyCode
          )
          .query(`
            SELECT
              HeadOpeningCode

            FROM dbo.tbl_HeadOpening

            WHERE CompanyCode =
                  @CompanyCode

              AND Headcode =
                  @Headcode

              AND fycode =
                  @FYCode

              AND HeadOpeningCode <>
                  @HeadOpeningCode
          `);

      if (
        duplicate.recordset.length >
        0
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Another opening balance already exists for this Company, Financial Year and Head",
        });
      }

      // -----------------------------------------------------
      // UPDATE
      // -----------------------------------------------------

      await pool
        .request()

        .input(
          "HeadOpeningCode",
          sql.Int,
          id
        )

        .input(
          "CompanyCode",
          sql.Int,
          companyCode
        )

        .input(
          "Headcode",
          sql.Int,
          headCode
        )

        .input(
          "OpeningBalance",
          sql.Numeric(12, 2),
          amount
        )

        .input(
          "RP",
          sql.Bit,
          RP ? 1 : 0
        )

        .input(
          "FYCode",
          sql.Int,
          fyCode
        )

        .query(`
          UPDATE dbo.tbl_HeadOpening

          SET
            CompanyCode =
              @CompanyCode,

            Headcode =
              @Headcode,

            OpeningBalance =
              @OpeningBalance,

            RP =
              @RP

          WHERE HeadOpeningCode =
                @HeadOpeningCode

            AND fycode =
                @FYCode
        `);

      return res.json({
        success: true,
        message:
          "Opening balance updated successfully",
      });

    } catch (error) {
      console.error(
        "UPDATE OPENING BALANCE ERROR:",
        error
      );

      if (
        error.number === 2627 ||
        error.number === 2601
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Another opening balance already exists for this Company, Financial Year and Head",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to update opening balance",
        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   DELETE OPENING BALANCE
========================================================= */

router.delete(
  "/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const id =
        Number(req.params.id);

      const fyCode =
        Number(req.user?.FYCode);

      if (
        !Number.isInteger(id)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid OpeningBalanceCode",
        });
      }

      if (
        !Number.isInteger(
          fyCode
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Financial Year is not available in login session",
        });
      }

      const pool =
        await getPool();

      const result =
        await pool
          .request()
          .input(
            "HeadOpeningCode",
            sql.Int,
            id
          )
          .input(
            "FYCode",
            sql.Int,
            fyCode
          )
          .query(`
            DELETE FROM dbo.tbl_HeadOpening

            WHERE HeadOpeningCode =
                  @HeadOpeningCode

              AND fycode =
                  @FYCode
          `);

      if (
        result.rowsAffected[0] === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Opening balance not found",
        });
      }

      return res.json({
        success: true,
        message:
          "Opening balance deleted successfully",
      });

    } catch (error) {
      console.error(
        "DELETE OPENING BALANCE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete opening balance",
        error:
          error.message,
      });
    }
  }
);

module.exports = router;