// // const express = require("express");
// // const { getPool, sql } = require("../config/db");

// // const router = express.Router();

// // /* =====================================================
// //    GET ALL COMPANIES
// //    GET /api/companies
// // ===================================================== */

// // router.get("/", async (req, res) => {
// //   try {
// //     const pool = await getPool();

// //     const result = await pool.request().query(`
// //       SELECT
// //         c.CompanyCode,
// //         c.CompanyName,
// //         c.Address1,
// //         c.Address2,
// //         c.City,
// //         c.District,
// //         c.Pincode,
// //         c.MobileNumber,
// //         c.BankCode,
// //         b.BankName,
// //         c.C_Date,
// //         c.C_User,
// //         c.C_Node,
// //         c.E_Date,
// //         c.E_User,
// //         c.E_Node
// //       FROM dbo.tbl_Company c
// //       LEFT JOIN dbo.tbl_Bank b
// //         ON b.BankCode = c.BankCode
// //       ORDER BY c.CompanyCode
// //     `);

// //     return res.json({
// //       success: true,
// //       data: result.recordset,
// //     });

// //   } catch (error) {
// //     console.error("GET COMPANIES ERROR:", error);

// //     return res.status(500).json({
// //       success: false,
// //       message: "Failed to load companies",
// //       error: error.message,
// //     });
// //   }
// // });


// // /* =====================================================
// //    GET COMPANY BY CODE
// //    GET /api/companies/:id
// // ===================================================== */

// // router.get("/:id", async (req, res) => {
// //   try {
// //     const companyCode = Number(req.params.id);

// //     if (!Number.isInteger(companyCode) || companyCode <= 0) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Invalid company code",
// //       });
// //     }

// //     const pool = await getPool();

// //     const result = await pool
// //       .request()
// //       .input(
// //         "CompanyCode",
// //         sql.Int,
// //         companyCode
// //       )
// //       .query(`
// //         SELECT
// //           c.CompanyCode,
// //           c.CompanyName,
// //           c.Address1,
// //           c.Address2,
// //           c.City,
// //           c.District,
// //           c.Pincode,
// //           c.MobileNumber,
// //           c.BankCode,
// //           b.BankName,
// //           c.C_Date,
// //           c.C_User,
// //           c.C_Node,
// //           c.E_Date,
// //           c.E_User,
// //           c.E_Node
// //         FROM dbo.tbl_Company c
// //         LEFT JOIN dbo.tbl_Bank b
// //           ON b.BankCode = c.BankCode
// //         WHERE c.CompanyCode = @CompanyCode
// //       `);

// //     if (result.recordset.length === 0) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Company not found",
// //       });
// //     }

// //     return res.json({
// //       success: true,
// //       data: result.recordset[0],
// //     });

// //   } catch (error) {
// //     console.error("GET COMPANY ERROR:", error);

// //     return res.status(500).json({
// //       success: false,
// //       message: "Failed to load company",
// //       error: error.message,
// //     });
// //   }
// // });


// // /* =====================================================
// //    CREATE COMPANY
// //    POST /api/companies

// //    ONLY ONE COMPANY ALLOWED
// // ===================================================== */

// // router.post("/", async (req, res) => {
// //   try {

// //     const {
// //       CompanyName,
// //       Address1,
// //       Address2,
// //       City,
// //       District,
// //       Pincode,
// //       MobileNumber,
// //       BankCode,
// //     } = req.body;


// //     /* =====================================================
// //        VALIDATION
// //     ===================================================== */

// //     if (
// //       !CompanyName ||
// //       typeof CompanyName !== "string" ||
// //       !CompanyName.trim()
// //     ) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Company name is required",
// //       });
// //     }


// //     if (
// //       !Address1 ||
// //       typeof Address1 !== "string" ||
// //       !Address1.trim()
// //     ) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Address 1 is required",
// //       });
// //     }


// //     if (
// //       !City ||
// //       typeof City !== "string" ||
// //       !City.trim()
// //     ) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "City is required",
// //       });
// //     }


// //     if (
// //       !District ||
// //       typeof District !== "string" ||
// //       !District.trim()
// //     ) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "District is required",
// //       });
// //     }


// //     /* =====================================================
// //        PINCODE
// //     ===================================================== */

// //     if (
// //       !Pincode ||
// //       !/^\d{6}$/.test(
// //         String(Pincode).trim()
// //       )
// //     ) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Pincode must be exactly 6 digits",
// //       });
// //     }


// //     /* =====================================================
// //        MOBILE
// //     ===================================================== */

// //     if (
// //       !MobileNumber ||
// //       !/^[6-9]\d{9}$/.test(
// //         String(MobileNumber).trim()
// //       )
// //     ) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Enter a valid 10 digit mobile number",
// //       });
// //     }


// //     /* =====================================================
// //        DATABASE
// //     ===================================================== */

// //     const pool = await getPool();


// //     /* =====================================================
// //        QUICK CHECK

// //        If a company already exists,
// //        don't call INSERT procedure.
// //     ===================================================== */

// //     const existingCompany = await pool
// //       .request()
// //       .query(`
// //         SELECT TOP 1
// //           CompanyCode,
// //           CompanyName
// //         FROM dbo.tbl_Company
// //         ORDER BY CompanyCode
// //       `);


// //     if (existingCompany.recordset.length > 0) {

// //       return res.status(409).json({
// //         success: false,
// //         message:
// //           "Only one company is allowed. Company already exists.",
// //         data: existingCompany.recordset[0],
// //       });
// //     }


// //     /* =====================================================
// //        USER / NODE
// //     ===================================================== */

// //     const userCode =
// //       Number(req.body.C_User) ||
// //       Number(req.body.User) ||
// //       1;

