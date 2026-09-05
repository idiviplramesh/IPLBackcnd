import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

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
  // DAY CLOSING SUMMARY
  // =====================================================

  const getToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [closingDate, setClosingDate] = useState(getToday);

  const [summary, setSummary] = useState({
    totalReceipt: 0,
    totalReceiptAmount: 0,
    totalPayment: 0,
    totalPaymentAmount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD DAY CLOSING SUMMARY
  // =====================================================

  const loadDayClosingSummary = async (date = closingDate) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/day-closing", {
        params: { date },
      });

      const serverSummary = response.data?.summary || {};

      setSummary({
        totalReceipt: Number(serverSummary.totalReceipt) || 0,
        totalReceiptAmount: Number(serverSummary.receiptAmount) || 0,
        totalPayment: Number(serverSummary.totalPayment) || 0,
        totalPaymentAmount: Number(serverSummary.paymentAmount) || 0,
      });
    } catch (err) {
      console.error("Day closing summary error:", err);
      setError(
        err.response?.data?.message ||
        "Unable to load receipt and payment summary."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const refresh = () => {
      const today = getToday();
      setClosingDate((previousDate) => {
        if (previousDate !== today) {
          return today;
        }
        return previousDate;
      });
      loadDayClosingSummary(today);
    };

    refresh();

    // Keep the dashboard current after new receipts/payments are entered.
    const intervalId = window.setInterval(refresh, 30000);

    // Refresh immediately when returning to the dashboard tab.
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // =====================================================
  // FORMAT MONEY
  // =====================================================

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };


  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="dashboard-content">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="page-heading">

        <div>
          <h1>
            Dashboard
          </h1>

          <p>
            Welcome back{" "}
            <strong>
              {userName}
            </strong>
          </p>
        </div>

        <div className="page-heading-right">
          <strong>Day Closing</strong>
          <span className="day-closing-date">
            {new Intl.DateTimeFormat("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }).format(new Date(`${closingDate}T00:00:00`))}
          </span>
        </div>

      </div>


      {/* =================================================
          ERROR MESSAGE
      ================================================= */}

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}


      {/* =================================================
          RECEIPT / PAYMENT SUMMARY
      ================================================= */}

      <div className="dashboard-cards summary-cards">

        {/* =================================================
            TOTAL RECEIPT
        ================================================= */}

        <div className="dashboard-card summary-card receipt-card">

          <div className="card-icon">
            🧾
          </div>

          <div className="card-content">

            <span className="card-label">
              Total Receipt
            </span>

            <strong className="card-value">
              {loading
                ? "Loading..."
                : summary.totalReceipt}
            </strong>

          </div>

        </div>


        {/* =================================================
            RECEIPT AMOUNT
        ================================================= */}

        <div className="dashboard-card summary-card receipt-amount-card">

          <div className="card-icon">
            💰
          </div>

          <div className="card-content">

            <span className="card-label">
              Receipt Amount
            </span>

            <strong className="card-value">

              {loading
                ? "Loading..."
                : formatAmount(
                    summary.totalReceiptAmount
                  )}

            </strong>

          </div>

        </div>


        {/* =================================================
            TOTAL PAYMENT
        ================================================= */}

        <div className="dashboard-card summary-card payment-card">

          <div className="card-icon">
            💳
          </div>

          <div className="card-content">

            <span className="card-label">
              Total Payment
            </span>

            <strong className="card-value">
              {loading
                ? "Loading..."
                : summary.totalPayment}
            </strong>

          </div>

        </div>


        {/* =================================================
            PAYMENT AMOUNT
        ================================================= */}

        <div className="dashboard-card summary-card payment-amount-card">

          <div className="card-icon">
            💵
          </div>

          <div className="card-content">

            <span className="card-label">
              Payment Amount
            </span>

            <strong className="card-value">

              {loading
                ? "Loading..."
                : formatAmount(
                    summary.totalPaymentAmount
                  )}

            </strong>

          </div>

        </div>

      </div>


      {/* =================================================
          USER INFORMATION
      ================================================= */}

      <div className="dashboard-cards">

        {/* =================================================
            USER CODE
        ================================================= */}

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


        {/* =================================================
            USERNAME
        ================================================= */}

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


        {/* =================================================
            USER TYPE
        ================================================= */}

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

            {/* =================================================
                ADD USER
            ================================================= */}

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


            {/* =================================================
                USERS
            ================================================= */}

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


            {/* =================================================
                SETTINGS
            ================================================= */}

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