import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    username: "",
    password: "",
    fyCode: "",
  });

  const [financialYears, setFinancialYears] = useState([]);
  const [loadingYears, setLoadingYears] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD FINANCIAL YEARS
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const loadFinancialYears = async () => {
      console.log("=================================");
      console.log("LOADING FINANCIAL YEARS");
      console.log("=================================");

      try {
        setLoadingYears(true);
        setError("");

        const response = await api.get(
          "/auth/financial-years"
        );

        console.log(
          "FINANCIAL YEAR API RESPONSE:",
          response
        );

        console.log(
          "FINANCIAL YEAR RESPONSE DATA:",
          response.data
        );

        // -------------------------------------------------
        // SUPPORT NORMAL RESPONSE
        // {
        //   success: true,
        //   data: [...]
        // }
        // -------------------------------------------------

        let years = [];

        if (
          response.data &&
          Array.isArray(response.data.data)
        ) {
          years = response.data.data;
        }

        // -------------------------------------------------
        // FALLBACK
        // -------------------------------------------------

        if (
          years.length === 0 &&
          response.data &&
          Array.isArray(response.data.financialYears)
        ) {
          years = response.data.financialYears;
        }

        console.log(
          "FINANCIAL YEARS ARRAY:",
          years
        );

        if (!mounted) {
          return;
        }

        setFinancialYears(years);

        // -------------------------------------------------
        // AUTOMATICALLY SELECT FIRST YEAR
        // -------------------------------------------------

        if (years.length > 0) {
          const firstYear = years[0];

          console.log(
            "SELECTING FINANCIAL YEAR:",
            firstYear
          );

          setForm((prev) => ({
            ...prev,
            fyCode: String(firstYear.FYCode),
          }));
        } else {
          console.warn(
            "NO FINANCIAL YEARS RETURNED FROM API"
          );

          setError(
            "No Financial Years found in database"
          );
        }
      } catch (err) {
        console.error(
          "================================="
        );

        console.error(
          "FINANCIAL YEAR LOAD ERROR"
        );

        console.error(err);

        console.error(
          "STATUS:",
          err.response?.status
        );

        console.error(
          "RESPONSE:",
          err.response?.data
        );

        console.error(
          "================================="
        );

        if (!mounted) {
          return;
        }

        setFinancialYears([]);

        setError(
          err.response?.data?.message ||
            "Unable to load financial years"
        );
      } finally {
        if (mounted) {
          setLoadingYears(false);
        }
      }
    };

    loadFinancialYears();

    return () => {
      mounted = false;
    };
  }, []);

  // =====================================================
  // CHANGE
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!form.username.trim()) {
      setError("Please enter username");
      return;
    }

    if (!form.password) {
      setError("Please enter password");
      return;
    }

    if (!form.fyCode) {
      setError("Please select Financial Year");
      return;
    }

    try {
      setLoading(true);

      console.log("=================================");
      console.log("LOGIN");
      console.log("Username:", form.username);
      console.log("FYCode:", form.fyCode);
      console.log("=================================");

      const response = await api.post(
        "/auth/login",
        {
          username: form.username.trim(),
          password: form.password,
          fyCode: Number(form.fyCode),
        }
      );

      console.log(
        "LOGIN RESPONSE:",
        response.data
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Login failed"
        );
      }

      // -------------------------------------------------
      // STORE AUTH
      // -------------------------------------------------

      login(response.data);

      // -------------------------------------------------
      // DASHBOARD
      // -------------------------------------------------

      navigate("/dashboard", {
        replace: true,
      });
    } catch (err) {
      console.error(
        "LOGIN ERROR:",
        err
      );

      console.error(
        "LOGIN BACKEND RESPONSE:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Invalid username, password or financial year"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="login-page">

      {/* =================================================
          LEFT
      ================================================= */}

      <div className="login-left">

        <div className="temple-symbol">
          🛕
        </div>

        <h1>
          Temple Management
        </h1>

        <p>
          Manage your temple administration
        </p>

      </div>

      {/* =================================================
          RIGHT
      ================================================= */}

      <div className="login-right">

        <div className="login-card">

          {/* HEADER */}

          <div className="login-header">

            <h2>
              Welcome Back
            </h2>

            <p>
              Sign in to your administrator account
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* FORM */}

          <form onSubmit={handleSubmit}>

            {/* USERNAME */}

            <div className="form-group">

              <label htmlFor="username">
                Username
              </label>

              <input
                id="username"
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter username"
                autoComplete="username"
                disabled={loading}
              />

            </div>

            {/* PASSWORD */}

            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                autoComplete="current-password"
                disabled={loading}
              />

            </div>

            {/* FINANCIAL YEAR */}

            <div className="form-group">

              <label htmlFor="fyCode">
                Financial Year
              </label>

              <select
                id="fyCode"
                name="fyCode"
                value={form.fyCode}
                onChange={handleChange}
                disabled={
                  loadingYears ||
                  loading
                }
              >

                {/* DEFAULT */}

                <option value="">
                  {loadingYears
                    ? "Loading financial years..."
                    : financialYears.length === 0
                    ? "No Financial Year available"
                    : "Select Financial Year"}
                </option>

                {/* YEARS */}

                {financialYears.map(
                  (item) => (
                    <option
                      key={item.FYCode}
                      value={item.FYCode}
                    >
                      {item.FYear}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="primary-button login-button"
              disabled={
                loading ||
                loadingYears ||
                financialYears.length === 0
              }
            >
              {loading
                ? "Signing in..."
                : "Login"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default Login;