// //     const nodeCode =
// //       Number(req.body.C_Node) ||
// //       Number(req.body.Node) ||
// //       1;


// //     /* =====================================================
// //        BANK CODE
// //     ===================================================== */

// //     let bankCode = null;

// //     if (
// //       BankCode !== null &&
// //       BankCode !== undefined &&
// //       String(BankCode).trim() !== ""
// //     ) {
// //       const parsedBankCode = Number(BankCode);

// //       if (
// //         !Number.isInteger(parsedBankCode) ||
// //         parsedBankCode <= 0
// //       ) {
// //         return res.status(400).json({
// //           success: false,
// //           message: "Invalid bank code",
// //         });
// //       }

// //       bankCode = parsedBankCode;
// //     }


// //     /* =====================================================
// //        CALL STORED PROCEDURE
// //     ===================================================== */

// //     const result = await pool
// //       .request()

// //       .input(
// //         "CompanyName",
// //         sql.VarChar(50),
// //         CompanyName.trim()
// //       )

// //       .input(
// //         "Address1",
// //         sql.VarChar(50),
// //         Address1.trim()
// //       )

// //       .input(
// //         "Address2",
// //         sql.VarChar(50),
// //         Address2
// //           ? String(Address2).trim()
// //           : ""
// //       )

// //       .input(
// //         "City",
// //         sql.VarChar(50),
// //         City.trim()
// //       )

// //       .input(
// //         "District",
// //         sql.VarChar(50),
// //         District.trim()
// //       )

// //       .input(
// //         "Pincode",
// //         sql.Char(6),
// //         String(Pincode).trim()
// //       )

// //       .input(
// //         "MobileNumber",
// //         sql.Char(20),
// //         String(MobileNumber).trim()
// //       )

// //       .input(
// //         "BankCode",
// //         sql.Int,
// //         bankCode
// //       )

// //       .input(
// //         "User",
// //         sql.Int,
// //         userCode
// //       )

// //       .input(
// //         "Node",
// //         sql.Int,
// //         nodeCode
// //       )

// //       .execute("sp_Company_Insert");


// //     /* =====================================================
// //        PROCEDURE RESPONSE
// //     ===================================================== */

// //     const procedureData =
// //       result.recordset?.[0];


// //     if (!procedureData) {

// //       return res.status(500).json({
// //         success: false,
// //         message:
// //           "Company procedure did not return a response",
// //       });
// //     }


// //     /* =====================================================
// //        SECOND COMPANY
// //     ===================================================== */

// //     if (
// //       Number(procedureData.Success) !== 1
// //     ) {

// //       return res.status(409).json({
// //         success: false,
// //         message:
// //           procedureData.Message ||
// //           "Only one company is allowed.",
// //       });
// //     }


// //     /* =====================================================
// //        COMPANY CODE
// //     ===================================================== */

// //     const companyCode =
// //       Number(procedureData.CompanyCode);


// //     if (
// //       !Number.isInteger(companyCode) ||
// //       companyCode <= 0
// //     ) {

// //       return res.status(500).json({
// //         success: false,
// //         message:
// //           "Company was inserted but CompanyCode was not returned",
// //       });
// //     }


// //     /* =====================================================
// //        GET INSERTED COMPANY
// //     ===================================================== */

// //     const companyResult = await pool
// //       .request()
// //       .input(
// //         "CompanyCode",
// //         sql.Int,
// //         companyCode
// //       )
// //       .query(`
// //         SELECT
// //           c.CompanyCode,
// //           c.CompanyName,
// //           c.Address1,
// //           c.Address2,
// //           c.City,
// //           c.District,
// //           c.Pincode,
// //           c.MobileNumber,
// //           c.BankCode,
// //           b.BankName,
// //           c.C_Date,
// //           c.C_User,
// //           c.C_Node,
// //           c.E_Date,
// //           c.E_User,
// //           c.E_Node
// //         FROM dbo.tbl_Company c
// //         LEFT JOIN dbo.tbl_Bank b
// //           ON b.BankCode = c.BankCode
// //         WHERE c.CompanyCode = @CompanyCode
// //       `);


// //     const company =
// //       companyResult.recordset?.[0];


// //     /* =====================================================
// //        SUCCESS
// //     ===================================================== */

// //     return res.status(201).json({
// //       success: true,
// //       message:
// //         procedureData.Message ||
// //         "Company added successfully.",
// //       data: company,
// //     });

// //   } catch (error) {

// //     console.error(
// //       "CREATE COMPANY ERROR:",
// //       error
// //     );

// //     return res.status(500).json({
// //       success: false,
// //       message: "Failed to create company",
// //       error: error.message,
// //     });
// //   }
// // });


// // /* =====================================================
// //    UPDATE COMPANY
// //    PUT /api/companies/:id

// //    CompanyCode CANNOT be changed
// // ===================================================== */

// // router.put("/:id", async (req, res) => {
// //   try {

// //     const companyCode =
// //       Number(req.params.id);


// //     /* =====================================================
// //        COMPANY CODE VALIDATION
// //     ===================================================== */

// //     if (
// //       !Number.isInteger(companyCode) ||
// //       companyCode <= 0
// //     ) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Invalid company code",
// //       });
// //     }


// //     const {
// //       CompanyName,
// //       Address1,
// //       Address2,
// //       City,
// //       District,
// //       Pincode,
// //       MobileNumber,
// //       BankCode,
// //     } = req.body;


// //     /* =====================================================
// //        VALIDATION
// //     ===================================================== */

// //     if (
// //       !CompanyName ||
// //       typeof CompanyName !== "string" ||
// //       !CompanyName.trim()
// //     ) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Company name is required",
// //       });
// //     }


// //     if (
// //       !Address1 ||
// //       typeof Address1 !== "string" ||
// //       !Address1.trim()
// //     ) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Address 1 is required",
// //       });
// //     }


