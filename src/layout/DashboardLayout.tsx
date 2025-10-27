import React from "react";
import DashboardNavbar from "../components/navbar/DashboardNavbar";
import "./DashboardLayout.scss";
import { Outlet } from "react-router";
import Footer from "../components/footer/Footer";

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
      <Footer/>
    </>
  );
};

export default DashboardLayout;