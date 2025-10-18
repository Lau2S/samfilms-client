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
      <div className="nav-container">
        <Link to="/" className="nav-logo-link">
          <img
            src="/logo.png"
            alt="SamFilms Logo"
            className="nav-logo"
          />      
        </Link>
      
        {/* Navigation Links - Always visible */}
        <div className="nav-links">
          <Link to="/">Inicio</Link>
          <Link to="/peliculas">Películas</Link>
          <Link to="/sobre-nosotros">Sobre Nosotros</Link>
        </div>
        
        {/* Auth Buttons - Always visible */}
        <div className="auth-buttons">
          <button 
            className="btn-register" 
            onClick={() => navigate("/registro")}
          >
            Regístrate
          </button>
          <button 
            className="btn-login" 
            onClick={() => navigate("/inicio-sesion")}
          >
            Inicia Sesión
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;