const express = require("express");
const { getPool, sql } = require("../config/db");

const router = express.Router();

// =====================================================
// DEFAULT AUDIT VALUES
// Change these later if you have logged-in user/node
// =====================================================

const DEFAULT_C_USER = 1;
const DEFAULT_C_NODE = 1;

// =====================================================
// GET ALL BANKS
// GET /api/banks
// =====================================================

router.get("/", async (req, res) => {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT
        BankCode,
        BankName,
        BranchName,
        IFSCCode,
        Status,
        C_Date,
        C_User,
        C_Node,
        E_Date,
        E_User,
        E_Node
      FROM dbo.tbl_Bank
      ORDER BY BankName
    `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error("GET BANKS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load banks",
      error: error.message,
    });
  }
});

// =====================================================
// GET BANK BY CODE
// GET /api/banks/:id
// =====================================================

router.get("/:id", async (req, res) => {
  try {
    const bankCode = Number(req.params.id);

    if (!Number.isInteger(bankCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Bank Code",
      });
    }

    const pool = await getPool();

    const result = await pool
      .request()
      .input("BankCode", sql.Int, bankCode)
      .query(`
        SELECT
          BankCode,
          BankName,
          BranchName,
          IFSCCode,
          Status,
          C_Date,
          C_User,
          C_Node,
          E_Date,
          E_User,
          E_Node
        FROM dbo.tbl_Bank
        WHERE BankCode = @BankCode
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Bank not found",
      });
    }

    res.json({
      success: true,
      data: result.recordset[0],
    });
  } catch (error) {
    console.error("GET BANK ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load bank",
      error: error.message,
    });
  }
});

// =====================================================
// CREATE BANK
// POST /api/banks
// =====================================================

router.post("/", async (req, res) => {
  try {
    const {
      BankName,
      BranchName,
      IFSCCode,
    } = req.body;

    // -----------------------------
    // Validation
    // -----------------------------

    if (!BankName || !BankName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Bank name is required",
      });
    }

    const pool = await getPool();

    // -----------------------------
    // Check duplicate Bank Name
    // -----------------------------

    const duplicate = await pool
      .request()
      .input(
        "BankName",
        sql.VarChar(50),
        BankName.trim()
      )
      .query(`
        SELECT TOP 1
          BankCode
        FROM dbo.tbl_Bank
        WHERE BankName = @BankName
      `);

    if (duplicate.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Bank already exists",
      });
    }

    // -----------------------------
    // Generate next BankCode
    // -----------------------------

    const codeResult = await pool.request().query(`
      SELECT
        ISNULL(MAX(BankCode), 0) + 1 AS NextBankCode
      FROM dbo.tbl_Bank
    `);

    const nextBankCode =
      codeResult.recordset[0].NextBankCode;

    // -----------------------------
    // Insert
    // -----------------------------

    const result = await pool
      .request()
      .input(
        "BankCode",
        sql.Int,
        nextBankCode
      )
      .input(
        "BankName",
        sql.VarChar(50),
        BankName.trim()
      )
      .input(
        "BranchName",
        sql.NVarChar(50),
        BranchName?.trim() || ""
      )
      .input(
        "IFSCCode",
        sql.NVarChar(50),
        IFSCCode?.trim() || ""
      )
      .input(
        "C_User",
        sql.Int,
        DEFAULT_C_USER
      )
      .input(
        "C_Node",
        sql.Int,
        DEFAULT_C_NODE
      )
      .query(`
        INSERT INTO dbo.tbl_Bank
        (
          BankCode,
          BankName,
          BranchName,
          IFSCCode,
          Status,
          C_Date,
          C_User,
          C_Node
        )
        OUTPUT
          INSERTED.BankCode,
          INSERTED.BankName,
          INSERTED.BranchName,
          INSERTED.IFSCCode,
          INSERTED.Status,
          INSERTED.C_Date,
          INSERTED.C_User,
          INSERTED.C_Node
        VALUES
        (
          @BankCode,
          @BankName,
          @BranchName,
          @IFSCCode,
          1,
          GETDATE(),
          @C_User,
          @C_Node
        )
      `);

    res.status(201).json({
      success: true,
      message: "Bank created successfully",
      data: result.recordset[0],
    });
  } catch (error) {
    console.error("CREATE BANK ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create bank",
      error: error.message,
    });
  }
});