// //     if (
// //       !City ||
// //       typeof City !== "string" ||
// //       !City.trim()
// //     ) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "City is required",
// //       });
// //     }


// //     if (
// //       !District ||
// //       typeof District !== "string" ||
// //       !District.trim()
// //     ) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "District is required",
// //       });
// //     }


// //     if (
// //       !Pincode ||
// //       !/^\d{6}$/.test(
// //         String(Pincode).trim()
// //       )
// //     ) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Pincode must be exactly 6 digits",
// //       });
// //     }


// //     if (
// //       !MobileNumber ||
// //       !/^[6-9]\d{9}$/.test(
// //         String(MobileNumber).trim()
// //       )
// //     ) {
// //       return res.status(400).json({
// //         success: false,
// //         message:
// //           "Enter a valid 10 digit mobile number",
// //       });
// //     }


// //     const pool = await getPool();


// //     /* =====================================================
// //        CHECK COMPANY EXISTS
// //     ===================================================== */

// //     const existing = await pool
// //       .request()
// //       .input(
// //         "CompanyCode",
// //         sql.Int,
// //         companyCode
// //       )
// //       .query(`
// //         SELECT
// //           CompanyCode
// //         FROM dbo.tbl_Company
// //         WHERE CompanyCode = @CompanyCode
// //       `);


// //     if (
// //       existing.recordset.length === 0
// //     ) {

// //       return res.status(404).json({
// //         success: false,
// //         message: "Company not found",
// //       });
// //     }


// //     /* =====================================================
// //        DUPLICATE COMPANY NAME
// //     ===================================================== */

// //     const duplicate = await pool
// //       .request()

// //       .input(
// //         "CompanyName",
// //         sql.VarChar(50),
// //         CompanyName.trim()
// //       )

// //       .input(
// //         "CompanyCode",
// //         sql.Int,
// //         companyCode
// //       )

// //       .query(`
// //         SELECT
// //           CompanyCode
// //         FROM dbo.tbl_Company
// //         WHERE CompanyName = @CompanyName
// //           AND CompanyCode <> @CompanyCode
// //       `);


// //     if (
// //       duplicate.recordset.length > 0
// //     ) {

// //       return res.status(409).json({
// //         success: false,
// //         message:
// //           "Another company already uses this name",
// //       });
// //     }


// //     /* =====================================================
// //        USER / NODE
// //     ===================================================== */

// //     const userCode =
// //       Number(req.body.E_User) ||
// //       Number(req.body.User) ||
// //       1;

// //     const nodeCode =
// //       Number(req.body.E_Node) ||
// //       Number(req.body.Node) ||
// //       1;


// //     /* =====================================================
// //        BANK CODE
// //     ===================================================== */

// //     let bankCode = null;

// //     if (
// //       BankCode !== null &&
// //       BankCode !== undefined &&
// //       String(BankCode).trim() !== ""
// //     ) {

// //       const parsedBankCode =
// //         Number(BankCode);

// //       if (
// //         !Number.isInteger(parsedBankCode) ||
// //         parsedBankCode <= 0
// //       ) {
// //         return res.status(400).json({
// //           success: false,
// //           message: "Invalid bank code",
// //         });
// //       }

// //       bankCode = parsedBankCode;
// //     }


// //     /* =====================================================
// //        UPDATE
// //     ===================================================== */

// //     const result = await pool
// //       .request()

// //       .input(
// //         "CompanyCode",
// //         sql.Int,
// //         companyCode
// //       )

// //       .input(
// //         "CompanyName",
// //         sql.VarChar(50),
// //         CompanyName.trim()
// //       )

// //       .input(
// //         "Address1",
// //         sql.VarChar(50),
// //         Address1.trim()
// //       )

// //       .input(
// //         "Address2",
// //         sql.VarChar(50),
// //         Address2
// //           ? String(Address2).trim()
// //           : ""
// //       )

// //       .input(
// //         "City",
// //         sql.VarChar(50),
// //         City.trim()
// //       )

// //       .input(
// //         "District",
// //         sql.VarChar(50),
// //         District.trim()
// //       )

// //       .input(
// //         "Pincode",
// //         sql.Char(6),
// //         String(Pincode).trim()
// //       )

// //       .input(
// //         "MobileNumber",
// //         sql.Char(20),
// //         String(MobileNumber).trim()
// //       )

// //       .input(
// //         "BankCode",
// //         sql.Int,
// //         bankCode
// //       )

// //       .input(
// //         "E_User",
// //         sql.Int,
// //         userCode
// //       )

// //       .input(
// //         "E_Node",
// //         sql.Int,
// //         nodeCode
// //       )

// //       .query(`
// //         UPDATE dbo.tbl_Company
// //         SET
// //           CompanyName = @CompanyName,
// //           Address1 = @Address1,
// //           Address2 = @Address2,
// //           City = @City,
// //           District = @District,
// //           Pincode = @Pincode,
// //           MobileNumber = @MobileNumber,
// //           BankCode = @BankCode,
// //           E_Date = GETDATE(),
// //           E_User = @E_User,
// //           E_Node = @E_Node

// //         OUTPUT
// //           INSERTED.CompanyCode,
// //           INSERTED.CompanyName,
// //           INSERTED.Address1,
// //           INSERTED.Address2,
// //           INSERTED.City,
// //           INSERTED.District,
// //           INSERTED.Pincode,
// //           INSERTED.MobileNumber,
// //           INSERTED.BankCode,
// //           INSERTED.C_Date,
// //           INSERTED.C_User,
// //           INSERTED.C_Node,
// //           INSERTED.E_Date,
// //           INSERTED.E_User,
// //           INSERTED.E_Node

