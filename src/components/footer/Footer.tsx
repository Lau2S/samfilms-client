import React from "react";
import { Link } from "react-router";
import "./Footer.scss";

/**
 * Application footer with a quick link to the site map.
 *
 * @component
 * @returns {JSX.Element} Footer navigation for secondary routes.
 */
const Footer: React.FC = () => {
  return (
    <footer>
      <p>©2025 SamFilms. Todos los derechos reservados.</p>
      <Link to="/mapa-sitio">Mapa del Sitio</Link>
      <span className="footer-separator"> | </span>
      <a 
        href="/manual-usuario-samfilms.pdf" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        Manual de Usuario
      </a>
    </footer>
  );
};

export default Footer;