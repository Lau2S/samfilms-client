import React from "react";
import { Link, useNavigate } from "react-router";
import "./Navbar.scss";

/**
 * Global navigation bar providing primary links to key routes.
 *
 * @component
 * @returns {JSX.Element} A semantic navigation element with app links.
 * @accessibility
 * Uses semantic <nav> and <a> (via Link) for keyboard and screen reader navigation.
 */
const Navbar: React.FC = () => {
  const navigate = useNavigate();
  return (
    <nav>
      <Link to="/">
        <img
          src="/logo.png"
          alt="SamFilms Logo"
          className="nav-logo"
        />      
      </Link>
    
      
      <div className="nav-links">
        <Link to="/">Inicio</Link>
        <Link to="/peliculas">Peliculas</Link>
        <Link to="/sobre-nosotros">Sobre Nosotros</Link>
      </div>
      
      <div className="auth-buttons">
        <button className="btn-register" onClick={() => navigate("/registro")}>Registrate</button>
        <button className="btn-login" onClick={() => navigate("/inicio-sesion")}>
          Inicia Sesion
          </button>
      </div>
    </nav>
  );
};

export default Navbar;