// //         WHERE CompanyCode = @CompanyCode
// //       `);


// //     /* =====================================================
// //        SUCCESS
// //     ===================================================== */

// //     return res.json({
// //       success: true,
// //       message:
// //         "Company updated successfully",
// //       data: result.recordset[0],
// //     });

// //   } catch (error) {

// //     console.error(
// //       "UPDATE COMPANY ERROR:",
// //       error
// //     );

// //     return res.status(500).json({
// //       success: false,
// //       message: "Failed to update company",
// //       error: error.message,
// //     });
// //   }
// // });


// // /* =====================================================
// //    DELETE COMPANY

// //    DELETE DISABLED

// //    DELETE /api/companies/:id
// // ===================================================== */

// // router.delete("/:id", async (req, res) => {

// //   return res.status(403).json({
// //     success: false,
// //     message:
// //       "Company deletion is disabled. Only one company is allowed.",
// //   });

// // });


// // /* =====================================================
// //    EXPORT ROUTER
// // ===================================================== */

// // module.exports = router;

// const express = require("express");
// const { getPool, sql } = require("../config/db");

// const router = express.Router();

// /* =====================================================
//    GET ALL COMPANIES
//    GET /api/companies
// ===================================================== */

// router.get("/", async (req, res) => {
//   try {
//     const pool = await getPool();

//     const result = await pool.request().query(`
//       SELECT
//         c.CompanyCode,
//         c.CompanyName,
//         c.Address1,
//         c.Address2,
//         c.City,
//         c.District,
//         c.Pincode,
//         c.MobileNumber,
//         c.BankCode,
//         b.BankName,
//         c.C_Date,
//         c.C_User,
//         c.C_Node,
//         c.E_Date,
//         c.E_User,
//         c.E_Node
//       FROM dbo.tbl_Company c
//       LEFT JOIN dbo.tbl_Bank b
//         ON b.BankCode = c.BankCode
//       ORDER BY c.CompanyCode
//     `);

//     return res.json({
//       success: true,
//       data: result.recordset,
//     });

//   } catch (error) {
//     console.error("GET COMPANIES ERROR:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to load companies",
//       error: error.message,
//     });
//   }
// });


// /* =====================================================
//    GET COMPANY BY CODE
//    GET /api/companies/:id
// ===================================================== */

// router.get("/:id", async (req, res) => {
//   try {
//     const companyCode = Number(req.params.id);

//     if (!Number.isInteger(companyCode) || companyCode <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid company code",
//       });
//     }

//     const pool = await getPool();

//     const result = await pool
//       .request()
//       .input(
//         "CompanyCode",
//         sql.Int,
//         companyCode
//       )
//       .query(`
//         SELECT
//           c.CompanyCode,
//           c.CompanyName,
//           c.Address1,
//           c.Address2,
//           c.City,
//           c.District,
//           c.Pincode,
//           c.MobileNumber,
//           c.BankCode,
//           b.BankName,
//           c.C_Date,
//           c.C_User,
//           c.C_Node,
//           c.E_Date,
//           c.E_User,
//           c.E_Node
//         FROM dbo.tbl_Company c
//         LEFT JOIN dbo.tbl_Bank b
//           ON b.BankCode = c.BankCode
//         WHERE c.CompanyCode = @CompanyCode
//       `);

//     if (result.recordset.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Company not found",
//       });
//     }

//     return res.json({
//       success: true,
//       data: result.recordset[0],
//     });

//   } catch (error) {
//     console.error("GET COMPANY ERROR:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to load company",
//       error: error.message,
//     });
//   }
// });


// /* =====================================================
//    CREATE COMPANY
//    POST /api/companies

//    ONLY ONE COMPANY ALLOWED
// ===================================================== */

// router.post("/", async (req, res) => {
//   try {

//     const {
//       CompanyName,
//       Address1,
//       Address2,
//       City,
//       District,
//       Pincode,
//       MobileNumber,
//       BankCode,
//     } = req.body;


//     /* =====================================================
//        VALIDATION
//     ===================================================== */

//     if (
//       !CompanyName ||
//       typeof CompanyName !== "string" ||
//       !CompanyName.trim()
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Company name is required",
//       });
//     }


//     if (
//       !Address1 ||
//       typeof Address1 !== "string" ||
//       !Address1.trim()
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Address 1 is required",
//       });
//     }


//     if (
//       !City ||
//       typeof City !== "string" ||
//       !City.trim()
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "City is required",
//       });
//     }


//     if (
//       !District ||
//       typeof District !== "string" ||
//       !District.trim()
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "District is required",
//       });
//     }


//     /* =====================================================
//        PINCODE
//     ===================================================== */

//     if (
//       !Pincode ||
//       !/^\d{6}$/.test(
//         String(Pincode).trim()
//       )
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Pincode must be exactly 6 digits",
//       });
//     }


//     /* =====================================================
//        MOBILE
//     ===================================================== */

//     if (
//       !MobileNumber ||
//       !/^[6-9]\d{9}$/.test(
//         String(MobileNumber).trim()
//       )
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Enter a valid 10 digit mobile number",
//       });
//     }


//     /* =====================================================
//        DATABASE
//     ===================================================== */

//     const pool = await getPool();


//     /* =====================================================
//        QUICK CHECK

//        If a company already exists,
//        don't call INSERT procedure.
//     ===================================================== */

//     const existingCompany = await pool
//       .request()
//       .query(`
//         SELECT TOP 1
//           CompanyCode,
//           CompanyName
//         FROM dbo.tbl_Company
//         ORDER BY CompanyCode
//       `);


//     if (existingCompany.recordset.length > 0) {

//       return res.status(409).json({
//         success: false,
//         message:
//           "Only one company is allowed. Company already exists.",
//         data: existingCompany.recordset[0],
//       });
//     }


