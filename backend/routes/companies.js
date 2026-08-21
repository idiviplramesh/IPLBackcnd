const express = require("express");
const { getPool, sql } = require("../config/db");

const router = express.Router();

// =====================================================
// GET ALL COMPANIES
// GET /api/companies
// =====================================================

router.get("/", async (req, res) => {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT
        c.CompanyCode,
        c.CompanyName,
        c.Address1,
        c.Address2,
        c.City,
        c.District,
        c.Pincode,
        c.MobileNumber,
        c.BankCode,
        b.BankName,
        c.C_Date,
        c.C_User,
        c.C_Node,
        c.E_Date,
        c.E_User,
        c.E_Node
      FROM tbl_Company c
      LEFT JOIN tbl_Bank b
        ON b.BankCode = c.BankCode
      ORDER BY c.CompanyCode
    `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error("GET COMPANIES ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load companies",
      error: error.message,
    });
  }
});

// =====================================================
// GET COMPANY BY CODE
// GET /api/companies/:id
// =====================================================

router.get("/:id", async (req, res) => {
  try {
    const companyCode = Number(req.params.id);

    if (!Number.isInteger(companyCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid company code",
      });
    }

    const pool = await getPool();

    const result = await pool
      .request()
      .input("CompanyCode", sql.Int, companyCode)
      .query(`
        SELECT
          c.CompanyCode,
          c.CompanyName,
          c.Address1,
          c.Address2,
          c.City,
          c.District,
          c.Pincode,
          c.MobileNumber,
          c.BankCode,
          b.BankName,
          c.C_Date,
          c.C_User,
          c.C_Node,
          c.E_Date,
          c.E_User,
          c.E_Node
        FROM tbl_Company c
        LEFT JOIN tbl_Bank b
          ON b.BankCode = c.BankCode
        WHERE c.CompanyCode = @CompanyCode
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.json({
      success: true,
      data: result.recordset[0],
    });
  } catch (error) {
    console.error("GET COMPANY ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load company",
      error: error.message,
    });
  }
});

// =====================================================
// CREATE COMPANY
// CompanyCode is AUTO GENERATED
// POST /api/companies
// =====================================================

