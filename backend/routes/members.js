const express = require("express");
const { getPool, sql } = require("../config/db");

const router = express.Router();

// =====================================================
// GET ALL MEMBERS
// GET /api/members
// =====================================================

router.get("/", async (req, res) => {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT
        m.MemberCode,
        m.MemberName,
        m.MobileNumber,
        m.AreaCode,
        a.AreaName,
        m.C_Date,
        m.C_User,
        m.C_Node,
        m.E_Date,
        m.E_User,
        m.E_Node
      FROM tbl_Member m
      LEFT JOIN tbl_Area a
        ON a.AreaCode = m.AreaCode
      ORDER BY m.MemberCode
    `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error("GET MEMBERS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load members",
      error: error.message,
    });
  }
});

// =====================================================
// GET ONE MEMBER
// GET /api/members/:id
// =====================================================

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid Member Code",
      });
    }

    const pool = await getPool();

    const result = await pool
      .request()
      .input("MemberCode", sql.Int, id)
      .query(`
        SELECT
          m.MemberCode,
          m.MemberName,
          m.MobileNumber,
          m.AreaCode,
          a.AreaName,
          m.C_Date,
          m.C_User,
          m.C_Node,
          m.E_Date,
          m.E_User,
          m.E_Node
        FROM tbl_Member m
        LEFT JOIN tbl_Area a
          ON a.AreaCode = m.AreaCode
        WHERE m.MemberCode = @MemberCode
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    res.json({
      success: true,
      data: result.recordset[0],
    });
  } catch (error) {
    console.error("GET MEMBER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load member",
      error: error.message,
    });
  }
});

// =====================================================
// CREATE MEMBER
// POST /api/members
//
// MemberCode is AUTO GENERATED
// =====================================================

router.post("/", async (req, res) => {
  let transaction;

  try {
    const {
      MemberName,
      MobileNumber,
      AreaCode,
    } = req.body;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!MemberName || !MemberName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Member name is required",
      });
    }

    if (!MobileNumber || !MobileNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required",
      });
    }

    if (!AreaCode) {
      return res.status(400).json({
        success: false,
        message: "Area is required",
      });
    }

    const areaCode = Number(AreaCode);

    if (!Number.isInteger(areaCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Area Code",
      });
    }

    const pool = await getPool();

    // -------------------------------------------------
    // CHECK AREA
    // -------------------------------------------------

    const areaResult = await pool
      .request()
      .input("AreaCode", sql.Int, areaCode)
      .query(`
        SELECT AreaCode, AreaName
        FROM tbl_Area
        WHERE AreaCode = @AreaCode
      `);

    if (areaResult.recordset.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Selected area does not exist",
      });
    }

    // -------------------------------------------------
    // CHECK DUPLICATE MOBILE
    // -------------------------------------------------

    const duplicateMobile = await pool
      .request()
      .input(
        "MobileNumber",
        sql.VarChar(20),
        MobileNumber.trim()
      )
      .query(`
        SELECT MemberCode
        FROM tbl_Member
        WHERE MobileNumber = @MobileNumber
      `);

    if (duplicateMobile.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Mobile number already exists",
      });
    }

    // -------------------------------------------------
    // TRANSACTION
    // AUTO MEMBER CODE
    // -------------------------------------------------

    transaction = new sql.Transaction(pool);

    await transaction.begin(
      sql.ISOLATION_LEVEL.SERIALIZABLE
    );

    const request = new sql.Request(transaction);

    const nextCodeResult = await request.query(`
      SELECT
        ISNULL(MAX(MemberCode), 0) + 1 AS NextMemberCode
      FROM tbl_Member
    `);

    const memberCode =
      nextCodeResult.recordset[0].NextMemberCode;

    // -------------------------------------------------
    // INSERT
    // -------------------------------------------------

    const insertRequest = new sql.Request(
      transaction
    );

    insertRequest.input(
      "MemberCode",
      sql.Int,
      memberCode
    );

    insertRequest.input(
      "MemberName",
      sql.VarChar(50),
      MemberName.trim()
    );

    insertRequest.input(
      "MobileNumber",
      sql.VarChar(20),
      MobileNumber.trim()
    );

    insertRequest.input(
      "AreaCode",
      sql.Int,
      areaCode
    );

    // Current logged user/node.
    // Change these later when authentication values
    // are available in req.user.
    insertRequest.input(
      "C_User",
      sql.Int,
      1
    );

    insertRequest.input(
      "C_Node",
      sql.Int,
      1
    );

    const result = await insertRequest.query(`
      INSERT INTO tbl_Member
      (
        MemberCode,
        MemberName,
        MobileNumber,
        AreaCode,
        C_Date,
        C_User,
        C_Node
      )
      OUTPUT
        INSERTED.MemberCode,
        INSERTED.MemberName,
        INSERTED.MobileNumber,
        INSERTED.AreaCode,
        INSERTED.C_Date
      VALUES
      (
        @MemberCode,
        @MemberName,
        @MobileNumber,
        @AreaCode,
        GETDATE(),
        @C_User,
        @C_Node
      )
    `);

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: "Member created successfully",
      data: result.recordset[0],
    });
  } catch (error) {
    console.error("CREATE MEMBER ERROR:", error);

    try {
      if (transaction) {
        await transaction.rollback();
      }
    } catch (rollbackError) {
      console.error(
        "ROLLBACK MEMBER ERROR:",
        rollbackError
      );
    }

    res.status(500).json({
      success: false,
      message: "Failed to create member",
      error: error.message,
    });
  }
});

