import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import api from '../../services/api';
import './CatalogMoviesPage.scss';

interface Movie {
  id: number;
  nombre: string;
  sinopsis?: string;
  fecha_lanzamiento?: string;
  calificacion?: number;
  imagen_url: string | null;
  genero_ids?: number[];
}

const GENRES = [
  { id: 'all', name: 'Todas' },
  { id: 'Acción', name: 'Acción' },
  { id: 'Aventura', name: 'Aventura' },
  { id: 'Animación', name: 'Animación' },
  { id: 'Comedia', name: 'Comedia' },
  { id: 'Crimen', name: 'Crimen' },
  { id: 'Documental', name: 'Documental' },
  { id: 'Drama', name: 'Drama' },
  { id: 'Familia', name: 'Familia' },
  { id: 'Fantasía', name: 'Fantasía' },
  { id: 'Historia', name: 'Historia' },
  { id: 'Terror', name: 'Terror' },
  { id: 'Música', name: 'Música' },
  { id: 'Misterio', name: 'Misterio' },
  { id: 'Romance', name: 'Romance' },
  { id: 'Ciencia ficción', name: 'Ciencia Ficción' },
  { id: 'Suspense', name: 'Suspense' },
  { id: 'Bélica', name: 'Bélica' },
  { id: 'Western', name: 'Western' },
];

const CatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genero') || 'all');

  useEffect(() => {
    loadMovies();
  }, [selectedGenre]);

  const loadMovies = async () => {
    try {
      setLoading(true);
      setError(null);

      let response:any;
      if (selectedGenre === 'all') {
        response = await api.getMovies(50); // Cargar más películas en catálogo
      } else {
        response = await api.getMoviesByGenre(selectedGenre, 50);
      }

      if (response.success && response.data) {
        setMovies(response.data);
      } else {
        setError('No se pudieron cargar las películas');
      }
    } catch (err: any) {
      console.error('❌ Error cargando películas:', err);
      setError(err.message || 'Error al cargar las películas');
    } finally {
      setLoading(false);
    }
  };

  const handleGenreChange = (genreId: string) => {
    setSelectedGenre(genreId);
    if (genreId === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ genero: genreId });
    }
  };

  const handleMovieClick = (movieId: number) => {
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
      <div className="catalog-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando catálogo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <h1 className="catalog-title">Catálogo de Películas</h1>
        <p className="catalog-subtitle">
          {selectedGenre === 'all' 
            ? 'Explora toda nuestra colección' 
            : `Películas de ${GENRES.find(g => g.id === selectedGenre)?.name}`}
        </p>
      </div>

      {/* Genre Filter */}
      <div className="genre-filter">
        <div className="genre-filter-container">
          {GENRES.map((genre) => (
            <button
              key={genre.id}
              className={`genre-btn ${selectedGenre === genre.id ? 'active' : ''}`}
              onClick={() => handleGenreChange(genre.id)}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>

      {/* Movies Grid */}
      {error ? (
        <div className="error-state">
          <p>❌ {error}</p>
          <button onClick={loadMovies} className="retry-btn">
            Reintentar
          </button>
        </div>
      ) : movies.length > 0 ? (
        <div className="catalog-grid">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="catalog-movie-card"
              onClick={() => handleMovieClick(movie.id)}
            >
              <img
                src={movie.imagen_url || getDefaultPoster()}
                alt={movie.nombre}
                className="catalog-poster"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getDefaultPoster();
                }}
              />
              <div className="catalog-overlay">
                <h3 className="catalog-movie-title">{movie.nombre}</h3>
                <div className="catalog-movie-info">
                  <span className="catalog-year">{getYear(movie.fecha_lanzamiento)}</span>
                  {/* {movie.calificacion && (
                    <span className="catalog-rating">
                      ⭐ {movie.calificacion.toFixed(1)}
                    </span>
                  )} */}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>😔 No se encontraron películas en esta categoría</p>
          <button onClick={() => handleGenreChange('all')} className="back-btn">
            Ver todas las películas
          </button>
        </div>
      )}
    </div>
  );
};

export default CatalogPage;