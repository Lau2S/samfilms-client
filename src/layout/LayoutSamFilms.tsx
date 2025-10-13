import React from "react";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";
import "./LayoutSamFilms.scss";
import { Outlet } from "react-router";

/**
 * Props accepted by {@link LayoutCrunchyEISC}.
 */
interface LayoutSamFilmsProps {
  /**
   * The page content to render between the shared Navbar and Footer.
   */
  children: React.ReactNode;
}

/**
 * Shared application layout that renders a global navigation bar at the top,
 * the current page content in a `<main>` region, and a footer at the bottom.
 *
 * @component
 * @param {LayoutSamFilmsProps} props - Component properties.
 * @param {React.ReactNode} props.children - Page content to render.
 * @returns {JSX.Element} The layout wrapper for app pages.
 */
const LayoutSamFilms: React.FC<LayoutSamFilmsProps> = ({ children }) => {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
        {children}
      </main>
      <Footer />
    </>
  );
};

export default LayoutSamFilms;