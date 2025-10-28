import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import api from "../../services/api";
import { toast } from 'react-toastify';
import "./DashboardNavbar.scss";

interface SearchResult {
  id: number;
  nombre: string;
  imagen_url: string | null;
  fecha_lanzamiento?: string;
}

const DashboardNavbar: React.FC = () => {
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<number | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-wrapper')) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If query is empty, clear results
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const response: any = await api.searchMovies(query);
        
        if (response.success && response.data) {
          setSearchResults(response.data);
          setShowResults(true);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error('❌ Error en búsqueda:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // Wait 300ms after user stops typing
  };

  const handleMovieClick = (movieId: number) => {
    setShowResults(false);
    setSearchQuery("");
    setSearchResults([]);
    navigate(`/peliculas/${movieId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success('Sesión cerrada');
    navigate("/");
  };

  const getYear = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).getFullYear();
  };

  const getDefaultPoster = () => {
    return 'https://via.placeholder.com/50x75/8b5cf6/ffffff?text=?';
  };

  return (
    <nav className="dashboard-navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/peliculas" className="navbar-brand">
          <img src="/logo.png" alt="SamFilms Logo" className="brand-logo" />
        </Link>

        {/* Navigation Links */}
        <div className="nav-links">
          <Link to="/peliculas">Inicio</Link>
          <Link to="/catalogo">Peliculas</Link>
          <Link to="/favoritos">Favoritos</Link>
        </div>

        {/* Search Bar */}
        <div className="search-container" ref={searchContainerRef}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input 
            type="text" 
            placeholder="Buscar películas" 
            className="search-input"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
          />

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="search-results">
              {isSearching ? (
                <div className="search-status">Buscando...</div>
              ) : searchResults.length > 0 ? (
                <>
                  {searchResults.map((movie) => (
                    <div
                      key={movie.id}
                      className="search-result-item"
                      onClick={() => handleMovieClick(movie.id)}
                    >
                      <img
                        src={movie.imagen_url || getDefaultPoster()}
                        alt={movie.nombre}
                        className="result-poster"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getDefaultPoster();
                        }}
                      />
                      <div className="result-info">
                        <div className="result-title">{movie.nombre}</div>
                        <div className="result-year">{getYear(movie.fecha_lanzamiento)}</div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="search-status">No se encontraron resultados</div>
              )}
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="navbar-right">
          {/* User Menu */}
          <div className="user-menu-wrapper">
            <button
              className="user-menu-trigger"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              aria-label="Menú de usuario"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>

            {isUserMenuOpen && (
              <div className="user-dropdown">
                <Link to="/perfil" className="dropdown-item">
                  Mi Perfil
                </Link>
                <hr />
                <button onClick={handleLogout} className="dropdown-item logout-btn">
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
export default DashboardNavbar;