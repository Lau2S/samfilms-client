import React from "react";
import { Link } from "react-router";
import "./SiteMapPage.scss";

/**
 * Site Map page showing all available features and routes.
 *
 * @component
 * @returns {JSX.Element} Complete site map with organized sections.
 */
const SiteMapPage: React.FC = () => {
  return (
    <div className="sitemap-page">
      <div className="sitemap-container">
        <h1 className="sitemap-title">Mapa del Sitio</h1>
        <p className="sitemap-subtitle">
          Explora todas las funcionalidades de SamFilms
        </p>

        <div className="sitemap-grid">
          {/* Sección: Navegación Principal */}
          <div className="sitemap-section">
            <div className="section-icon">🏠</div>
            <h2>Navegación Principal</h2>
            <ul>
              <li>
                <Link to="/">Inicio</Link>
              </li>
              <li>
                <Link to="/peliculas">Películas</Link>
              </li>
              <li>
                <Link to="/sobre-nosotros">Sobre Nosotros</Link>
              </li>
            </ul>
          </div>

          {/* Sección: Autenticación */}
          <div className="sitemap-section">
            <div className="section-icon">🔐</div>
            <h2>Cuenta de Usuario</h2>
            <ul>
              <li>
                <Link to="/inicio-sesion">Iniciar Sesión</Link>
              </li>
              <li>
                <Link to="/registro">Crear Cuenta</Link>
              </li>
              <li>Recuperar Contraseña</li>
              <li>Cerrar Sesión</li>
            </ul>
          </div>

          {/* Sección: Películas */}
          <div className="sitemap-section">
            <div className="section-icon">🎬</div>
            <h2>Películas</h2>
            <ul>
              <li>
                <Link to="/catalogo">Explorar Catálogo</Link>
              </li>
              <li>Buscar Películas</li>
              <li>Filtrar por Género</li>
              <li>Ver Detalles de Película</li>
              <li>Reproducir Película</li>
            </ul>
          </div>

          {/* Sección: Perfil */}
          <div className="sitemap-section">
            <div className="section-icon">👤</div>
            <h2>Mi Perfil</h2>
            <ul>
              <li>
                <Link to="/perfil">Ver Perfil</Link>
              </li>
              <li>Editar Información Personal</li>
              <li>Cambiar Contraseña</li>
              <li>Actualizar Foto de Perfil</li>
              <li>Eliminar Cuenta</li>
            </ul>
          </div>

          {/* Sección: Favoritos */}
          <div className="sitemap-section">
            <div className="section-icon">❤️</div>
            <h2>Mis Favoritos</h2>
            <ul>
              <li>
                <Link to="/favoritos">Ver Lista de Favoritos</Link>
              </li>
              <li>Agregar a Favoritos</li>
              <li>Eliminar de Favoritos</li>
              <li>Organizar Favoritos</li>
            </ul>
          </div>

          
        </div>

      </div>
    </div>
  );
};

export default SiteMapPage;