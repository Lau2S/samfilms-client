import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import api from '../../services/api';
import './FavoritesPage.scss';

interface FavoriteMovie {
  id: string;
  pelicula_id?: string | null;
  usuario_id: string;
  created_at: string;
  movie?: {
    id: number;
    nombre: string;
    imagen_url: string | null;
    fecha_lanzamiento?: string;
    calificacion?: number;
  };
  // Algunos backends devuelven tmdb_id u otros campos
  movie_id?: string | null;
  tmdb_id?: number | null;
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
        // Si el backend no incluye el objeto `movie` en cada favorito,
        // consultamos los detalles de la película y enriquecemos el array
        const rawFavorites: FavoriteMovie[] = response.data;

        const enriched = await Promise.all(rawFavorites.map(async (f) => {
          if (f.movie) return f;

          // Determinar el id de la película que tenemos en el favorito
          const candidateId = f.pelicula_id ?? f.movie_id ?? f.tmdb_id ?? null;
          if (!candidateId) return f;

          try {
            const movieResp: any = await api.getMovieById(String(candidateId));
            // El backend puede devolver { success, data } o directamente el objeto movie
            if (movieResp) {
              if (movieResp.success && movieResp.data) {
                return { ...f, movie: movieResp.data } as FavoriteMovie;
              }
              // Si la respuesta no está envuelta, aceptamos el objeto como movie
              if (movieResp.id || movieResp.nombre) {
                return { ...f, movie: movieResp } as FavoriteMovie;
              }
            }
          } catch (err) {
            console.warn('No se pudo cargar movie details for', candidateId, err);
          }
          return f;
        }));

        setFavorites(enriched);
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
      // movieId puede venir como pelicula_id o tmdb_id
      setRemovingId(String(movieId));

      const response = await api.removeFromFavorites(String(movieId));

      if (response.success) {
        // Filtrar por los posibles campos que mapean al id de la película
        const idToRemove = String(movieId);
        setFavorites(favorites.filter(fav => String(fav.pelicula_id ?? fav.movie_id ?? fav.tmdb_id ?? fav.movie?.id ?? fav.id) !== idToRemove));
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

  const movieIdFromFavorite = (f: FavoriteMovie) => {
    // Priorizar movie.id, luego pelicula_id, movie_id, tmdb_id
    return String(f.movie?.id ?? f.pelicula_id ?? f.movie_id ?? f.tmdb_id ?? f.id);
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
        {/* Mostrar sólo los favoritos que tengan la info de película cargada */}
        {(() => {
          const displayed = favorites.filter(f => f.movie);
          return (
            <p className="favorites-subtitle">
              {displayed.length > 0
                ? `Tienes ${displayed.length} película${displayed.length !== 1 ? 's' : ''} en favoritos`
                : 'Aún no has agregado películas a favoritos'}
            </p>
          );
        })()}
      </div>

      {error ? (
        <div className="error-state">
          <p>❌ {error}</p>
          <button onClick={loadFavorites} className="retry-btn">
            Reintentar
          </button>
        </div>
      ) : favorites.filter(f => f.movie).length > 0 ? (
        <div className="favorites-grid">
          {favorites.filter(f => f.movie).map((favorite) => {
            const movie = favorite.movie!;

            return (
              <div key={favorite.id} className="favorite-card">
                <div 
                  className="favorite-poster-container"
                  onClick={() => handleMovieClick(movieIdFromFavorite(favorite))}
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
                  onClick={() => handleRemoveFavorite(movieIdFromFavorite(favorite))}
                  disabled={removingId === movieIdFromFavorite(favorite)}
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