//     /* =====================================================
//        USER / NODE
//     ===================================================== */

//     const userCode =
//       Number(req.body.C_User) ||
//       Number(req.body.User) ||
//       1;

//     const nodeCode =
//       Number(req.body.C_Node) ||
//       Number(req.body.Node) ||
//       1;


//     /* =====================================================
//        BANK CODE
//     ===================================================== */

//     let bankCode = null;

//     if (
//       BankCode !== null &&
//       BankCode !== undefined &&
//       String(BankCode).trim() !== ""
//     ) {
//       const parsedBankCode = Number(BankCode);

//       if (
//         !Number.isInteger(parsedBankCode) ||
//         parsedBankCode <= 0
//       ) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid bank code",
//         });
//       }

//       bankCode = parsedBankCode;
//     }


//     /* =====================================================
//        CALL STORED PROCEDURE
//     ===================================================== */

//     const result = await pool
//       .request()

//       .input(
//         "CompanyName",
//         sql.VarChar(50),
//         CompanyName.trim()
//       )

//       .input(
//         "Address1",
//         sql.VarChar(50),
//         Address1.trim()
//       )

//       .input(
//         "Address2",
//         sql.VarChar(50),
//         Address2
//           ? String(Address2).trim()
//           : ""
//       )

//       .input(
//         "City",
//         sql.VarChar(50),
//         City.trim()
//       )

//       .input(
//         "District",
//         sql.VarChar(50),
//         District.trim()
//       )

//       .input(
//         "Pincode",
//         sql.Char(6),
//         String(Pincode).trim()
//       )

//       .input(
//         "MobileNumber",
//         sql.Char(20),
//         String(MobileNumber).trim()
//       )

//       .input(
//         "BankCode",
//         sql.Int,
//         bankCode
//       )

//       .input(
//         "User",
//         sql.Int,
//         userCode
//       )

//       .input(
//         "Node",
//         sql.Int,
//         nodeCode
//       )

//       .execute("sp_Company_Insert");


//     /* =====================================================
//        PROCEDURE RESPONSE
//     ===================================================== */

//     const procedureData =
//       result.recordset?.[0];


//     if (!procedureData) {

//       return res.status(500).json({
//         success: false,
//         message:
//           "Company procedure did not return a response",
//       });
//     }


//     /* =====================================================
//        SECOND COMPANY
//     ===================================================== */

//     if (
//       Number(procedureData.Success) !== 1
//     ) {

//       return res.status(409).json({
//         success: false,
//         message:
//           procedureData.Message ||
//           "Only one company is allowed.",
//       });
//     }


//     /* =====================================================
//        COMPANY CODE
//     ===================================================== */

//     const companyCode =
//       Number(procedureData.CompanyCode);


//     if (
//       !Number.isInteger(companyCode) ||
//       companyCode <= 0
//     ) {

//       return res.status(500).json({
//         success: false,
//         message:
//           "Company was inserted but CompanyCode was not returned",
//       });
//     }


//     /* =====================================================
//        GET INSERTED COMPANY
//     ===================================================== */

//     const companyResult = await pool
//       .request()
//       .input(
//         "CompanyCode",
//         sql.Int,
//         companyCode
//       )
//       .query(`
//         SELECT
//           c.CompanyCode,
//           c.CompanyName,
//           c.Address1,
//           c.Address2,
//           c.City,
//           c.District,
//           c.Pincode,
//           c.MobileNumber,
//           c.BankCode,
//           b.BankName,
//           c.C_Date,
//           c.C_User,
//           c.C_Node,
//           c.E_Date,
//           c.E_User,
//           c.E_Node
//         FROM dbo.tbl_Company c
//         LEFT JOIN dbo.tbl_Bank b
//           ON b.BankCode = c.BankCode
//         WHERE c.CompanyCode = @CompanyCode
//       `);


//     const company =
//       companyResult.recordset?.[0];


//     /* =====================================================
//        SUCCESS
//     ===================================================== */

//     return res.status(201).json({
//       success: true,
//       message:
//         procedureData.Message ||
//         "Company added successfully.",
//       data: company,
//     });

//   } catch (error) {

//     console.error(
//       "CREATE COMPANY ERROR:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Failed to create company",
//       error: error.message,
//     });
//   }
// });


// /* =====================================================
//    UPDATE COMPANY
//    PUT /api/companies/:id

//    CompanyCode CANNOT be changed
// ===================================================== */

// router.put("/:id", async (req, res) => {
//   try {

//     const companyCode =
//       Number(req.params.id);


//     /* =====================================================
//        COMPANY CODE VALIDATION
//     ===================================================== */

//     if (
//       !Number.isInteger(companyCode) ||
//       companyCode <= 0
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid company code",
//       });
//     }


//     const {
//       CompanyName,
//       Address1,
//       Address2,
//       City,
//       District,
//       Pincode,
//       MobileNumber,
//       BankCode,
//     } = req.body;


//     /* =====================================================
//        VALIDATION
//     ===================================================== */

//     if (
//       !CompanyName ||
//       typeof CompanyName !== "string" ||
//       !CompanyName.trim()
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Company name is required",
//       });
//     }


//     if (
//       !Address1 ||
//       typeof Address1 !== "string" ||
//       !Address1.trim()
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Address 1 is required",
//       });
//     }


//     if (
//       !City ||
//       typeof City !== "string" ||
//       !City.trim()
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "City is required",
//       });
//     }


//     if (
//       !District ||
//       typeof District !== "string" ||
//       !District.trim()
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "District is required",
//       });
//     }


//     if (
//       !Pincode ||
//       !/^\d{6}$/.test(
//         String(Pincode).trim()
//       )
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Pincode must be exactly 6 digits",
//       });
//     }


