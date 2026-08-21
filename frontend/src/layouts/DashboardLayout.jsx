import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="main-area">
        <Navbar setMobileOpen={setMobileOpen} />

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default DashboardLayout;
