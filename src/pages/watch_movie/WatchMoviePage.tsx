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
  updated_at?: string;
  editado?: boolean;
  users?: {
    id?: string;
    nombres?: string;
    apellidos?: string;
  };
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
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

        // 2️⃣ Buscar tráiler en YouTube
        const youtubeData = await YouTubeService.searchTrailer(movieData.nombre);
        if (youtubeData) {
          const videoId = youtubeData.id?.videoId;
          setTrailerUrl(`https://www.youtube.com/embed/${videoId}`);
        } else {
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
        // expect response.data to be array of comments possibly with embedded users
        setComments(response.data);
      }
    } catch (err) {
      console.log('No se pudieron cargar comentarios');
    } finally {
      setLoadingComments(false);
    }
  };

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const handleDeleteComment = async (commentId: string) => {
    if (!currentUser?.id) {
      alert('Debes iniciar sesión para eliminar tu comentario');
      return;
    }
    if (!window.confirm('¿Seguro que quieres eliminar este comentario?')) return;

    try {
      const res: any = await api.deleteComment(commentId, currentUser.id);
      if (res.success) {
        setComments(prev => prev.filter(c => c.id !== commentId));
      }
    } catch (err: any) {
      console.error('Error deleting comment', err);
      alert(err.message || 'Error al eliminar comentario');
    }
  };

  const startEditing = (c: Comment) => {
    setEditingId(c.id);
    setEditText(c.contenido);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
  };

  const submitEdit = async (c: Comment) => {
    if (!currentUser?.id) {
      alert('Debes iniciar sesión para editar tu comentario');
      return;
    }
    try {
      const res: any = await api.updateComment(c.id, editText.trim(), currentUser.id);
      if (res.success && res.data) {
        setComments(prev => prev.map(p => p.id === c.id ? { ...p, ...res.data } : p));
        cancelEditing();
      }
    } catch (err: any) {
      console.error('Error updating comment', err);
      alert(err.message || 'Error al actualizar comentario');
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

      // Resolve the internal movie id expected by the backend.
      // Some backends expect an internal UUID for pelicula_id while the route uses TMDB id.
      let peliculaIdToSend: string = String(movieId);
      try {
        const movieResp: any = await api.getMovieById(movieId!);
        if (movieResp && movieResp.success && movieResp.data) {
          // prefer backend/internal id when available
          peliculaIdToSend = String(movieResp.data.id ?? movieResp.data._id ?? peliculaIdToSend);
        }
      } catch (err) {
        console.warn('Could not resolve internal movie id, falling back to route id', err);
      }

      const response = await api.createComment({
        usuario_id: user.id,
        pelicula_id: peliculaIdToSend,
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
          <iframe
            width="100%"
            height="400"
            src={trailerUrl}
            title={`Trailer de ${movie.nombre}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.85em', color: '#aaa', marginBottom: '0.25rem' }}>
                    <strong style={{ color: '#fff' }}>{c.users ? `${c.users.nombres || ''} ${c.users.apellidos || ''}`.trim() : ''}</strong>
                    <div style={{ fontSize: '0.75em', color: '#aaa' }}>{new Date(c.created_at).toLocaleString()}</div>
                    {c.editado && <span style={{ fontSize: '0.75em', color: '#bbb', marginLeft: 8 }}> (editado)</span>}
                  </div>
                  {/* show edit/delete only for author's comments */}
                  {currentUser?.id && (c.usuario_id === currentUser.id || c.users?.id === currentUser.id) && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => startEditing(c)} className="btn-small">Editar</button>
                      <button onClick={() => handleDeleteComment(c.id)} className="btn-small danger">Eliminar</button>
                    </div>
                  )}
                </div>

                {editingId === c.id ? (
                  <div>
                    <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={3}></textarea>
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                      <button onClick={() => submitEdit(c)} className="btn-small">Guardar</button>
                      <button onClick={cancelEditing} className="btn-small">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 6 }}>{c.contenido}</div>
                )}
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