//     if (
//       !MobileNumber ||
//       !/^[6-9]\d{9}$/.test(
//         String(MobileNumber).trim()
//       )
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Enter a valid 10 digit mobile number",
//       });
//     }


//     const pool = await getPool();


//     /* =====================================================
//        CHECK COMPANY EXISTS
//     ===================================================== */

//     const existing = await pool
//       .request()
//       .input(
//         "CompanyCode",
//         sql.Int,
//         companyCode
//       )
//       .query(`
//         SELECT
//           CompanyCode
//         FROM dbo.tbl_Company
//         WHERE CompanyCode = @CompanyCode
//       `);


//     if (
//       existing.recordset.length === 0
//     ) {

//       return res.status(404).json({
//         success: false,
//         message: "Company not found",
//       });
//     }


//     /* =====================================================
//        DUPLICATE COMPANY NAME
//     ===================================================== */

//     const duplicate = await pool
//       .request()

//       .input(
//         "CompanyName",
//         sql.VarChar(50),
//         CompanyName.trim()
//       )

//       .input(
//         "CompanyCode",
//         sql.Int,
//         companyCode
//       )

//       .query(`
//         SELECT
//           CompanyCode
//         FROM dbo.tbl_Company
//         WHERE CompanyName = @CompanyName
//           AND CompanyCode <> @CompanyCode
//       `);


//     if (
//       duplicate.recordset.length > 0
//     ) {

//       return res.status(409).json({
//         success: false,
//         message:
//           "Another company already uses this name",
//       });
//     }


//     /* =====================================================
//        USER / NODE
//     ===================================================== */

//     const userCode =
//       Number(req.body.E_User) ||
//       Number(req.body.User) ||
//       1;

//     const nodeCode =
//       Number(req.body.E_Node) ||
//       Number(req.body.Node) ||
//       1;


//     /* =====================================================
//        BANK CODE
//     ===================================================== */

//     let bankCode = null;

//     if (
//       BankCode !== null &&
//       BankCode !== undefined &&
//       String(BankCode).trim() !== ""
//     ) {

//       const parsedBankCode =
//         Number(BankCode);

//       if (
//         !Number.isInteger(parsedBankCode) ||
//         parsedBankCode <= 0
//       ) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid bank code",
//         });
//       }

//       bankCode = parsedBankCode;
//     }


//     /* =====================================================
//        UPDATE
//     ===================================================== */

//     const result = await pool
//       .request()

//       .input(
//         "CompanyCode",
//         sql.Int,
//         companyCode
//       )

//       .input(
//         "CompanyName",
//         sql.VarChar(50),
//         CompanyName.trim()
//       )

//       .input(
//         "Address1",
//         sql.VarChar(50),
//         Address1.trim()
//       )

//       .input(
//         "Address2",
//         sql.VarChar(50),
//         Address2
//           ? String(Address2).trim()
//           : ""
//       )

//       .input(
//         "City",
//         sql.VarChar(50),
//         City.trim()
//       )

//       .input(
//         "District",
//         sql.VarChar(50),
//         District.trim()
//       )

//       .input(
//         "Pincode",
//         sql.Char(6),
//         String(Pincode).trim()
//       )

//       .input(
//         "MobileNumber",
//         sql.Char(20),
//         String(MobileNumber).trim()
//       )

//       .input(
//         "BankCode",
//         sql.Int,
//         bankCode
//       )

//       .input(
//         "E_User",
//         sql.Int,
//         userCode
//       )

//       .input(
//         "E_Node",
//         sql.Int,
//         nodeCode
//       )

//       .query(`
//         UPDATE dbo.tbl_Company
//         SET
//           CompanyName = @CompanyName,
//           Address1 = @Address1,
//           Address2 = @Address2,
//           City = @City,
//           District = @District,
//           Pincode = @Pincode,
//           MobileNumber = @MobileNumber,
//           BankCode = @BankCode,
//           E_Date = GETDATE(),
//           E_User = @E_User,
//           E_Node = @E_Node

//         OUTPUT
//           INSERTED.CompanyCode,
//           INSERTED.CompanyName,
//           INSERTED.Address1,
//           INSERTED.Address2,
//           INSERTED.City,
//           INSERTED.District,
//           INSERTED.Pincode,
//           INSERTED.MobileNumber,
//           INSERTED.BankCode,
//           INSERTED.C_Date,
//           INSERTED.C_User,
//           INSERTED.C_Node,
//           INSERTED.E_Date,
//           INSERTED.E_User,
//           INSERTED.E_Node

//         WHERE CompanyCode = @CompanyCode
//       `);


//     /* =====================================================
//        SUCCESS
//     ===================================================== */

//     return res.json({
//       success: true,
//       message:
//         "Company updated successfully",
//       data: result.recordset[0],
//     });

//   } catch (error) {

//     console.error(
//       "UPDATE COMPANY ERROR:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Failed to update company",
//       error: error.message,
//     });
//   }
// });


// /* =====================================================
//    DELETE COMPANY

//    DELETE DISABLED

//    DELETE /api/companies/:id
// ===================================================== */

// router.delete("/:id", async (req, res) => {

//   return res.status(403).json({
//     success: false,
//     message:
//       "Company deletion is disabled. Only one company is allowed.",
//   });

// });


// /* =====================================================
//    EXPORT ROUTER
// ===================================================== */

// module.exports = router;


const express = require("express");
const jwt = require("jsonwebtoken");
const { getPool, sql } = require("../config/db");

const router = express.Router();

