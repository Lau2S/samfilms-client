import React, { useState, useEffect } from "react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleNavigation = (path: string) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

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
      
        {/* Desktop Navigation Links */}
        <div className="nav-links">
          <Link to="/">Inicio</Link>
          <Link to="/peliculas">Películas</Link>
          <Link to="/sobre-nosotros">Sobre Nosotros</Link>
        </div>
        
        {/* Desktop Auth Buttons */}
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

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu open">
          {/* Mobile Navigation Links */}
          <Link 
            to="/" 
            className="mobile-menu-item"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Inicio
          </Link>
          <Link 
            to="/peliculas" 
            className="mobile-menu-item"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Películas
          </Link>
          <Link 
            to="/sobre-nosotros" 
            className="mobile-menu-item"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Sobre Nosotros
          </Link>

        </div>
      )}
    </nav>
  );
};

export default Navbar;