import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

// ============================================================
// PAGES
// ============================================================

import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";

import Bank from "./Pages/Bank";
import Area from "./Pages/Area";
import Company from "./Pages/Company";
import Member from "./Pages/Member";
import Head from "./Pages/HeadMaster";

import OpeningBalance from "./Pages/OpeningBalance";

import Payment from "./Pages/Payment";
import Receipt from "./Pages/Receipt";

import Reports from "./Pages/Reports";
import DayBook from "./Pages/DayBook";

import AddUser from "./Pages/AddUser";
import Settings from "./Pages/Settings";

// ============================================================
// ADMIN ROUTE
// ============================================================

function AdminRoute({ children }) {
  const savedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = savedUser
      ? JSON.parse(savedUser)
      : null;
  } catch (error) {
    console.error("USER JSON ERROR:", error);
    user = null;
  }

  /*
   * ADMIN ACCESS
   *
   * UserCode 1 is treated as the main administrator.
   *
   * UserType ADMIN is also treated as administrator.
   *
   * SMD is also allowed because your current application
   * uses SMD as the administrative user.
   */

  const userCode = Number(user?.UserCode);

  const userType = String(
    user?.UserType || ""
  )
    .trim()
    .toUpperCase();

  const userName = String(
    user?.UserName || ""
  )
    .trim()
    .toUpperCase();

  const isAdmin =
    userCode === 1 ||
    userType === "ADMIN" ||
    userType === "SMD" ||
    userName === "SMD";

  console.log("ADMIN ROUTE CHECK:", {
    userCode,
    userType,
    userName,
    isAdmin,
  });

  if (!isAdmin) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}

// ============================================================
// APP
// ============================================================

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        <Routes>

          {/* ==================================================
              LOGIN
          ================================================== */}

          <Route
            path="/login"
            element={<Login />}
          />


          {/* ==================================================
              PROTECTED APPLICATION
          ================================================== */}

          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >

            {/* ==================================================
                DASHBOARD
            ================================================== */}

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />


            {/* ==================================================
                MASTER
            ================================================== */}

            <Route
              path="/banks"
              element={<Bank />}
            />

            <Route
              path="/areas"
              element={<Area />}
            />

            <Route
              path="/companies"
              element={<Company />}
            />

            <Route
              path="/members"
              element={<Member />}
            />

            <Route
              path="/heads"
              element={<Head />}
            />

            <Route
              path="/opening-balance"
              element={<OpeningBalance />}
            />


            {/* ==================================================
                TRANSACTIONS
            ================================================== */}

            <Route
              path="/payments"
              element={<Payment />}
            />

            <Route
              path="/receipts"
              element={<Receipt />}
            />


            {/* ==================================================
                REPORTS
            ================================================== */}

            <Route
              path="/reports"
              element={<Reports />}
            />

            <Route
              path="/reports/day-book"
              element={<DayBook />}
            />


            {/* ==================================================
                ADMINISTRATION
            ================================================== */}

            <Route
              path="/add-user"
              element={
                <AdminRoute>
                  <AddUser />
                </AdminRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <AdminRoute>
                  <Settings />
                </AdminRoute>
              }
            />

          </Route>


          {/* ==================================================
              DEFAULT
          ================================================== */}

          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          {/* ==================================================
              UNKNOWN URL
          ================================================== */}

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

        </Routes>

      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;