// =====================================================
// AUTHENTICATION
// =====================================================

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "ipltemple_secret_2026";

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
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    console.error("COMPANY AUTH ERROR:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// =====================================================
// GET ALL COMPANIES
// GET /api/companies
// =====================================================

router.get("/", authenticateToken, async (req, res) => {
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
      FROM dbo.tbl_Company c
      LEFT JOIN dbo.tbl_Bank b
        ON b.BankCode = c.BankCode
      ORDER BY c.CompanyCode
    `);

    return res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error("GET COMPANIES ERROR:", error);

    return res.status(500).json({
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

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const companyCode = Number(req.params.id);

    if (!Number.isInteger(companyCode) || companyCode <= 0) {
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
        FROM dbo.tbl_Company c
        LEFT JOIN dbo.tbl_Bank b
          ON b.BankCode = c.BankCode
        WHERE c.CompanyCode = @CompanyCode
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    return res.json({
      success: true,
      data: result.recordset[0],
    });
  } catch (error) {
    console.error("GET COMPANY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load company",
      error: error.message,
    });
  }
});

// =====================================================
// CREATE COMPANY
// POST /api/companies
//
// ONLY ONE COMPANY ALLOWED
// =====================================================

router.post("/", authenticateToken, async (req, res) => {
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

    // =================================================
    // VALIDATE LOGGED-IN USER
    // =================================================

    const userCode = Number(req.user?.UserCode);

    if (!Number.isInteger(userCode) || userCode <= 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid user information in token",
      });
    }

    // =================================================
    // COMPANY NAME
    // =================================================

    if (
      !CompanyName ||
      typeof CompanyName !== "string" ||
      !CompanyName.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    if (CompanyName.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: "Company name cannot exceed 50 characters",
      });
    }

    // =================================================
    // ADDRESS 1
    // =================================================

    if (
      !Address1 ||
      typeof Address1 !== "string" ||
      !Address1.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Address 1 is required",
      });
    }

    if (Address1.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: "Address 1 cannot exceed 50 characters",
      });
    }

    // =================================================
    // ADDRESS 2
    // =================================================

    const cleanAddress2 =
      Address2 !== undefined &&
      Address2 !== null
        ? String(Address2).trim()
        : "";

    if (cleanAddress2.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Address 2 cannot exceed 50 characters",
      });
    }

    // =================================================
    // CITY
    // =================================================

    if (
      !City ||
      typeof City !== "string" ||
      !City.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "City is required",
      });
    }

    if (City.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: "City cannot exceed 50 characters",
      });
    }

    // =================================================
    // DISTRICT
    // =================================================

    if (
      !District ||
      typeof District !== "string" ||
      !District.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "District is required",
      });
    }

    if (District.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: "District cannot exceed 50 characters",
      });
    }

    // =================================================
    // PINCODE
    // =================================================

    const cleanPincode =
      Pincode !== undefined &&
      Pincode !== null
        ? String(Pincode).trim()
        : "";

    if (!/^\d{6}$/.test(cleanPincode)) {
      return res.status(400).json({
        success: false,
        message: "Pincode must be exactly 6 digits",
      });
    }

    // =================================================
    // MOBILE
    // =================================================

    const cleanMobile =
      MobileNumber !== undefined &&
      MobileNumber !== null
        ? String(MobileNumber).trim()
        : "";

    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      return res.status(400).json({
        success: false,
        message:
          "Enter a valid 10 digit mobile number",
      });
    }

    // =================================================
    // DATABASE
    // =================================================

    const pool = await getPool();

    // =================================================
    // CHECK EXISTING COMPANY
    //
    // Only one company is allowed.
    // =================================================

    const existingCompany = await pool
      .request()
      .query(`
        SELECT TOP 1
          CompanyCode,
          CompanyName
        FROM dbo.tbl_Company
        ORDER BY CompanyCode
      `);

    if (existingCompany.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Only one company is allowed. Company already exists.",
        data: existingCompany.recordset[0],
      });
    }

    // =================================================
    // BANK CODE
    // =================================================

    let bankCode = null;

    if (
      BankCode !== null &&
      BankCode !== undefined &&
      String(BankCode).trim() !== ""
    ) {
      const parsedBankCode = Number(BankCode);

      if (
        !Number.isInteger(parsedBankCode) ||
        parsedBankCode <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid bank code",
        });
      }

      // Verify bank exists
      const bankResult = await pool
        .request()
        .input(
          "BankCode",
          sql.Int,
          parsedBankCode
        )
        .query(`
          SELECT TOP 1
            BankCode
          FROM dbo.tbl_Bank
          WHERE BankCode = @BankCode
        `);

      if (bankResult.recordset.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Selected bank does not exist",
        });
      }

      bankCode = parsedBankCode;
    }

    // =================================================
    // CALL STORED PROCEDURE
    // =================================================

    const result = await pool
      .request()
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
        cleanAddress2
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
        cleanPincode
      )
      .input(
        "MobileNumber",
        sql.Char(20),
        cleanMobile
      )
      .input(
        "BankCode",
        sql.Int,
        bankCode
      )
      .input(
        "User",
        sql.Int,
        userCode
      )
      .input(
        "Node",
        sql.Int,
        1
      )
      .execute("sp_Company_Insert");

    // =================================================
    // PROCEDURE RESPONSE
    // =================================================

    const procedureData =
      result.recordset?.[0];

    if (!procedureData) {
      return res.status(500).json({
        success: false,
        message:
          "Company procedure did not return a response",
      });
    }

    // =================================================
    // PROCEDURE FAILURE
    // =================================================

    if (Number(procedureData.Success) !== 1) {
      return res.status(409).json({
        success: false,
        message:
          procedureData.Message ||
          "Only one company is allowed.",
      });
    }

    // =================================================
    // COMPANY CODE
    // =================================================

    const companyCode =
      Number(procedureData.CompanyCode);

    if (
      !Number.isInteger(companyCode) ||
      companyCode <= 0
    ) {
      return res.status(500).json({
        success: false,
        message:
          "Company was inserted but CompanyCode was not returned",
      });
    }

    // =================================================
    // GET INSERTED COMPANY
    // =================================================

    const companyResult = await pool
      .request()
      .input(
        "CompanyCode",
        sql.Int,
        companyCode
      )
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
        FROM dbo.tbl_Company c
        LEFT JOIN dbo.tbl_Bank b
          ON b.BankCode = c.BankCode
        WHERE c.CompanyCode = @CompanyCode
      `);

    const company =
      companyResult.recordset?.[0];

    // =================================================
    // SUCCESS
    // =================================================

    return res.status(201).json({
      success: true,
      message:
        procedureData.Message ||
        "Company added successfully.",
      data: company,
    });
  } catch (error) {
    console.error(
      "CREATE COMPANY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create company",
      error: error.message,
    });
  }
});

