import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const { user, isAdmin } = useAuth();

  const [masterOpen, setMasterOpen] = useState(true);
  const [transactionOpen, setTransactionOpen] = useState(true);
  const [reportsOpen, setReportsOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(true);

  const masterMenuItems = [
    {
      name: "Bank Master",
      path: "/banks",
      icon: "🏦",
    },
    {
      name: "Area Master",
      path: "/areas",
      icon: "📍",
    },
    {
      name: "Company Master",
      path: "/companies",
      icon: "🏢",
    },
    {
      name: "Member Master",
      path: "/members",
      icon: "👤",
    },
    {
      name: "Head Master",
      path: "/heads",
      icon: "📋",
    },
    {
      name: "Opening Balance",
      path: "/opening-balance",
      icon: "💰",
    },
  ];

  const transactionMenuItems = [
    {
      name: "Payment",
      path: "/payments",
      icon: "💸",
    },
    {
      name: "Receipt",
      path: "/receipts",
      icon: "💵",
    },
  ];

  const reportMenuItems = [
    {
      name: "Payment & Receipt Reports",
      path: "/reports",
      icon: "📊",
    },
    {
      name: "Day Book",
      path: "/reports/day-book",
      icon: "📖",
    },
  ];

  const adminMenuItems = [
    {
      name: "Add User",
      path: "/add-user",
      icon: "➕",
    },
    {
      name: "Settings",
      path: "/settings",
      icon: "⚙️",
    },
  ];

  const renderMenuItem = (item) => (
    <NavLink
      key={item.path}
      to={item.path}
      className={({ isActive }) =>
        `sidebar-link ${isActive ? "active" : ""}`
      }
    >
      <span className="sidebar-link-icon">{item.icon}</span>
      <span className="sidebar-link-text">{item.name}</span>
    </NavLink>
  );

  return (
    <aside className="sidebar">

      {/* =====================================================
          LOGO
      ===================================================== */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          🛕
        </div>

        <div>
          <div className="sidebar-title">
            IPL Temple
          </div>

          <div className="sidebar-subtitle">
            Management System
          </div>
        </div>
      </div>

      {/* =====================================================
          USER / FY
      ===================================================== */}
      <div className="sidebar-user-box">

        <div className="sidebar-user-avatar">
          {user?.UserName
            ? user.UserName.charAt(0).toUpperCase()
            : "U"}
        </div>

        <div className="sidebar-user-info">
          <div className="sidebar-user-name">
            {user?.UserName || "User"}
          </div>

          <div className="sidebar-user-type">
            {user?.UserType || "User"}
          </div>
        </div>

      </div>

      {user?.FYear && (
        <div className="sidebar-fy">
          <span className="sidebar-fy-label">
            Financial Year
          </span>

          <span className="sidebar-fy-value">
            {user.FYear}
          </span>
        </div>
      )}

      {/* =====================================================
          MAIN NAVIGATION
      ===================================================== */}
      <nav className="sidebar-navigation">

        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `sidebar-main-link ${
              isActive ? "active" : ""
            }`
          }
        >
          <span className="sidebar-main-icon">
            🏠
          </span>

          <span>
            Dashboard
          </span>
        </NavLink>


        {/* =================================================
            MASTER
        ================================================= */}
        <div className="sidebar-section">

          <button
            type="button"
            className={`sidebar-section-header ${
              masterOpen ? "open" : ""
            }`}
            onClick={() =>
              setMasterOpen(!masterOpen)
            }
          >
            <span className="sidebar-section-left">
              <span className="sidebar-section-icon">
                📂
              </span>

              <span>
                Master
              </span>
            </span>

            <span className="sidebar-arrow">
              {masterOpen ? "⌃" : "⌄"}
            </span>
          </button>

          {masterOpen && (
            <div className="sidebar-submenu">
              {masterMenuItems.map(renderMenuItem)}
            </div>
          )}

        </div>


        {/* =================================================
            TRANSACTIONS
        ================================================= */}
        <div className="sidebar-section">

          <button
            type="button"
            className={`sidebar-section-header ${
              transactionOpen ? "open" : ""
            }`}
            onClick={() =>
              setTransactionOpen(
                !transactionOpen
              )
            }
          >
            <span className="sidebar-section-left">
              <span className="sidebar-section-icon">
                💰
              </span>

              <span>
                Transactions
              </span>
            </span>

            <span className="sidebar-arrow">
              {transactionOpen ? "⌃" : "⌄"}
            </span>
          </button>

          {transactionOpen && (
            <div className="sidebar-submenu">
              {transactionMenuItems.map(
                renderMenuItem
              )}
            </div>
          )}

        </div>


        {/* =================================================
            REPORTS
        ================================================= */}
        <div className="sidebar-section">

          <button
            type="button"
            className={`sidebar-section-header ${
              reportsOpen ? "open" : ""
            }`}
            onClick={() =>
              setReportsOpen(!reportsOpen)
            }
          >
            <span className="sidebar-section-left">
              <span className="sidebar-section-icon">
                📈
              </span>

              <span>
                Reports
              </span>
            </span>

            <span className="sidebar-arrow">
              {reportsOpen ? "⌃" : "⌄"}
            </span>
          </button>

          {reportsOpen && (
            <div className="sidebar-submenu">
              {reportMenuItems.map(
                renderMenuItem
              )}
            </div>
          )}

        </div>


        {/* =================================================
            ADMIN (ADMIN USERS ONLY)
        ================================================= */}
        {isAdmin && (
          <div className="sidebar-section">

            <button
              type="button"
              className={`sidebar-section-header ${
                adminOpen ? "open" : ""
              }`}
              onClick={() =>
                setAdminOpen(!adminOpen)
              }
            >
              <span className="sidebar-section-left">
                <span className="sidebar-section-icon">
                  ⚙️
                </span>

                <span>
                  Administration
                </span>
              </span>

              <span className="sidebar-arrow">
                {adminOpen ? "⌃" : "⌄"}
              </span>
            </button>

            {adminOpen && (
              <div className="sidebar-submenu">
                {adminMenuItems.map(
                  renderMenuItem
                )}
              </div>
            )}

          </div>
        )}

      </nav>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <div className="sidebar-footer">
        <div>
          IPL Temple
        </div>

        <span>
          © 2026
        </span>
      </div>

    </aside>
  );
}

export default Sidebar;