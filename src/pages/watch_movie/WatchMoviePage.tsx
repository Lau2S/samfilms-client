import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import api, {YouTubeService} from '../../services/api';

import './WatchMoviePage.scss';

interface Movie {
  id: number;
  nombre: string;
  sinopsis?: string;
  fecha_lanzamiento?: string;
  calificacion?: number;
  imagen_url: string | null;
  genero_ids?: number[];
}

interface Comment {
  id: string;
  contenido: string;
  usuario_id: string;
  created_at: string;
}

const WatchMoviePage: React.FC = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  // User interaction states
  const [userRating, setUserRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  // useEffect(() => {
  //   if (movieId) {
  //     loadMovie();
  //     checkFavoriteStatus();
  //     loadComments();
  //   }
  // }, [movieId]);

   useEffect(() => {
    if (!movieId) return;
    const fetchMovieData = async () => {
      setLoading(true);
      try {
        // 1️⃣ Obtener datos desde tu backend
        const response: any = await api.getMovieById(movieId);
        if (!response.success || !response.data) {
          throw new Error('No se pudo cargar la película');
        }

        const movieData = response.data;
        setMovie(movieData);

         const trailerRes = await api.getMovieTrailer(movieData.id);
if (trailerRes.success && typeof trailerRes.data === 'string') {
  setTrailerUrl(trailerRes.data);
} else {
  console.warn('⚠️ No se encontró tráiler en Pexels');
  setTrailerUrl(null);
}


        // 3️⃣ Verificar favoritos y comentarios
        await checkFavoriteStatus();
        await loadComments();
      } catch (err: any) {
        console.error('❌ Error cargando película:', err);
        setError(err.message || 'Error al cargar la película');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [movieId]);

  

  const checkFavoriteStatus = async () => {
    try {
      const response: any = await api.checkIfFavorite(movieId!);
      if (response.success) {
        setIsFavorite(response.data?.isFavorite || false);
      }
    } catch (err) {
      console.log('No se pudo verificar favorito (puede que no esté autenticado)');
    }
  };

  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const response: any = await api.getCommentsByMovie(movieId!);
      
      if (response.success && response.data) {
        setComments(response.data);
      }
    } catch (err) {
      console.log('No se pudieron cargar comentarios');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleRating = (star: number) => {
    setUserRating(star);
    // Aquí podrías guardar la calificación en el backend si tienes ese endpoint
    console.log(`Usuario calificó con ${star} estrellas`);
  };

  const handleFavorite = async () => {
    try {
      setLoadingFavorite(true);

      if (isFavorite) {
        const response = await api.removeFromFavorites(movieId!);
        if (response.success) {
          setIsFavorite(false);
          console.log('✅ Eliminado de favoritos');
        }
      } else {
        const response = await api.addToFavorites(movieId!);
        if (response.success) {
          setIsFavorite(true);
          console.log('✅ Agregado a favoritos');
        }
      }
    } catch (err: any) {
      console.error('❌ Error al manejar favorito:', err);
      alert(err.message || 'Error al actualizar favoritos');
    } finally {
      setLoadingFavorite(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) return;

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!user.id) {
        alert('Debes iniciar sesión para comentar');
        return;
      }

      const response = await api.createComment({
        usuario_id: user.id,
        pelicula_id: movieId!,
        contenido: comment.trim()
      });

      if (response.success) {
        setComment('');
        loadComments(); // Recargar comentarios
        console.log('✅ Comentario agregado');
      }
    } catch (err: any) {
      console.error('❌ Error al agregar comentario:', err);
      alert(err.message || 'Error al agregar comentario');
    }
  };

  const getYear = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).getFullYear();
  };

  const getDefaultPoster = () => {
    return 'https://via.placeholder.com/300x450/8b5cf6/ffffff?text=Sin+Imagen';
  };

  const getDefaultBackdrop = () => {
    return 'https://via.placeholder.com/1280x720/8b5cf6/ffffff?text=Sin+Video';
  };

  if (loading) {
    return (
      <div className="watch-movie-page">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          color: '#fff',
          fontSize: '1.5rem'
        }}>
          Cargando película...
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="watch-movie-page">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          color: '#ff5252',
          fontSize: '1.25rem',
          gap: '1rem'
        }}>
          <p>❌ {error || 'Película no encontrada'}</p>
          <button
            onClick={() => navigate('/peliculas')}
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
            Volver a Películas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="watch-movie-page">
      <div className="movie-header">
        <img 
          className="movie-poster" 
          src={movie.imagen_url || getDefaultPoster()} 
          alt={movie.nombre}
          onError={(e) => {
            (e.target as HTMLImageElement).src = getDefaultPoster();
          }}
        />
        <div className="movie-info">
          <h1>{movie.nombre}</h1>
          <p>{movie.sinopsis || 'Sin descripción disponible'}</p>

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
            {movie.calificacion && (
              <span className="my-rating">
                TMDb: {movie.calificacion.toFixed(1)}/10
              </span>
            )}
          </div>

          <button
            className={`fav-btn${isFavorite ? ' fav' : ''}`}
            onClick={handleFavorite}
            disabled={loadingFavorite}
          >
            {loadingFavorite ? 'Cargando...' : (isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos')}
          </button>

          <p>Año: {getYear(movie.fecha_lanzamiento)}</p>
          {movie.genero_ids && movie.genero_ids.length > 0 && (
            <p>Géneros: {movie.genero_ids.join(', ')}</p>
          )}
        </div>
      </div>

       {/* TRAILER */}
      <div className="movie-player">
        {trailerUrl ? (
          <video
  controls
  autoPlay
  loop
  className="w-full h-full object-cover rounded-xl shadow-lg"
>
  <source src={trailerUrl} type="video/mp4" />
  Tu navegador no soporta video HTML5.
</video>

        ) : (
          <div
            style={{
              width: '100%',
              height: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#222',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            🎬 Tráiler no disponible
          </div>
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

        {loadingComments ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
            Cargando comentarios...
          </p>
        ) : comments.length > 0 ? (
          <ul className="comments-list">
            {comments.map((c) => (
              <li key={c.id} className="comment-item">
                <div style={{ fontSize: '0.85em', color: '#aaa', marginBottom: '0.25rem' }}>
                  {new Date(c.created_at).toLocaleDateString()}
                </div>
                {c.contenido}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginTop: '1rem' }}>
            No hay comentarios aún. ¡Sé el primero en comentar!
          </p>
        )}
      </div>
    </div>
  );
};

export default WatchMoviePage;