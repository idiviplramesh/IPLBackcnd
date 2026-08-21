import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Settings() {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  const [message, setMessage] = useState("");

  // =====================================================
  // ADMIN CHECK
  // =====================================================

  if (!isAdmin) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f7fb",
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: "40px",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            textAlign: "center",
          }}
        >
          <h2>Access Denied</h2>

          <p>
            Only administrators can access Settings.
          </p>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "6px",
              background: "#4f46e5",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  // =====================================================
  // CLEAR LOCAL DATA
  // =====================================================

  const handleClearSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setMessage("Local session data cleared.");

    setTimeout(() => {
      navigate("/login", {
        replace: true,
      });
    }, 800);
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="dashboard-layout">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="dashboard-header">

        <div className="dashboard-logo">
          IPL TEMPLE
        </div>

        <div className="dashboard-header-right">

          <span className="logged-user">
            {user?.UserName || "Admin"}
          </span>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* =================================================
          BODY
      ================================================= */}

      <div className="dashboard-body">

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="dashboard-sidebar">

          <div className="menu-title">
            MAIN MENU
          </div>

          <button
            type="button"
            className="menu-item"
            onClick={() => navigate("/dashboard")}
          >
            <span>🏠</span>
            <span>Dashboard</span>
          </button>

          <div className="menu-title admin-title">
            ADMINISTRATION
          </div>

          <button
            type="button"
            className="menu-item"
            onClick={() => navigate("/add-user")}
          >
            <span>👤</span>
            <span>Add User</span>
          </button>

          <button
            type="button"
            className="menu-item"
            onClick={() => navigate("/users")}
          >
            <span>👥</span>
            <span>Users</span>
          </button>

          <button
            type="button"
            className="menu-item"
            onClick={() => navigate("/companies")}
          >
            <span>🏢</span>
            <span>Companies</span>
          </button>

          <button
            type="button"
            className="menu-item active"
            onClick={() => navigate("/settings")}
          >
            <span>⚙️</span>
            <span>Settings</span>
          </button>

        </aside>

        {/* =================================================
            CONTENT
        ================================================= */}

        <main className="dashboard-content">

          <div className="dashboard-heading">

            <h1>
              Settings
            </h1>

            <p>
              Manage system settings and administrator options.
            </p>

          </div>

          {/* =================================================
              SETTINGS GRID
          ================================================= */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
              marginTop: "25px",
            }}
          >

            {/* SYSTEM SETTINGS */}

            <div
              className="dashboard-card"
              style={{
                minHeight: "160px",
              }}
            >

              <div
                style={{
                  fontSize: "30px",
                  marginBottom: "12px",
                }}
              >
                ⚙️
              </div>

              <h3>
                System Settings
              </h3>

              <p>
                Configure system-level options.
              </p>

            </div>

            {/* ADMIN ACCOUNT */}

            <div
              className="dashboard-card"
              style={{
                minHeight: "160px",
              }}
            >

              <div
                style={{
                  fontSize: "30px",
                  marginBottom: "12px",
                }}
              >
                👤
              </div>

              <h3>
                Administrator Account
              </h3>

              <p>
                Username:{" "}
                <strong>
                  {user?.UserName || "-"}
                </strong>
              </p>

              <p>
                User Type:{" "}
                <strong>
                  {user?.UserType || "ADMIN"}
                </strong>
              </p>

            </div>

            {/* SECURITY */}

            <div
              className="dashboard-card"
              style={{
                minHeight: "160px",
              }}
            >

              <div
                style={{
                  fontSize: "30px",
                  marginBottom: "12px",
                }}
              >
                🔐
              </div>

              <h3>
                Security
              </h3>

              <p>
                Manage your current login session.
              </p>

              <button
                type="button"
                onClick={handleClearSession}
                style={{
                  marginTop: "10px",
                  padding: "9px 15px",
                  border: "1px solid #dc2626",
                  borderRadius: "6px",
                  background: "#fff",
                  color: "#dc2626",
                  cursor: "pointer",
                }}
              >
                Clear Session
              </button>

            </div>

          </div>

          {/* =================================================
              ACCOUNT INFORMATION
          ================================================= */}

          <div
            style={{
              marginTop: "25px",
              background: "#fff",
              borderRadius: "12px",
              padding: "25px",
              boxShadow:
                "0 4px 15px rgba(0,0,0,0.06)",
            }}
          >

            <h2>
              Account Information
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "20px",
                marginTop: "20px",
              }}
            >

              <div>
                <div className="card-label">
                  User Code
                </div>

                <strong>
                  {user?.UserCode ??
                    user?.UserID ??
                    "-"}
                </strong>
              </div>

              <div>
                <div className="card-label">
                  Username
                </div>

                <strong>
                  {user?.UserName || "-"}
                </strong>
              </div>

              <div>
                <div className="card-label">
                  User Type
                </div>

                <strong>
                  {String(
                    user?.UserType || "ADMIN"
                  ).toUpperCase()}
                </strong>
              </div>

              <div>
                <div className="card-label">
                  Status
                </div>

                <strong>
                  Active
                </strong>
              </div>

            </div>

          </div>

          {/* =================================================
              MESSAGE
          ================================================= */}

          {message && (
            <div
              style={{
                marginTop: "20px",
                padding: "12px 15px",
                borderRadius: "6px",
                background: "#dcfce7",
                color: "#166534",
              }}
            >
              {message}
            </div>
          )}

          {/* =================================================
              BACK BUTTON
          ================================================= */}

          <div
            style={{
              marginTop: "25px",
            }}
          >

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              style={{
                padding: "10px 20px",
                border: "none",
                borderRadius: "6px",
                background: "#4f46e5",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              ← Back to Dashboard
            </button>

          </div>

        </main>

      </div>

    </div>
  );
}

export default Settings;