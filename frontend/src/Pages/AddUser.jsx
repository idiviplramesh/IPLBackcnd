import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function AddUser() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [formData, setFormData] = useState({
    userCode: "",
    username: "",
    password: "",
    userType: "MEMBER",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================================
  // INPUT CHANGE
  // ==========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  // ==========================================================
  // CREATE USER
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!formData.userCode) {
      setError("Please enter User Code.");
      return;
    }

    const userCode =
      Number(formData.userCode);

    if (
      !Number.isInteger(userCode) ||
      userCode <= 0
    ) {
      setError("Please enter a valid User Code.");
      return;
    }

    if (!formData.username.trim()) {
      setError("Please enter Username.");
      return;
    }

    if (
      formData.username.trim().length < 3
    ) {
      setError(
        "Username must contain at least 3 characters."
      );
      return;
    }

    if (!formData.password) {
      setError("Please enter Password.");
      return;
    }

    if (formData.password.length < 4) {
      setError(
        "Password must contain at least 4 characters."
      );
      return;
    }

    if (
      !["ADMIN", "MEMBER"].includes(
        formData.userType
      )
    ) {
      setError("Invalid User Type.");
      return;
    }

    // --------------------------------------------------------
    // TOKEN
    // --------------------------------------------------------

    const token =
      localStorage.getItem("token");

    if (!token) {
      setError(
        "Authentication token not found. Please login again."
      );
      return;
    }

    try {
      setLoading(true);

      // ------------------------------------------------------
      // API
      // /api/auth/create-user
      // ------------------------------------------------------

      const response = await api.post(
        "/auth/create-user",
        {
          userCode,
          username:
            formData.username.trim(),
          password:
            formData.password,
          userType:
            formData.userType,
        }
      );

      if (response.data?.success) {
        setMessage(
          response.data.message ||
            "User created successfully."
        );

        setFormData({
          userCode: "",
          username: "",
          password: "",
          userType: "MEMBER",
        });
      } else {
        setError(
          response.data?.message ||
            "Unable to create user."
        );
      }
    } catch (err) {
      console.error(
        "CREATE USER ERROR:",
        err
      );

      if (
        err.response?.status === 401
      ) {
        setError(
          "Session expired. Please login again."
        );
      } else if (
        err.response?.status === 403
      ) {
        setError(
          "Only ADMIN users can create users."
        );
      } else if (
        err.response?.status === 409
      ) {
        setError(
          err.response?.data?.message ||
            "User Code or Username already exists."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to create user."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // ACCESS CONTROL
  // ==========================================================

  if (!isAdmin) {
    return (
      <div className="page-center">
        <div className="access-denied-card">

          <div className="access-denied-icon">
            🔒
          </div>

          <h2>
            Access Denied
          </h2>

          <p>
            Only administrators can create users.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
            className="primary-button"
          >
            Go to Dashboard
          </button>

        </div>
      </div>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="add-user-page">

      {/* PAGE HEADER */}

      <div className="page-title-row">

        <div>
          <h2>Add User</h2>

          <p>
            Create a new system user
          </p>
        </div>

        <button
          type="button"
          className="back-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Back
        </button>

      </div>

      {/* FORM CARD */}

      <div className="form-card">

        <div className="form-card-header">

          <div className="form-header-icon">
            👤
          </div>

          <div>
            <h3>
              User Information
            </h3>

            <p>
              Enter the details to create
              a new user account.
            </p>
          </div>

        </div>

        {/* SUCCESS */}

        {message && (
          <div className="success-message">
            ✓ {message}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="error-message">
            ⚠ {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
        >

          <div className="form-grid">

            {/* USER CODE */}

            <div className="form-group">

              <label htmlFor="userCode">
                User Code
                <span>*</span>
              </label>

              <input
                id="userCode"
                name="userCode"
                type="number"
                min="1"
                placeholder="Enter user code"
                value={
                  formData.userCode
                }
                onChange={handleChange}
                disabled={loading}
              />

              <small>
                Enter a unique user code.
              </small>

            </div>

            {/* USERNAME */}

            <div className="form-group">

              <label htmlFor="username">
                Username
                <span>*</span>
              </label>

              <input
                id="username"
                name="username"
                type="text"
                maxLength="50"
                placeholder="Enter username"
                value={
                  formData.username
                }
                onChange={handleChange}
                disabled={loading}
              />

              <small>
                Minimum 3 characters.
              </small>

            </div>

            {/* PASSWORD */}

            <div className="form-group">

              <label htmlFor="password">
                Password
                <span>*</span>
              </label>

              <input
                id="password"
                name="password"
                type="password"
                maxLength="50"
                placeholder="Enter password"
                value={
                  formData.password
                }
                onChange={handleChange}
                disabled={loading}
              />

              <small>
                Minimum 4 characters.
              </small>

            </div>

            {/* USER TYPE */}

            <div className="form-group">

              <label htmlFor="userType">
                User Type
                <span>*</span>
              </label>

              <select
                id="userType"
                name="userType"
                value={
                  formData.userType
                }
                onChange={handleChange}
                disabled={loading}
              >

                <option value="MEMBER">
                  MEMBER
                </option>

                <option value="ADMIN">
                  ADMIN
                </option>

              </select>

              <small>
                Select the user's system role.
              </small>

            </div>

          </div>

          {/* ACTIONS */}

          <div className="form-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={() =>
                navigate("/dashboard")
              }
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="create-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Creating...
                </>
              ) : (
                <>
                  ✓ Create User
                </>
              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default AddUser;