router.post("/", async (req, res) => {
  try {
    const {
      CompanyName,
      Address1,
      Address2,
      City,
      District,
      Pincode,
      MobileNumber,
      BankCode,
    } = req.body;

    // -------------------------------
    // VALIDATION
    // -------------------------------

    if (!CompanyName || !CompanyName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    if (!Address1 || !Address1.trim()) {
      return res.status(400).json({
        success: false,
        message: "Address 1 is required",
      });
    }

    if (!City || !City.trim()) {
      return res.status(400).json({
        success: false,
        message: "City is required",
      });
    }

    if (!District || !District.trim()) {
      return res.status(400).json({
        success: false,
        message: "District is required",
      });
    }

    if (!Pincode || !/^\d{6}$/.test(String(Pincode).trim())) {
      return res.status(400).json({
        success: false,
        message: "Pincode must be exactly 6 digits",
      });
    }

    if (
      !MobileNumber ||
      !/^[6-9]\d{9}$/.test(
        String(MobileNumber).trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10 digit mobile number",
      });
    }

    const pool = await getPool();

    // -------------------------------
    // DUPLICATE COMPANY NAME
    // -------------------------------

    const duplicate = await pool
      .request()
      .input(
        "CompanyName",
        sql.VarChar(50),
        CompanyName.trim()
      )
      .query(`
        SELECT CompanyCode
        FROM tbl_Company
        WHERE CompanyName = @CompanyName
      `);

    if (duplicate.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Company already exists",
      });
    }

    // -------------------------------
    // AUTO COMPANY CODE
    // -------------------------------

    const nextCodeResult = await pool
      .request()
      .query(`
        SELECT
          ISNULL(MAX(CompanyCode), 0) + 1 AS NextCompanyCode
        FROM tbl_Company
      `);

    const companyCode =
      nextCodeResult.recordset[0].NextCompanyCode;

    // -------------------------------
    // INSERT
    // -------------------------------

    const result = await pool
      .request()
      .input(
        "CompanyCode",
        sql.Int,
        companyCode
      )
      .input(
        "CompanyName",
        sql.VarChar(50),
        CompanyName.trim()
      )
      .input(
        "Address1",
        sql.VarChar(50),
        Address1.trim()
      )
      .input(
        "Address2",
        sql.VarChar(50),
        Address2?.trim() || ""
      )
      .input(
        "City",
        sql.VarChar(50),
        City.trim()
      )
      .input(
        "District",
        sql.VarChar(50),
        District.trim()
      )
      .input(
        "Pincode",
        sql.Char(6),
        Pincode.trim()
      )
      .input(
        "MobileNumber",
        sql.Char(20),
        MobileNumber.trim()
      )
      .input(
        "BankCode",
        sql.Int,
        BankCode
          ? Number(BankCode)
          : null
      )
      .input(
        "C_User",
        sql.Int,
        Number(req.body.C_User) || 1
      )
      .input(
        "C_Node",
        sql.Int,
        Number(req.body.C_Node) || 1
      )
      .query(`
        INSERT INTO tbl_Company
        (
          CompanyCode,
          CompanyName,
          Address1,
          Address2,
          City,
          District,
          Pincode,
          MobileNumber,
          BankCode,
          C_Date,
          C_User,
          C_Node
        )
        OUTPUT
          INSERTED.CompanyCode,
          INSERTED.CompanyName,
          INSERTED.Address1,
          INSERTED.Address2,
          INSERTED.City,
          INSERTED.District,
          INSERTED.Pincode,
          INSERTED.MobileNumber,
          INSERTED.BankCode,
          INSERTED.C_Date,
          INSERTED.C_User,
          INSERTED.C_Node
        VALUES
        (
          @CompanyCode,
          @CompanyName,
          @Address1,
          @Address2,
          @City,
          @District,
          @Pincode,
          @MobileNumber,
          @BankCode,
          GETDATE(),
          @C_User,
          @C_Node
        )
      `);

    res.status(201).json({
      success: true,
      message: "Company created successfully",
      data: result.recordset[0],
    });
  } catch (error) {
    console.error("CREATE COMPANY ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create company",
      error: error.message,
    });
  }
});

// =====================================================
// UPDATE COMPANY
// CompanyCode cannot be changed
// PUT /api/companies/:id
// =====================================================

