import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">

      {/* =============================== */}
      {/* SIDEBAR */}
      {/* =============================== */}

      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* =============================== */}
      {/* MAIN AREA */}
      {/* =============================== */}

      <div className="main-area">

        {/* ============================= */}
        {/* NAVBAR */}
        {/* ============================= */}

        <Navbar
          setMobileOpen={setMobileOpen}
        />

        {/* ============================= */}
        {/* PAGE CONTENT */}
        {/* ============================= */}

        <main className="page-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;