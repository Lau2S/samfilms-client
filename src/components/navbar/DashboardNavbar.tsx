import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import "./DashboardNavbar.scss";

/**
 * Dashboard navigation bar for authenticated users.
 * Shows a different layout compared to the main navbar.
 *
 * @component
 * @returns {JSX.Element} Dashboard navigation with search and user menu.
 */
const DashboardNavbar: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-wrapper') && isUserMenuOpen) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isUserMenuOpen]);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="dashboard-navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/peliculas" className="navbar-brand">
          <img src="/logo.png" alt="SamFilms Logo" className="brand-logo" />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="nav-links">
          <Link to="/peliculas">Inicio</Link>
          <Link to="/catalogo">Películas</Link>
          <Link to="/favoritos">Favoritos</Link>
        </div>

        {/* Search Bar - Desktop */}
        <div className="search-container">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input 
            type="text" 
            placeholder="Buscar películas" 
            className="search-input"
          />
        </div>

        {/* Right Section - Desktop */}
        <div className="navbar-right">
          {/* User Menu */}
          <div className="user-menu-wrapper">
            <button
              className="user-menu-trigger"
              onClick={(e) => {
                e.stopPropagation();
                setIsUserMenuOpen(!isUserMenuOpen);
              }}
              aria-label="Menú de usuario"
              aria-expanded={isUserMenuOpen}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>

            {isUserMenuOpen && (
              <div className="user-dropdown">
                <Link to="/perfil" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                  Mi Perfil
                </Link>
                <hr />
                <button onClick={handleLogout} className="dropdown-item logout-btn">
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
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
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          {/* Mobile Search */}
          <div className="mobile-search">
            <div className="search-container">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input 
                type="text" 
                placeholder="Buscar películas" 
              />
            </div>
          </div>

          {/* Mobile Navigation Links */}
          <Link 
            to="/peliculas" 
            className="mobile-menu-item"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Inicio
          </Link>
          <Link 
            to="/catalogo" 
            className="mobile-menu-item"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Películas
          </Link>
          <Link 
            to="/favoritos" 
            className="mobile-menu-item"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Favoritos
          </Link>
          <Link 
            to="/perfil" 
            className="mobile-menu-item"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Mi Perfil
          </Link>
          <button onClick={handleLogout} className="mobile-menu-item logout-btn">
            Cerrar Sesión
          </button>
        </div>
      )}
    </nav>
  );
};

export default DashboardNavbar;