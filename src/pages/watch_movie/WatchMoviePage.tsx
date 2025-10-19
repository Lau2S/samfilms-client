import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import './WatchMoviePage.scss';
 
// Tipado opcional de la película (simulado mientras integras tu API)
interface Movie {
  title: string;
  description: string;
  year: number;
  poster: string;
  director: string;
  genre: string;
  rating: number;
  backdrop: string;
  videoUrl: string;
}

const WatchMoviePage: React.FC = () => {
  const { movieId } = useParams<{ movieId?: string }>(); // obtiene el parámetro desde la URL
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(false);

  // Simulación temporal mientras se integra la API
  useEffect(() => {
    setLoading(true);

    // Simulación: datos locales mientras no se conecta la API
    const fakeMovie: Movie = {
      title: 'Seven',
      description:
        'Dos detectives, el veterano Somerset y su compañero Mills, persiguen a un asesino en serie cuyos crímenes están inspirados en los siete pecados capitales.',
      year: 1995,
      poster:
        'https://a.ltrbxd.com/resized/film-poster/5/1/3/4/5/51345-se7en-0-1000-0-1500-crop.jpg?v=76a14ef6b4',
      director: 'David Fincher',
      genre: 'Suspenso',
      rating: 5,
      backdrop:
        'https://i.pinimg.com/1200x/2b/c3/da/2bc3daf2de7ae4f76dbcfcb6a759a2a0.jpg',
      videoUrl:
        'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    };

    // Aquí iría el fetch real cuando tengas tu API:
    /*
    fetch(`https://tu-api.com/movies/${movieId}`)
      .then(res => res.json())
      .then(data => setMovie(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
    */

    // Mientras no hay API, simulamos carga
    setTimeout(() => {
      setMovie(fakeMovie);
      setLoading(false);
    }, 800);
  }, [movieId]);

  if (loading) return <div className="loading">Cargando...</div>;
  if (!movie) return <div className="error">Película no encontrada</div>;

  return (
    <div className="watch-movie-page">
      <div className="movie-header">
        <img className="movie-poster" src={movie.poster} alt={movie.title} />
        <div className="movie-info">
          <h1>{movie.title}</h1>
          <p>{movie.description}</p>
          <div className="rating">
            {[...Array(movie.rating)].map((_, i) => (
              <span key={i}>★</span>
            ))}
          </div>
          <p>Director: <a href="#">{movie.director}</a></p>
          <p>Género: {movie.genre}</p>
          <p>Año: {movie.year}</p>
        </div>
      </div>

      <div className="movie-player">
        <video width="100%" height="360" poster={movie.backdrop} controls>
          <source src={movie.videoUrl} type="video/mp4" />
          Tu navegador no soporta la reproducción de video.
        </video>
      </div>
    </div>
  );
};

export default WatchMoviePage;
