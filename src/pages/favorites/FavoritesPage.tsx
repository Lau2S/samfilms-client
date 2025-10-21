import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import api from '../../services/api';
import './FavoritesPage.scss';

interface FavoriteMovie {
  id: string;
  pelicula_id: string;
  usuario_id: string;
  created_at: string;
  movie?: {
    id: number;
    nombre: string;
    imagen_url: string | null;
    fecha_lanzamiento?: string;
    calificacion?: number;
  };
}

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);

      const response: any = await api.getFavorites();
      
      if (response.success && response.data) {
        setFavorites(response.data);
      } else {
        setError('No se pudieron cargar los favoritos');
      }
    } catch (err: any) {
      console.error('❌ Error cargando favoritos:', err);
      setError(err.message || 'Error al cargar favoritos');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (movieId: string) => {
    if (!window.confirm('¿Estás seguro de querer eliminar esta película de tus favoritos?')) {
      return;
    }

    try {
      setRemovingId(movieId);
      const response = await api.removeFromFavorites(movieId);
      
      if (response.success) {
        setFavorites(favorites.filter(fav => fav.pelicula_id !== movieId));
        console.log('✅ Eliminado de favoritos');
      }
    } catch (err: any) {
      console.error('❌ Error eliminando favorito:', err);
      alert(err.message || 'Error al eliminar de favoritos');
    } finally {
      setRemovingId(null);
    }
  };

  const handleMovieClick = (movieId: string) => {
    navigate(`/peliculas/${movieId}`);
  };

  const getYear = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).getFullYear();
  };

  const getDefaultPoster = () => {
    return 'https://via.placeholder.com/300x450/8b5cf6/ffffff?text=Sin+Imagen';
  };

  if (loading) {
    return (
      <div className="favorites-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando favoritos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <h1 className="favorites-title">Mis Favoritos</h1>
        <p className="favorites-subtitle">
          {favorites.length > 0 
            ? `Tienes ${favorites.length} película${favorites.length !== 1 ? 's' : ''} en favoritos`
            : 'Aún no has agregado películas a favoritos'}
        </p>
      </div>

      {error ? (
        <div className="error-state">
          <p>❌ {error}</p>
          <button onClick={loadFavorites} className="retry-btn">
            Reintentar
          </button>
        </div>
      ) : favorites.length > 0 ? (
        <div className="favorites-grid">
          {favorites.map((favorite) => {
            const movie = favorite.movie;
            if (!movie) return null;

            return (
              <div key={favorite.id} className="favorite-card">
                <div 
                  className="favorite-poster-container"
                  onClick={() => handleMovieClick(favorite.pelicula_id)}
                >
                  <img
                    src={movie.imagen_url || getDefaultPoster()}
                    alt={movie.nombre}
                    className="favorite-poster"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getDefaultPoster();
                    }}
                  />
                  <div className="favorite-overlay">
                    <h3 className="favorite-title">{movie.nombre}</h3>
                    <div className="favorite-info">
                      <span className="favorite-year">{getYear(movie.fecha_lanzamiento)}</span>
                      {movie.calificacion && (
                        <span className="favorite-rating">
                          ⭐ {movie.calificacion.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  className="remove-btn"
                  onClick={() => handleRemoveFavorite(favorite.pelicula_id)}
                  disabled={removingId === favorite.pelicula_id}
                >
                  {removingId === favorite.pelicula_id ? (
                    <span className="spinner-small"></span>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">❤️</div>
          {/* <p>Aún no tienes películas favoritas</p> */}
          <p className="empty-hint">Explora nuestro catálogo y selecciona tus películas favoritas</p>
          <button onClick={() => navigate('/catalogo')} className="browse-btn">
            Explorar Catálogo
          </button>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;