// =====================================================
// UPDATE BANK
// PUT /api/banks/:id
// =====================================================

router.put("/:id", async (req, res) => {
  try {
    const bankCode = Number(req.params.id);

    const {
      BankName,
      BranchName,
      IFSCCode,
      Status,
    } = req.body;

    if (!Number.isInteger(bankCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Bank Code",
      });
    }

    if (!BankName || !BankName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Bank name is required",
      });
    }

    const pool = await getPool();

    // -----------------------------
    // Check duplicate name
    // -----------------------------

    const duplicate = await pool
      .request()
      .input(
        "BankCode",
        sql.Int,
        bankCode
      )
      .input(
        "BankName",
        sql.VarChar(50),
        BankName.trim()
      )
      .query(`
        SELECT TOP 1
          BankCode
        FROM dbo.tbl_Bank
        WHERE BankName = @BankName
          AND BankCode <> @BankCode
      `);

    if (duplicate.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Another bank with this name already exists",
      });
    }

    // -----------------------------
    // Update
    // -----------------------------

    const result = await pool
      .request()
      .input(
        "BankCode",
        sql.Int,
        bankCode
      )
      .input(
        "BankName",
        sql.VarChar(50),
        BankName.trim()
      )
      .input(
        "BranchName",
        sql.NVarChar(50),
        BranchName?.trim() || ""
      )
      .input(
        "IFSCCode",
        sql.NVarChar(50),
        IFSCCode?.trim() || ""
      )
      .input(
        "Status",
        sql.Bit,
        Status === false ? 0 : 1
      )
      .input(
        "E_User",
        sql.Int,
        DEFAULT_C_USER
      )
      .input(
        "E_Node",
        sql.Int,
        DEFAULT_C_NODE
      )
      .query(`
        UPDATE dbo.tbl_Bank
        SET
          BankName = @BankName,
          BranchName = @BranchName,
          IFSCCode = @IFSCCode,
          Status = @Status,
          E_Date = GETDATE(),
          E_User = @E_User,
          E_Node = @E_Node
        OUTPUT
          INSERTED.BankCode,
          INSERTED.BankName,
          INSERTED.BranchName,
          INSERTED.IFSCCode,
          INSERTED.Status,
          INSERTED.C_Date,
          INSERTED.C_User,
          INSERTED.C_Node,
          INSERTED.E_Date,
          INSERTED.E_User,
          INSERTED.E_Node
        WHERE BankCode = @BankCode
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Bank not found",
      });
    }

    res.json({
      success: true,
      message: "Bank updated successfully",
      data: result.recordset[0],
    });
  } catch (error) {
    console.error("UPDATE BANK ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update bank",
      error: error.message,
    });
  }
});

// =====================================================
// DELETE BANK
// DELETE /api/banks/:id
// =====================================================

router.delete("/:id", async (req, res) => {
  try {
    const bankCode = Number(req.params.id);

    if (!Number.isInteger(bankCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Bank Code",
      });
    }

    const pool = await getPool();

    // -----------------------------
    // Check company references
    // -----------------------------

    const companyReference = await pool
      .request()
      .input(
        "BankCode",
        sql.Int,
        bankCode
      )
      .query(`
        SELECT COUNT(*) AS Total
        FROM dbo.tbl_Company
        WHERE BankCode = @BankCode
      `);

    if (
      companyReference.recordset[0].Total > 0
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Bank cannot be deleted because companies are using it",
      });
    }

    // -----------------------------
    // Delete
    // -----------------------------

    const result = await pool
      .request()
      .input(
        "BankCode",
        sql.Int,
        bankCode
      )
      .query(`
        DELETE FROM dbo.tbl_Bank
        WHERE BankCode = @BankCode
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message: "Bank not found",
      });
    }

    res.json({
      success: true,
      message: "Bank deleted successfully",
    });
  } catch (error) {
    console.error("DELETE BANK ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete bank",
      error: error.message,
    });
  }
});

module.exports = router;