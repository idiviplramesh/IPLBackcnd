// ============================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    console.error("JWT ERROR:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}


// ============================================================
// CREATE USER
// POST /api/auth/create-user
// ADMIN ONLY
// ============================================================

router.post(
  "/create-user",
  authenticateToken,
  async (req, res) => {
    try {
      console.log("");
      console.log("=================================");
      console.log("CREATE USER REQUEST");
      console.log("=================================");

      // --------------------------------------------------------
      // CHECK ADMIN
      // --------------------------------------------------------

      const loggedInUserType =
        String(req.user?.UserType || "").trim().toUpperCase();

      if (loggedInUserType !== "ADMIN") {
        return res.status(403).json({
          success: false,
          message: "Only ADMIN users can create users.",
        });
      }

      // --------------------------------------------------------
      // GET DATA
      // --------------------------------------------------------

      const {
        userCode,
        username,
        password,
        userType,
      } = req.body;

      // --------------------------------------------------------
      // VALIDATION
      // --------------------------------------------------------

      if (
        userCode === undefined ||
        userCode === null ||
        userCode === ""
      ) {
        return res.status(400).json({
          success: false,
          message: "User Code is required.",
        });
      }

      const cleanUserCode = Number(userCode);

      if (!Number.isInteger(cleanUserCode) || cleanUserCode <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid User Code.",
        });
      }

      const cleanUsername =
        String(username || "").trim();

      const cleanPassword =
        String(password || "");

      const cleanUserType =
        String(userType || "MEMBER")
          .trim()
          .toUpperCase();

      if (!cleanUsername) {
        return res.status(400).json({
          success: false,
          message: "Username is required.",
        });
      }

      if (cleanUsername.length < 3) {
        return res.status(400).json({
          success: false,
          message:
            "Username must contain at least 3 characters.",
        });
      }

      if (cleanUsername.length > 50) {
        return res.status(400).json({
          success: false,
          message:
            "Username cannot exceed 50 characters.",
        });
      }

      if (!cleanPassword) {
        return res.status(400).json({
          success: false,
          message: "Password is required.",
        });
      }

      if (cleanPassword.length < 4) {
        return res.status(400).json({
          success: false,
          message:
            "Password must contain at least 4 characters.",
        });
      }

      if (cleanPassword.length > 50) {
        return res.status(400).json({
          success: false,
          message:
            "Password cannot exceed 50 characters.",
        });
      }

      if (
        cleanUserType !== "ADMIN" &&
        cleanUserType !== "MEMBER"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "User Type must be ADMIN or MEMBER.",
        });
      }

      // --------------------------------------------------------
      // DATABASE
      // --------------------------------------------------------

      const pool = await getPool();

      // --------------------------------------------------------
      // CHECK USER CODE
      // --------------------------------------------------------

      const existingCode =
        await pool
          .request()
          .input(
            "UserCode",
            sql.Int,
            cleanUserCode
          )
          .query(`
            SELECT TOP 1
              UserCode,
              UserName
            FROM dbo.tbl_User
            WHERE UserCode = @UserCode
          `);

      if (existingCode.recordset.length > 0) {
        return res.status(409).json({
          success: false,
          message:
            "User Code already exists.",
        });
      }

      // --------------------------------------------------------
      // CHECK USERNAME
      // --------------------------------------------------------

      const existingUsername =
        await pool
          .request()
          .input(
            "UserName",
            sql.VarChar(50),
            cleanUsername
          )
          .query(`
            SELECT TOP 1
              UserCode,
              UserName
            FROM dbo.tbl_User
            WHERE UserName = @UserName
          `);

      if (existingUsername.recordset.length > 0) {
        return res.status(409).json({
          success: false,
          message:
            "Username already exists.",
        });
      }

      // --------------------------------------------------------
      // INSERT USER
      // --------------------------------------------------------

      await pool
        .request()
        .input(
          "UserCode",
          sql.Int,
          cleanUserCode
        )
        .input(
          "UserName",
          sql.VarChar(50),
          cleanUsername
        )
        .input(
          "Password",
          sql.NVarChar(50),
          cleanPassword
        )
        .input(
          "UserType",
          sql.VarChar(20),
          cleanUserType
        )
        .input(
          "CreatedDate",
          sql.DateTime,
          new Date()
        )
        .query(`
          INSERT INTO dbo.tbl_User
          (
            UserCode,
            UserName,
            Password,
            UserType,
            CreatedDate
          )
          VALUES
          (
            @UserCode,
            @UserName,
            @Password,
            @UserType,
            @CreatedDate
          )
        `);

      console.log(
        "USER CREATED:",
        cleanUserCode,
        cleanUsername,
        cleanUserType
      );

      console.log(
        "================================="
      );

      return res.status(201).json({
        success: true,
        message: "User created successfully.",
        user: {
          UserCode: cleanUserCode,
          UserName: cleanUsername,
          UserType: cleanUserType,
        },
      });

    } catch (error) {
      console.error(
        "CREATE USER ERROR:",
        error
      );

      if (
        error.number === 2627 ||
        error.number === 2601
      ) {
        return res.status(409).json({
          success: false,
          message:
            "User Code or Username already exists.",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Unable to create user.",
        error: error.message,
      });
    }
  }
);