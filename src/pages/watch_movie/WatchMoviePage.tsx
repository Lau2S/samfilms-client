import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { TMDbService, YouTubeService } from "../../services/api";
import './WatchMoviePage.scss';

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
  const { movieId } = useParams<{ movieId?: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados solo para el front
  const [userRating, setUserRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<string[]>([]);

  // useEffect(() => {
  //   setLoading(true);
  //   const fakeMovie: Movie = {
  //     title: 'Seven',
  //     description:
  //       'Dos detectives, el veterano Somerset y su compañero Mills, persiguen a un asesino en serie cuyos crímenes están inspirados en los siete pecados capitales.',
  //     year: 1995,
  //     poster:
  //       'https://a.ltrbxd.com/resized/film-poster/5/1/3/4/5/51345-se7en-0-1000-0-1500-crop.jpg?v=76a14ef6b4',
  //     director: 'David Fincher',
  //     genre: 'Suspenso',
  //     rating: 5,
  //     backdrop:
  //       'https://i.pinimg.com/1200x/2b/c3/da/2bc3daf2de7ae4f76dbcfcb6a759a2a0.jpg',
  //     videoUrl:
  //       'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
  //   };
  //   setTimeout(() => {
  //     setMovie(fakeMovie);
  //     setLoading(false);
  //   }, 800);
  // }, [movieId]);
useEffect(() => {
  const fetchMovieData = async () => {
    if (!movieId) return;
    setLoading(true);

    try {
      // 🔹 1️⃣ Obtener datos de TMDb
      const tmdbData = await TMDbService.getMovieDetails(movieId);

      // 🔹 2️⃣ Buscar tráiler en YouTube
      const trailerQuery = `${tmdbData.title} official trailer`;
      const youtubeData = await YouTubeService.searchTrailer(trailerQuery);

      // 🔹 3️⃣ Construir objeto unificado para el front
      const movieData: Movie = {
        title: tmdbData.title,
        description: tmdbData.overview,
        year: new Date(tmdbData.release_date).getFullYear(),
        poster: `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`,
        backdrop: `https://image.tmdb.org/t/p/original${tmdbData.backdrop_path}`,
        director: tmdbData.credits?.crew?.find((p: any) => p.job === 'Director')?.name || 'Desconocido',
        genre: tmdbData.genres?.[0]?.name || 'Sin género',
        rating: tmdbData.vote_average,
        videoUrl: youtubeData ? `https://www.youtube.com/embed/${youtubeData.id.videoId}` : ''
      };

      setMovie(movieData);
    } catch (error) {
      console.error('Error al cargar datos de la película:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchMovieData();
}, [movieId]);

  if (loading) return <div className="loading">Cargando...</div>;
  if (!movie) return <div className="error">Película no encontrada</div>;

  const handleRating = (star: number) => setUserRating(star);
  const handleFavorite = () => setIsFavorite((prev) => !prev);
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      setComments([...comments, comment]);
      setComment('');
    }
  };

  return (
    <div className="watch-movie-page">
      <div className="movie-header">
        <img className="movie-poster" src={movie.poster} alt={movie.title} />
        <div className="movie-info">
          <h1>{movie.title}</h1>
          <p>{movie.description}</p>

          <div className="rating-section">
            <div className="stars">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  className={`star-btn${userRating >= star ? ' rated' : ''}`}
                  onClick={() => handleRating(star)}
                  aria-label={`Calificación ${star} estrellas`}
                >★</button>
              ))}
            </div>
            {userRating > 0 && (
              <span className="my-rating">Tu calificación: {userRating}</span>
            )}
          </div>

          <button
            className={`fav-btn${isFavorite ? ' fav' : ''}`}
            onClick={handleFavorite}
          >
            {isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          </button>

        
          <p>Director: <a href="#">{movie.director}</a></p>
          <p>Género: {movie.genre}</p>
          <p>Año: {movie.year}</p>
        </div>
      </div>

      <div className="movie-player">
        {/* <video width="100%" height="380" poster={movie.backdrop} controls><source src={movie.videoUrl} type="video/mp4" />Tu navegador no soporta la reproducción de video.</video> */}
        {movie.videoUrl ? (
    <iframe
      width="100%"
      height="380"
      src={movie.videoUrl}
      title={movie.title}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  ) : (
    <p>Tráiler no disponible.</p>
  )}
      </div>

      <div className="comments-section">
        <h2>Comentarios</h2>
        <form onSubmit={handleCommentSubmit} className="comment-form">
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Escribe tu comentario aquí..."
            rows={4}
            required
          />
          <button type="submit" className="add-comment-btn">
            Añadir comentario
          </button>
        </form>
        <ul className="comments-list">
          {comments.map((c, idx) => (
            <li key={idx} className="comment-item">{c}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WatchMoviePage;
