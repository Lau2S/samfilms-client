import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import api from '../../services/api';
import './MoviesPage.scss';
import CatalogPage from '../catalog/CatalogMoviesPage';

interface Movie {
  id: number;
  nombre: string;
  sinopsis?: string;
  fecha_lanzamiento?: string;
  calificacion?: number;
  imagen_url: string | null;
  genero_ids?: number[];
}

interface HeroMovie {
  id: number;
  title: string;
  description: string;
  backdrop: string;
}

const MoviesPage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [comedyMovies, setComedyMovies] = useState<Movie[]>([]);
  const [actionMovies, setActionMovies] = useState<Movie[]>([]);
  const [thrillerMovies, setThrillerMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Hero movies estáticos para el carrusel (puedes mantenerlos o cargarlos dinámicamente)
  const heroMovies: HeroMovie[] = [
    {
      id: 1,
      title: 'Seven',
      description: 'Un thriller psicológico oscuro sobre dos detectives que siguen la pista de un asesino en serie.',
      backdrop: 'https://i.pinimg.com/1200x/2b/c3/da/2bc3daf2de7ae4f76dbcfcb6a759a2a0.jpg'
    },
    {
      id: 2,
      title: 'Inception',
      description: 'Un ladrón que roba secretos corporativos a través del uso de tecnología de sueños compartidos.',
      backdrop: 'https://i.pinimg.com/1200x/15/a4/9b/15a49b372345c8d8b31f089e9e547849.jpg'
    },
    {
      id: 3,
      title: 'The Dark Knight',
      description: 'Batman debe aceptar una de las pruebas psicológicas y físicas más grandes para luchar contra la injusticia.',
      backdrop: 'https://media.gq.com.mx/photos/5be9cd19d1a6deb6ed7c8bf4/16:9/w_2992,h_1683,c_limit/the_dark_knight_860.jpg'
    }
  ];

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar películas populares
      const popularResponse: any = await api.getMovies(12);
      if (popularResponse.success && popularResponse.data) {
        setPopularMovies(popularResponse.data);
      }

      // Cargar películas de Comedia
      const comedyResponse: any = await api.getMoviesByGenre('Comedia', 12);
      if (comedyResponse.success && comedyResponse.data) {
        setComedyMovies(comedyResponse.data);
      }

      // Cargar películas de Acción
      const actionResponse: any = await api.getMoviesByGenre('Acción', 12);
      if (actionResponse.success && actionResponse.data) {
        setActionMovies(actionResponse.data);
      }

      // Cargar películas de Thriller
      const thrillerResponse: any = await api.getMoviesByGenre('Suspense', 12);
      if (thrillerResponse.success && thrillerResponse.data) {
        setThrillerMovies(thrillerResponse.data);
      }

    } catch (err: any) {
      console.error('❌ Error cargando películas:', err);
      setError(err.message || 'Error al cargar las películas');
    } finally {
      setLoading(false);
    }
  };

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroMovies.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroMovies.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroMovies.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroMovies.length) % heroMovies.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
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
      <div className="movies-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando peliculas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="movies-page">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '80vh',
          color: '#ff5252',
          fontSize: '1.25rem',
          gap: '1rem'
        }}>
          <p>❌ {error}</p>
          <button 
            onClick={loadMovies}
            style={{
              padding: '0.75rem 2rem',
              background: '#8b5cf6',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="movies-page">
      {/* Hero Carousel */}
      <div className="hero-carousel">
        <div 
          className="carousel-track" 
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {heroMovies.map((movie) => (
            <div key={movie.id} className="hero-slide">
              <img 
                src={movie.backdrop} 
                alt={movie.title} 
                className="hero-image"
              />
              <div className="hero-content">
                <h1 className="hero-title">{movie.title}</h1>
                <p className="hero-description">{movie.description}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="carousel-arrow prev" onClick={prevSlide} aria-label="Anterior">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button className="carousel-arrow next" onClick={nextSlide} aria-label="Siguiente">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        <div className="carousel-dots">
          {heroMovies.map((_, index) => (
            <button
              key={index}
              className={`dot ${currentSlide === index ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Ir a slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Movies Content */}
      <div className="movies-content">
        {/* Películas Populares */}
        {popularMovies.length > 0 && (
          <section className="genre-section">
            <div className="genre-header">
              <h2 className="genre-title">Populares</h2>
              <button onClick={() => navigate('/catalogo')} className="view-all-btn">Ver Todos</button>
            </div>
            <div className="movies-grid">
              {popularMovies.map((movie) => (
                <div 
                  key={movie.id} 
                  className="movie-card"
                  onClick={() => handleMovieClick(movie.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <img 
                    src={movie.imagen_url || getDefaultPoster()} 
                    alt={movie.nombre} 
                    className="movie-poster"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getDefaultPoster();
                    }}
                  />
                  <div className="movie-overlay">
                    <h3 className="movie-title">{movie.nombre}</h3>
                    <p className="movie-year">{getYear(movie.fecha_lanzamiento)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Comedia Section */}
        {comedyMovies.length > 0 && (
          <section className="genre-section">
            <div className="genre-header">
              <h2 className="genre-title">Comedia</h2>
              <button onClick={() => navigate('/catalogo?genero=Comedia')} className="view-all-btn">Ver Todos</button>
            </div>
            <div className="movies-grid">
              {comedyMovies.map((movie) => (
                <div 
                  key={movie.id} 
                  className="movie-card"
                  onClick={() => handleMovieClick(movie.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <img 
                    src={movie.imagen_url || getDefaultPoster()} 
                    alt={movie.nombre} 
                    className="movie-poster"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getDefaultPoster();
                    }}
                  />
                  <div className="movie-overlay">
                    <h3 className="movie-title">{movie.nombre}</h3>
                    <p className="movie-year">{getYear(movie.fecha_lanzamiento)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Action Section */}
        {actionMovies.length > 0 && (
          <section className="genre-section">
            <div className="genre-header">
              <h2 className="genre-title">Acción</h2>
              <button onClick={() => navigate('/catalogo?genero=Acción')} className="view-all-btn">Ver Todos</button>
            </div>
            <div className="movies-grid">
              {actionMovies.map((movie) => (
                <div 
                  key={movie.id} 
                  className="movie-card"
                  onClick={() => handleMovieClick(movie.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <img 
                    src={movie.imagen_url || getDefaultPoster()} 
                    alt={movie.nombre} 
                    className="movie-poster"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getDefaultPoster();
                    }}
                  />
                  <div className="movie-overlay">
                    <h3 className="movie-title">{movie.nombre}</h3>
                    <p className="movie-year">{getYear(movie.fecha_lanzamiento)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Thriller Section */}
        {thrillerMovies.length > 0 && (
          <section className="genre-section">
            <div className="genre-header">
              <h2 className="genre-title">Thriller</h2>
              <button onClick={() => navigate('/catalogo?genero=Suspense')} className="view-all-btn">Ver Todos</button>
            </div>
            <div className="movies-grid">
              {thrillerMovies.map((movie) => (
                <div 
                  key={movie.id} 
                  className="movie-card"
                  onClick={() => handleMovieClick(movie.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <img 
                    src={movie.imagen_url || getDefaultPoster()} 
                    alt={movie.nombre} 
                    className="movie-poster"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getDefaultPoster();
                    }}
                  />
                  <div className="movie-overlay">
                    <h3 className="movie-title">{movie.nombre}</h3>
                    <p className="movie-year">{getYear(movie.fecha_lanzamiento)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default MoviesPage;