// =====================================================
// UPDATE MEMBER
// PUT /api/members/:id
// =====================================================

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid Member Code",
      });
    }

    const {
      MemberName,
      MobileNumber,
      AreaCode,
    } = req.body;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!MemberName || !MemberName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Member name is required",
      });
    }

    if (!MobileNumber || !MobileNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required",
      });
    }

    if (!AreaCode) {
      return res.status(400).json({
        success: false,
        message: "Area is required",
      });
    }

    const areaCode = Number(AreaCode);

    if (!Number.isInteger(areaCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Area Code",
      });
    }

    const pool = await getPool();

    // -------------------------------------------------
    // CHECK MEMBER EXISTS
    // -------------------------------------------------

    const memberExists = await pool
      .request()
      .input(
        "MemberCode",
        sql.Int,
        id
      )
      .query(`
        SELECT MemberCode
        FROM tbl_Member
        WHERE MemberCode = @MemberCode
      `);

    if (memberExists.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    // -------------------------------------------------
    // CHECK AREA
    // -------------------------------------------------

    const areaExists = await pool
      .request()
      .input(
        "AreaCode",
        sql.Int,
        areaCode
      )
      .query(`
        SELECT AreaCode
        FROM tbl_Area
        WHERE AreaCode = @AreaCode
      `);

    if (areaExists.recordset.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Selected area does not exist",
      });
    }

    // -------------------------------------------------
    // CHECK DUPLICATE MOBILE
    // -------------------------------------------------

    const duplicateMobile = await pool
      .request()
      .input(
        "MobileNumber",
        sql.VarChar(20),
        MobileNumber.trim()
      )
      .input(
        "MemberCode",
        sql.Int,
        id
      )
      .query(`
        SELECT MemberCode
        FROM tbl_Member
        WHERE MobileNumber = @MobileNumber
          AND MemberCode <> @MemberCode
      `);

    if (duplicateMobile.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Mobile number already exists",
      });
    }

    // -------------------------------------------------
    // UPDATE
    // MemberCode is NOT changed
    // -------------------------------------------------

    const result = await pool
      .request()
      .input(
        "MemberCode",
        sql.Int,
        id
      )
      .input(
        "MemberName",
        sql.VarChar(50),
        MemberName.trim()
      )
      .input(
        "MobileNumber",
        sql.VarChar(20),
        MobileNumber.trim()
      )
      .input(
        "AreaCode",
        sql.Int,
        areaCode
      )
      .input(
        "E_User",
        sql.Int,
        1
      )
      .input(
        "E_Node",
        sql.Int,
        1
      )
      .query(`
        UPDATE tbl_Member
        SET
          MemberName = @MemberName,
          MobileNumber = @MobileNumber,
          AreaCode = @AreaCode,
          E_Date = GETDATE(),
          E_User = @E_User,
          E_Node = @E_Node
        OUTPUT
          INSERTED.MemberCode,
          INSERTED.MemberName,
          INSERTED.MobileNumber,
          INSERTED.AreaCode,
          INSERTED.E_Date
        WHERE MemberCode = @MemberCode
      `);

    res.json({
      success: true,
      message: "Member updated successfully",
      data: result.recordset[0],
    });
  } catch (error) {
    console.error("UPDATE MEMBER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update member",
      error: error.message,
    });
  }
});

// =====================================================
// DELETE MEMBER
// DELETE /api/members/:id
// =====================================================

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid Member Code",
      });
    }

    const pool = await getPool();

    const result = await pool
      .request()
      .input(
        "MemberCode",
        sql.Int,
        id
      )
      .query(`
        DELETE FROM tbl_Member
        WHERE MemberCode = @MemberCode
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    res.json({
      success: true,
      message: "Member deleted successfully",
    });
  } catch (error) {
    console.error("DELETE MEMBER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete member",
      error: error.message,
    });
  }
});

module.exports = router;