import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Bank from "./Pages/Bank";
import Area from "./Pages/Area";
import Company from "./Pages/Company";
import Member from "./Pages/Member";
import AddUser from "./Pages/AddUser";

// =====================================================
// ADMIN ONLY
// UserCode 1 = ADMIN
// =====================================================

function AdminRoute({ children }) {
  const savedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = savedUser
      ? JSON.parse(savedUser)
      : null;
  } catch {
    user = null;
  }

  const isAdmin =
    Number(user?.UserCode) === 1 ||
    String(user?.UserType || "")
      .trim()
      .toUpperCase() === "ADMIN";

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

// =====================================================
// APP
// =====================================================

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>

        <Routes>

          {/* ========================================= */}
          {/* LOGIN */}
          {/* ========================================= */}

          <Route
            path="/login"
            element={<Login />}
          />

          {/* ========================================= */}
          {/* PROTECTED APPLICATION */}
          {/* ========================================= */}

          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >

            {/* DASHBOARD */}
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            {/* BANK */}
            <Route
              path="/banks"
              element={<Bank />}
            />

            {/* AREA */}
            <Route
              path="/areas"
              element={<Area />}
            />

            {/* COMPANY */}
            <Route
              path="/companies"
              element={<Company />}
            />

            {/* MEMBER */}
            <Route
              path="/members"
              element={<Member />}
            />

            {/* ===================================== */}
            {/* ADMIN ONLY - ADD USER */}
            {/* ===================================== */}

            <Route
              path="/add-user"
              element={
                <AdminRoute>
                  <AddUser />
                </AdminRoute>
              }
            />

          </Route>

          {/* ========================================= */}
          {/* ROOT */}
          {/* ========================================= */}

          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          {/* ========================================= */}
          {/* UNKNOWN URL */}
          {/* ========================================= */}

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

      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;