router.put("/:id", async (req, res) => {
  try {
    const companyCode = Number(req.params.id);

    if (!Number.isInteger(companyCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid company code",
      });
    }

    const {
      CompanyName,
      Address1,
      Address2,
      City,
      District,
      Pincode,
      MobileNumber,
      BankCode,
    } = req.body;

    if (!CompanyName || !CompanyName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    if (!Address1 || !Address1.trim()) {
      return res.status(400).json({
        success: false,
        message: "Address 1 is required",
      });
    }

    if (!City || !City.trim()) {
      return res.status(400).json({
        success: false,
        message: "City is required",
      });
    }

    if (!District || !District.trim()) {
      return res.status(400).json({
        success: false,
        message: "District is required",
      });
    }

    if (!Pincode || !/^\d{6}$/.test(String(Pincode).trim())) {
      return res.status(400).json({
        success: false,
        message: "Pincode must be exactly 6 digits",
      });
    }

    if (
      !MobileNumber ||
      !/^[6-9]\d{9}$/.test(
        String(MobileNumber).trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10 digit mobile number",
      });
    }

    const pool = await getPool();

    // -------------------------------
    // CHECK COMPANY
    // -------------------------------

    const existing = await pool
      .request()
      .input(
        "CompanyCode",
        sql.Int,
        companyCode
      )
      .query(`
        SELECT CompanyCode
        FROM tbl_Company
        WHERE CompanyCode = @CompanyCode
      `);

    if (existing.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // -------------------------------
    // DUPLICATE NAME
    // -------------------------------

    const duplicate = await pool
      .request()
      .input(
        "CompanyName",
        sql.VarChar(50),
        CompanyName.trim()
      )
      .input(
        "CompanyCode",
        sql.Int,
        companyCode
      )
      .query(`
        SELECT CompanyCode
        FROM tbl_Company
        WHERE CompanyName = @CompanyName
          AND CompanyCode <> @CompanyCode
      `);

    if (duplicate.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Another company already uses this name",
      });
    }

    // -------------------------------
    // UPDATE
    // -------------------------------

    const result = await pool
      .request()
      .input(
        "CompanyCode",
        sql.Int,
        companyCode
      )
      .input(
        "CompanyName",
        sql.VarChar(50),
        CompanyName.trim()
      )
      .input(
        "Address1",
        sql.VarChar(50),
        Address1.trim()
      )
      .input(
        "Address2",
        sql.VarChar(50),
        Address2?.trim() || ""
      )
      .input(
        "City",
        sql.VarChar(50),
        City.trim()
      )
      .input(
        "District",
        sql.VarChar(50),
        District.trim()
      )
      .input(
        "Pincode",
        sql.Char(6),
        Pincode.trim()
      )
      .input(
        "MobileNumber",
        sql.Char(20),
        MobileNumber.trim()
      )
      .input(
        "BankCode",
        sql.Int,
        BankCode
          ? Number(BankCode)
          : null
      )
      .input(
        "E_User",
        sql.Int,
        Number(req.body.E_User) || 1
      )
      .input(
        "E_Node",
        sql.Int,
        Number(req.body.E_Node) || 1
      )
      .query(`
        UPDATE tbl_Company
        SET
          CompanyName = @CompanyName,
          Address1 = @Address1,
          Address2 = @Address2,
          City = @City,
          District = @District,
          Pincode = @Pincode,
          MobileNumber = @MobileNumber,
          BankCode = @BankCode,
          E_Date = GETDATE(),
          E_User = @E_User,
          E_Node = @E_Node
        OUTPUT
          INSERTED.CompanyCode,
          INSERTED.CompanyName,
          INSERTED.Address1,
          INSERTED.Address2,
          INSERTED.City,
          INSERTED.District,
          INSERTED.Pincode,
          INSERTED.MobileNumber,
          INSERTED.BankCode,
          INSERTED.C_Date,
          INSERTED.C_User,
          INSERTED.C_Node,
          INSERTED.E_Date,
          INSERTED.E_User,
          INSERTED.E_Node
        WHERE CompanyCode = @CompanyCode
      `);

    res.json({
      success: true,
      message: "Company updated successfully",
      data: result.recordset[0],
    });
  } catch (error) {
    console.error("UPDATE COMPANY ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update company",
      error: error.message,
    });
  }
});

// =====================================================
// DELETE COMPANY
// DELETE /api/companies/:id
// =====================================================

router.delete("/:id", async (req, res) => {
  try {
    const companyCode = Number(req.params.id);

    if (!Number.isInteger(companyCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid company code",
      });
    }

    const pool = await getPool();

    // Check members
    const members = await pool
      .request()
      .input(
        "CompanyCode",
        sql.Int,
        companyCode
      )
      .query(`
        SELECT COUNT(*) AS Total
        FROM tbl_Member
        WHERE AreaCode IS NOT NULL
      `);

    // Delete company
    const result = await pool
      .request()
      .input(
        "CompanyCode",
        sql.Int,
        companyCode
      )
      .query(`
        DELETE FROM tbl_Company
        WHERE CompanyCode = @CompanyCode
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (error) {
    console.error("DELETE COMPANY ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete company",
      error: error.message,
    });
  }
});

module.exports = router;