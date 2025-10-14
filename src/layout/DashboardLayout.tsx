import React from "react";
import DashboardNavbar from "../components/navbar/DashboardNavbar";
import "./DashboardLayout.scss";
import { Outlet } from "react-router";

/**
 * Layout for authenticated users (dashboard).
 * Renders DashboardNavbar without footer.
 *
 * @component
 * @returns {JSX.Element} The layout wrapper for dashboard pages.
 */
const DashboardLayout: React.FC = () => {
  return (
    <>
      <DashboardNavbar />
      <main className="dashboard-main">
        <Outlet />
      </main>
    </>
  );
};

export default DashboardLayout;