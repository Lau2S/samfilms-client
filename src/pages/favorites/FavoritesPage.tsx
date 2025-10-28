import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import api from '../../services/api';
import './FavoritesPage.scss';
import { toast } from 'react-toastify';

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
  movie_id?: string | null;
  tmdb_id?: number | null;
}

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);

      const response: any = await api.getFavorites();

      if (response.success && response.data) {
        const rawFavorites: FavoriteMovie[] = response.data;

        const enriched = await Promise.all(rawFavorites.map(async (f) => {
          if (f.movie) return f;

          const candidateId = f.pelicula_id ?? f.movie_id ?? f.tmdb_id ?? null;
          if (!candidateId) return f;

          try {
            const movieResp: any = await api.getMovieById(String(candidateId));
            if (movieResp) {
              if (movieResp.success && movieResp.data) {
                return { ...f, movie: movieResp.data } as FavoriteMovie;
              }
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
    try {
      setRemovingId(String(movieId));
      const response = await api.removeFromFavorites(String(movieId));
      if (response.success) {
        const idToRemove = String(movieId);
        setFavorites(favorites.filter(fav =>
          String(fav.pelicula_id ?? fav.movie_id ?? fav.tmdb_id ?? fav.movie?.id ?? fav.id) !== idToRemove
        ));
        toast.success('Película eliminada de favoritos exitosamente');
      }
    } catch (err: any) {
      toast.error('Error al eliminar de favoritos');
    } finally {
      setRemovingId(null);
      setConfirmOpen(false);
      setConfirmId(null);
    }
  };

  const handleMovieClick = (movieId: string) => {
    navigate(`/peliculas/${movieId}`);
  };

  const movieIdFromFavorite = (f: FavoriteMovie) => {
    return String(f.movie?.id ?? f.pelicula_id ?? f.movie_id ?? f.tmdb_id ?? f.id);
  };

  const getYear = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).getFullYear();
  };

  const getDefaultPoster = () => {
    return 'https://via.placeholder.com/300x450/8b5cf6/ffffff?text=Sin+Imagen';
  };

  // 🔧 NUEVO: Función para generar alt text descriptivo
  const getMovieAltText = (movie: FavoriteMovie['movie']) => {
    if (!movie) return 'Póster de película';
    const year = getYear(movie.fecha_lanzamiento);
    const rating = movie.calificacion ? `, calificación ${movie.calificacion.toFixed(1)} estrellas` : '';
    return `Póster de ${movie.nombre}, año ${year}${rating}`;
  };

  if (loading) {
    return (
      <div className="favorites-page">
        <div className="loading-state" role="status" aria-live="polite">
          <div className="spinner" aria-hidden="true"></div>
          <p>Cargando favoritos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <header className="favorites-header">
        <h1 className="favorites-title">Mis Favoritos</h1>
        {(() => {
          const displayed = favorites.filter(f => f.movie);
          return (
            <p className="favorites-subtitle" role="status">
              {displayed.length > 0
                ? `Tienes ${displayed.length} película${displayed.length !== 1 ? 's' : ''} en favoritos`
                : 'Aún no has agregado películas a favoritos'}
            </p>
          );
        })()}
      </header>

      {error ? (
        <div className="error-state" role="alert" aria-live="assertive">
          <p>❌ {error}</p>
          <button 
            onClick={loadFavorites} 
            className="retry-btn"
            aria-label="Reintentar carga de favoritos"
          >
            Reintentar
          </button>
        </div>
      ) : favorites.filter(f => f.movie).length > 0 ? (
        <div className="favorites-grid" role="list" aria-label="Lista de películas favoritas">
          {favorites.filter(f => f.movie).map((favorite) => {
            const movie = favorite.movie!;
            const movieId = movieIdFromFavorite(favorite);
            const isRemoving = removingId === movieId;

            return (
              <article key={favorite.id} className="favorite-card" role="listitem">
                <div
                  className="favorite-poster-container"
                  onClick={() => handleMovieClick(movieId)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleMovieClick(movieId);
                    }
                  }}
                  aria-label={`Ver ${movie.nombre}`}
                >
                  <img
                    src={movie.imagen_url || getDefaultPoster()}
                    alt={getMovieAltText(movie)}
                    className="favorite-poster"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getDefaultPoster();
                    }}
                  />
                  <div className="favorite-overlay" aria-hidden="true">
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
                  onClick={() => {
                    setConfirmOpen(true);
                    setConfirmId(movieId);
                  }}
                  disabled={isRemoving}
                  aria-label={`Eliminar ${movie.nombre} de favoritos`}
                  aria-busy={isRemoving}
                >
                  {isRemoving ? (
                    <span className="spinner-small" role="status" aria-label="Eliminando"></span>
                  ) : (
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  )}
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state" role="status">
          <div className="empty-icon" aria-hidden="true">❤️</div>
          <p className="empty-hint">Explora nuestro catálogo y selecciona tus películas favoritas</p>
          <button 
            onClick={() => navigate('/catalogo')} 
            className="browse-btn"
            aria-label="Ir al catálogo de películas"
          >
            Explorar Catálogo
          </button>
        </div>
      )}

      {confirmOpen && (
        <div 
          className="modal-overlay" 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setConfirmOpen(false);
              setConfirmId(null);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          aria-describedby="confirm-desc"
        >
          <div className="modal-card confirm-modal">
            <button
              className="modal-close"
              onClick={() => { setConfirmOpen(false); setConfirmId(null); }}
              aria-label="Cerrar modal de confirmación"
            >×</button>
            <h3 id="confirm-title">Eliminar de favoritos</h3>
            <p id="confirm-desc">¿Estás seguro de eliminar esta película de tus favoritos? Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button
                className="confirm-delete"
                onClick={() => {
                  if (confirmId) handleRemoveFavorite(confirmId);
                }}
                aria-label="Confirmar eliminación"
              >
                Eliminar
              </button>
              <button
                className="cancel-delete"
                onClick={() => { setConfirmOpen(false); setConfirmId(null); }}
                aria-label="Cancelar eliminación"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;