// =====================================================
// UPDATE COMPANY
// PUT /api/companies/:id
//
// CompanyCode CANNOT be changed
// =====================================================

router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const companyCode =
      Number(req.params.id);

    // =================================================
    // COMPANY CODE
    // =================================================

    if (
      !Number.isInteger(companyCode) ||
      companyCode <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid company code",
      });
    }

    // =================================================
    // LOGGED-IN USER
    // =================================================

    const userCode = Number(req.user?.UserCode);

    if (!Number.isInteger(userCode) || userCode <= 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid user information in token",
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

    // =================================================
    // VALIDATION
    // =================================================

    if (
      !CompanyName ||
      typeof CompanyName !== "string" ||
      !CompanyName.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    if (CompanyName.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: "Company name cannot exceed 50 characters",
      });
    }

    if (
      !Address1 ||
      typeof Address1 !== "string" ||
      !Address1.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Address 1 is required",
      });
    }

    if (Address1.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: "Address 1 cannot exceed 50 characters",
      });
    }

    const cleanAddress2 =
      Address2 !== undefined &&
      Address2 !== null
        ? String(Address2).trim()
        : "";

    if (cleanAddress2.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Address 2 cannot exceed 50 characters",
      });
    }

    if (
      !City ||
      typeof City !== "string" ||
      !City.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "City is required",
      });
    }

    if (City.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: "City cannot exceed 50 characters",
      });
    }

    if (
      !District ||
      typeof District !== "string" ||
      !District.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "District is required",
      });
    }

    if (District.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: "District cannot exceed 50 characters",
      });
    }

    const cleanPincode =
      Pincode !== undefined &&
      Pincode !== null
        ? String(Pincode).trim()
        : "";

    if (!/^\d{6}$/.test(cleanPincode)) {
      return res.status(400).json({
        success: false,
        message: "Pincode must be exactly 6 digits",
      });
    }

    const cleanMobile =
      MobileNumber !== undefined &&
      MobileNumber !== null
        ? String(MobileNumber).trim()
        : "";

    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      return res.status(400).json({
        success: false,
        message:
          "Enter a valid 10 digit mobile number",
      });
    }

    // =================================================
    // DATABASE
    // =================================================

    const pool = await getPool();

    // =================================================
    // CHECK COMPANY EXISTS
    // =================================================

    const existing = await pool
      .request()
      .input(
        "CompanyCode",
        sql.Int,
        companyCode
      )
      .query(`
        SELECT
          CompanyCode
        FROM dbo.tbl_Company
        WHERE CompanyCode = @CompanyCode
      `);

    if (existing.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // =================================================
    // DUPLICATE COMPANY NAME
    // =================================================

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
        SELECT
          CompanyCode
        FROM dbo.tbl_Company
        WHERE CompanyName = @CompanyName
          AND CompanyCode <> @CompanyCode
      `);

    if (duplicate.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Another company already uses this name",
      });
    }

    // =================================================
    // BANK CODE
    // =================================================

    let bankCode = null;

    if (
      BankCode !== null &&
      BankCode !== undefined &&
      String(BankCode).trim() !== ""
    ) {
      const parsedBankCode =
        Number(BankCode);

      if (
        !Number.isInteger(parsedBankCode) ||
        parsedBankCode <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid bank code",
        });
      }

      // Verify bank exists
      const bankResult = await pool
        .request()
        .input(
          "BankCode",
          sql.Int,
          parsedBankCode
        )
        .query(`
          SELECT TOP 1
            BankCode
          FROM dbo.tbl_Bank
          WHERE BankCode = @BankCode
        `);

      if (bankResult.recordset.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Selected bank does not exist",
        });
      }

      bankCode = parsedBankCode;
    }

    // =================================================
    // UPDATE
    // =================================================

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
        cleanAddress2
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
        cleanPincode
      )
      .input(
        "MobileNumber",
        sql.Char(20),
        cleanMobile
      )
      .input(
        "BankCode",
        sql.Int,
        bankCode
      )
      .input(
        "E_User",
        sql.Int,
        userCode
      )
      .input(
        "E_Node",
        sql.Int,
        1
      )
      .query(`
        UPDATE dbo.tbl_Company
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

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // =================================================
    // SUCCESS
    // =================================================

    return res.json({
      success: true,
      message: "Company updated successfully",
      data: result.recordset[0],
    });
  } catch (error) {
    console.error(
      "UPDATE COMPANY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update company",
      error: error.message,
    });
  }
});

// =====================================================
// DELETE COMPANY
//
// DELETE DISABLED
//
// DELETE /api/companies/:id
// =====================================================

router.delete(
  "/:id",
  authenticateToken,
  async (req, res) => {
    return res.status(403).json({
      success: false,
      message:
        "Company deletion is disabled. Only one company is allowed.",
    });
  }
);

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;