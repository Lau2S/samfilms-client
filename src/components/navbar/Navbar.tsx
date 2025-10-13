import React from "react";
import { Link } from "react-router";
import "./Navbar.css";

/**
 * Global navigation bar providing primary links to key routes.
 *
 * @component
 * @returns {JSX.Element} A semantic navigation element with app links.
 * @accessibility
 * Uses semantic <nav> and <a> (via Link) for keyboard and screen reader navigation.
 */
const Navbar: React.FC = () => {
  return (
    <nav>
      <Link to="/">Inicio</Link>
      <Link to="/peliculas">Peliculas</Link>
      <Link to="/sobre-nosotros">Sobre nosotros</Link>
    </nav>
  );
};

export default Navbar;