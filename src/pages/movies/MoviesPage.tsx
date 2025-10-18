import React, { useState, useEffect } from 'react';
import './MoviesPage.scss';

interface Movie {
  id: number;
  title: string;
  year: number;
  poster: string;
}

interface HeroMovie {
  id: number;
  title: string;
  description: string;
  backdrop: string;
}

const MoviesPage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero movies for carousel
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

  // Movies by genre
  const dramaMovies: Movie[] = [
    { id: 1, title: 'Spider-Man', year: 2002, poster: 'https://a.ltrbxd.com/resized/film-poster/5/1/5/6/1/51561-spider-man-0-1000-0-1500-crop.jpg?v=a7394840f4' },
    { id: 2, title: 'Pulp Fiction', year: 1994, poster: 'https://a.ltrbxd.com/resized/film-poster/5/1/4/4/4/51444-pulp-fiction-0-1000-0-1500-crop.jpg?v=dee19a8077' },
    { id: 3, title: 'The Godfather', year: 1972, poster: 'https://a.ltrbxd.com/resized/film-poster/5/1/8/1/8/51818-the-godfather-0-1000-0-1500-crop.jpg?v=bca8b67402' },
    { id: 4, title: 'Kill Bill', year: 2003, poster: 'https://a.ltrbxd.com/resized/sm/upload/sw/w2/ep/v4/9O50TVszkz0dcP5g6Ej33UhR7vw-0-1000-0-1500-crop.jpg?v=5a65f5202f' },
    { id: 5, title: 'Forrest Gump', year: 1994, poster: 'https://a.ltrbxd.com/resized/film-poster/2/7/0/4/2704-forrest-gump-0-1000-0-1500-crop.jpg?v=173bc04cf0' },
    { id: 6, title: 'The Truman Show', year: 1998, poster: 'https://a.ltrbxd.com/resized/sm/upload/xx/io/jp/45/the-truman-show-0-1000-0-1500-crop.jpg?v=704ba393f7' }
  ];

  const actionMovies: Movie[] = [
    { id: 7, title: 'Léon: The Professional', year: 1994, poster: 'https://a.ltrbxd.com/resized/sm/upload/6x/vq/25/fy/gE8S02QUOhVnAmYu4tcrBlMTujz-0-1000-0-1500-crop.jpg?v=f72423fa1f' },
    { id: 8, title: 'Django Unchained', year: 2012, poster: 'https://a.ltrbxd.com/resized/film-poster/5/2/5/1/6/52516-django-unchained-0-1000-0-1500-crop.jpg?v=f02aed63a3' },
    { id: 9, title: 'Old Boy', year: 2003, poster: 'https://a.ltrbxd.com/resized/film-poster/5/1/4/5/4/51454-oldboy-0-1000-0-1500-crop.jpg?v=294dbcadef' },
    { id: 10, title: 'Dead Poets Society', year: 1989, poster: 'https://a.ltrbxd.com/resized/film-poster/5/1/8/4/6/51846-dead-poets-society-0-1000-0-1500-crop.jpg?v=9273e8acf7' },
    { id: 11, title: 'La La Land', year: 2016, poster: 'https://a.ltrbxd.com/resized/film-poster/2/4/0/3/4/4/240344-la-la-land-0-1000-0-1500-crop.jpg?v=053670ff84' },
    { id: 12, title: 'Requiem for a Dream', year: 2000, poster: 'https://a.ltrbxd.com/resized/sm/upload/lv/4b/f2/zj/muym4jTjdLx7E6as09d1wlC3sOB-0-1000-0-1500-crop.jpg?v=b4d5a4aa37' }
  ];

  const thrillerMovies: Movie[] = [
    { id: 13, title: 'The Silence of the Lambs', year: 1991, poster: 'https://a.ltrbxd.com/resized/film-poster/5/1/7/8/2/51782-the-silence-of-the-lambs-0-1000-0-1500-crop.jpg?v=18d88bdff4' },
    { id: 14, title: 'Se7en', year: 1995, poster: 'https://a.ltrbxd.com/resized/film-poster/5/1/3/4/5/51345-se7en-0-1000-0-1500-crop.jpg?v=76a14ef6b4' },
    { id: 15, title: 'Fight Club', year: 1999, poster: 'https://a.ltrbxd.com/resized/film-poster/5/1/5/6/8/51568-fight-club-0-1000-0-1500-crop.jpg?v=768b32dfa4' },
    { id: 16, title: 'Shutter Island', year: 2010, poster: 'https://a.ltrbxd.com/resized/film-poster/4/5/4/0/9/45409-shutter-island-0-1000-0-1500-crop.jpg?v=85dd4c38e3' },
    { id: 17, title: 'Gone Girl', year: 2014, poster: 'https://a.ltrbxd.com/resized/film-poster/1/4/9/8/5/7/149857-gone-girl-0-1000-0-1500-crop.jpg?v=dfe3c8018b' },
    { id: 18, title: 'Prisoners', year: 2013, poster: 'https://a.ltrbxd.com/resized/sm/upload/iw/eg/4g/nm/3w79tTsv6tmlT8Jww6snyPrgVok-0-1000-0-1500-crop.jpg?v=778c7ae8b8' }
  ];

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroMovies.length);
    }, 5000); // Change slide every 5 seconds

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

        {/* Navigation Arrows */}
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

        {/* Dots Navigation */}
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
        {/* Drama Section */}
        <section className="genre-section">
          <div className="genre-header">
            <h2 className="genre-title">Drama</h2>
            <button className="view-all-btn">Ver Todos</button>
          </div>
          <div className="movies-grid">
            {dramaMovies.map((movie) => (
              <div key={movie.id} className="movie-card">
                <img 
                  src={movie.poster} 
                  alt={movie.title} 
                  className="movie-poster"
                />
                <div className="movie-overlay">
                  <h3 className="movie-title">{movie.title}</h3>
                  <p className="movie-year">{movie.year}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Action Section */}
        <section className="genre-section">
          <div className="genre-header">
            <h2 className="genre-title">Acción</h2>
            <button className="view-all-btn">Ver Todos</button>
          </div>
          <div className="movies-grid">
            {actionMovies.map((movie) => (
              <div key={movie.id} className="movie-card">
                <img 
                  src={movie.poster} 
                  alt={movie.title} 
                  className="movie-poster"
                />
                <div className="movie-overlay">
                  <h3 className="movie-title">{movie.title}</h3>
                  <p className="movie-year">{movie.year}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Thriller Section */}
        <section className="genre-section">
          <div className="genre-header">
            <h2 className="genre-title">Thriller</h2>
            <button className="view-all-btn">Ver Todos</button>
          </div>
          <div className="movies-grid">
            {thrillerMovies.map((movie) => (
              <div key={movie.id} className="movie-card">
                <img 
                  src={movie.poster} 
                  alt={movie.title} 
                  className="movie-poster"
                />
                <div className="movie-overlay">
                  <h3 className="movie-title">{movie.title}</h3>
                  <p className="movie-year">{movie.year}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default MoviesPage;