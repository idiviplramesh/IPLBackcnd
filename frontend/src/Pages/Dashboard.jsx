import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const navigate = useNavigate();

  const {
    user,
    isAdmin,
  } = useAuth();

  // =====================================================
  // USER DETAILS
  // =====================================================

  const userCode =
    user?.UserCode ??
    user?.UserID ??
    "-";

  const userName =
    user?.UserName ||
    "-";

  const userType =
    String(user?.UserType || "")
      .trim()
      .toUpperCase() || "-";

  // =====================================================
  // RENDER
  //
  // NOTE: The header and sidebar are already rendered by
  // <DashboardLayout /> (via <Navbar /> and <Sidebar />),
  // which wraps this component through <Outlet />.
  // This component must ONLY render the page content that
  // belongs inside <main className="page-content">.
  // Do NOT re-render header/sidebar markup here — doing so
  // is what caused the duplicated header/sidebar bug.
  // =====================================================

  return (
    <div className="dashboard-content">

      {/* PAGE HEADER */}

      <div className="page-heading">

        <div>
          <h1>
            Dashboard
          </h1>

          <p>
            Welcome back,{" "}
            <strong>
              {userName}
            </strong>
          </p>
        </div>

        <div className="page-heading-right">
          Temple Management
        </div>

      </div>

      {/* =================================================
          USER INFORMATION CARDS
      ================================================= */}

      <div className="dashboard-cards">

        {/* USER CODE */}

        <div className="dashboard-card">

          <div className="card-icon">
            👤
          </div>

          <div className="card-content">

            <span className="card-label">
              User Code
            </span>

            <strong className="card-value">
              {userCode}
            </strong>

          </div>

        </div>

        {/* USERNAME */}

        <div className="dashboard-card">

          <div className="card-icon">
            😊
          </div>

          <div className="card-content">

            <span className="card-label">
              Username
            </span>

            <strong className="card-value">
              {userName}
            </strong>

          </div>

        </div>

        {/* USER TYPE */}

        <div className="dashboard-card">

          <div className="card-icon">
            🔐
          </div>

          <div className="card-content">

            <span className="card-label">
              User Type
            </span>

            <strong className="card-value">
              {userType}
            </strong>

          </div>

        </div>

      </div>

      {/* =================================================
          ADMINISTRATION
      ================================================= */}

      {isAdmin && (
        <section className="admin-section">

          <div className="section-header">

            <h2>
              Administration
            </h2>

            <p>
              Manage system users and settings
            </p>

          </div>

          <div className="admin-actions">

            {/* ADD USER */}

            <button
              type="button"
              className="admin-action-card"
              onClick={() =>
                navigate("/add-user")
              }
            >
              <div className="action-icon">
                👤
              </div>

              <div>
                <strong>
                  Add User
                </strong>

                <span>
                  Create a new system user
                </span>
              </div>

              <b>
                →
              </b>

            </button>

            {/* USERS */}

            <button
              type="button"
              className="admin-action-card"
              onClick={() =>
                navigate("/users")
              }
            >
              <div className="action-icon">
                👥
              </div>

              <div>
                <strong>
                  Users
                </strong>

                <span>
                  View and manage users
                </span>
              </div>

              <b>
                →
              </b>

            </button>

            {/* SETTINGS */}

            <button
              type="button"
              className="admin-action-card"
              onClick={() =>
                navigate("/settings")
              }
            >
              <div className="action-icon">
                ⚙️
              </div>

              <div>
                <strong>
                  Settings
                </strong>

                <span>
                  System settings
                </span>
              </div>

              <b>
                →
              </b>

            </button>

          </div>

        </section>
      )}

    </div>
  );
}

export default Dashboard;