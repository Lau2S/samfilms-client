import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useParams, useNavigate } from 'react-router';
import api  from '../../services/api';
import { toast } from 'react-toastify';
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
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Ratings state
  const [avgRating, setAvgRating] = useState<number>(0);
  const [ratingsCount, setRatingsCount] = useState<number>(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [savingRating, setSavingRating] = useState<boolean>(false);
  const [ratingMessage, setRatingMessage] = useState<string | null>(null);
  // User interaction states
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

         const trailerRes = await api.getMovieTrailer(movieData.id);
if (trailerRes.success && typeof trailerRes.data === 'string') {
  setTrailerUrl(trailerRes.data);
} else {
  console.warn('⚠️ No se encontró tráiler en Pexels');
  setTrailerUrl(null);
}


        // 3️⃣ Verificar favoritos, comentarios y calificaciones
        await checkFavoriteStatus();
        await loadComments();
        // cargar ratings
        await loadRatings(movieData);
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

  // Determine identifiers to use for rating requests
  const isUuid = (s: any) => {
    if (!s || typeof s !== 'string') return false;
    // Simple UUID v4-ish pattern (hyphenated)
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(s);
  };

  const resolveIdentifiers = async (movieData: any) => {
    // Prefer explicit pelicula_id only if it looks like a UUID; otherwise prefer tmdb id
    let peliculaId: string | null = null;
    if (movieData) {
      const cand = movieData.pelicula_id ?? movieData.movie_id ?? movieData.peliculaId ?? movieData.id ?? null;
      if (isUuid(cand)) peliculaId = String(cand);
    }
    const tmdbId = Number(movieId);
    return { peliculaId, tmdbId: Number.isNaN(tmdbId) ? null : tmdbId };
  };

  const loadRatings = async (movieData?: any) => {
    try {
      const ids = await resolveIdentifiers(movieData ?? movie);
      // fetch average
      if (ids.peliculaId) {
        const res: any = await api.getRatingAverageByPelicula(ids.peliculaId);
        if (res && res.success && res.data) {
          setAvgRating(Number(res.data.average ?? 0));
          setRatingsCount(Number(res.data.count ?? 0));
        }
      } else if (ids.tmdbId) {
        const res: any = await api.getRatingAverageByTmdb(ids.tmdbId);
        if (res && res.success && res.data) {
          setAvgRating(Number(res.data.average ?? 0));
          setRatingsCount(Number(res.data.count ?? 0));
        }
      }

      // fetch user rating if authenticated
      if (isAuthenticated) {
        try {
          const resUser: any = await api.getUserRating({ pelicula_id: ids.peliculaId ?? undefined, tmdb_id: ids.tmdbId ?? undefined });
          if (resUser && resUser.success) {
            const data = resUser.data;
            setUserRating(data ? Number(data.rating) : null);
          }
        } catch (err) {
          console.error('Error fetching user rating', err);
        }
      } else {
        setUserRating(null);
      }
    } catch (err) {
      console.error('Error loading ratings', err);
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
      //alert('Debes iniciar sesión para eliminar tu comentario');
      toast.error('Debes iniciar sesión para eliminar tu comentario')
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
      //alert('Debes iniciar sesión para editar tu comentario');
      toast.error('Debes iniciar sesión para editar tu comentario')
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

  const handleRating = async (star: number) => {
    // Validate
    if (!Number.isInteger(star) || star < 1 || star > 5) return;

    // If not authenticated, redirect to login
    const token = localStorage.getItem('token');
    if (!token) {
      // show message and redirect
      setRatingMessage('Inicia sesión para calificar');
      setTimeout(() => setRatingMessage(null), 1800);
      navigate('/login');
      return;
    }

    if (savingRating) return; // debounce multiple clicks

    // Determine identifiers and payload
    const prev = userRating;
    let peliculaIdToSend: string | null = null;
    let tmdbIdToSend: number | null = null;
    try {
      // Try to resolve internal pelicula id from backend representation
      const movieResp: any = await api.getMovieById(movieId!);
      if (movieResp && movieResp.success && movieResp.data) {
        // prefer backend/internal id when available and only if it's a UUID
        const cand = movieResp.data.pelicula_id ?? movieResp.data.peliculaId ?? movieResp.data.movie_id ?? movieResp.data.id ?? null;
        if (isUuid(cand)) peliculaIdToSend = String(cand);
      }
    } catch (err) {
      // ignore and fallback
      console.warn('No se pudo resolver pelicula_id, se usará tmdb id si aplica');
    }
    const tmdbCandidate = Number(movieId);
    if (!peliculaIdToSend && !Number.isNaN(tmdbCandidate)) tmdbIdToSend = tmdbCandidate;

    // Prepare payload, priority pelicula_id
    const payload: any = { rating: star };
    if (peliculaIdToSend) payload.pelicula_id = peliculaIdToSend;
    if (!peliculaIdToSend && tmdbIdToSend) payload.tmdb_id = tmdbIdToSend;

    try {
      setSavingRating(true);
      setUserRating(star); // optimistic for visual

      await api.submitRating(payload);

      // Refresh average from server (recommended)
      await loadRatings();
      // Do not show explicit "Guardando" or "Calificación guardada" messages per UX request
    } catch (err: any) {
      console.error('Error saving rating', err);
      // Revert
      setUserRating(prev);
      const msg = String(err.message || err);
      if (msg.includes('status: 401') || msg.includes('status: 403')) {
        setRatingMessage('Inicia sesión para calificar');
        setTimeout(() => setRatingMessage(null), 1800);
        navigate('/login');
      } else {
        setRatingMessage('No se pudo guardar la calificación. Intenta de nuevo.');
        setTimeout(() => setRatingMessage(null), 2500);
      }
    } finally {
      setSavingRating(false);
    }
  };

  const handleFavorite = async () => {
    try {
      setLoadingFavorite(true);
      
      if (isFavorite) {
        const response = await api.removeFromFavorites(movieId!);
        if (response.success) {
          setIsFavorite(false);
          toast.success('Película eliminada de favoritos correctamente'); //toast
          console.log('✅ Eliminado de favoritos');
        }
      } else {
        const response = await api.addToFavorites(movieId!);
        if (response.success) {
          setIsFavorite(true);
          toast.success('Película añadida correctamente'); //toast
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
        //alert('Debes iniciar sesión para comentar');
        toast.error('Debes iniciar sesión para comentar')
        return;
      }

      // Resolve the internal movie id expected by the backend.
      // Backend may expect an internal UUID as `pelicula_id` or a TMDB id as `tmdb_id`.
      let payload: any = {
        usuario_id: user.id,
        contenido: comment.trim(),
      };

      try {
        const movieResp: any = await api.getMovieById(movieId!);
        if (movieResp && movieResp.success && movieResp.data) {
          // Prefer backend/internal id when available and it looks like a UUID
          const cand = movieResp.data.pelicula_id ?? movieResp.data.peliculaId ?? movieResp.data.movie_id ?? movieResp.data.id ?? null;
          if (cand && typeof cand === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(cand)) {
            payload.pelicula_id = String(cand);
          } else {
            // Fallback: send tmdb_id as number (route param)
            const tmdbCandidate = Number(movieId);
            if (!Number.isNaN(tmdbCandidate)) payload.tmdb_id = tmdbCandidate;
          }
        } else {
          // If we couldn't fetch movie details, at least send tmdb id (route)
          const tmdbCandidate = Number(movieId);
          if (!Number.isNaN(tmdbCandidate)) payload.tmdb_id = tmdbCandidate;
        }
      } catch (err) {
        console.warn('Could not resolve internal movie id, will send tmdb id as fallback', err);
        const tmdbCandidate = Number(movieId);
        if (!Number.isNaN(tmdbCandidate)) payload.tmdb_id = tmdbCandidate;
      }

      const response = await api.createComment(payload);

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
  
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);

  // Load Vimeo player API only when we have a trailer URL
  useEffect(() => {
    if (!trailerUrl) return;
    const id = 'vimeo-player-js';
    if (document.getElementById(id)) return;
    const script = document.createElement('script');
    script.id = id;
    script.src = 'https://player.vimeo.com/api/player.js';
    script.async = true;
    document.body.appendChild(script);
    // keep script in DOM to avoid reloading on fast toggles
  }, [trailerUrl]);


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
                  className={`star-btn${(userRating !== null && (userRating ?? 0) >= star) ? ' rated' : ''}`}
                  onClick={() => handleRating(star)}
                  aria-label={`Calificación ${star} estrellas`}
                  aria-pressed={userRating === star}
                  disabled={savingRating}
                >★</button>
              ))}
            </div>
            <span className="my-rating">Tu calificación: {userRating ? String(userRating) : '—'}</span>
            <span className="my-rating">Calificación: {avgRating.toFixed(1)} ({ratingsCount} {ratingsCount === 1 ? 'voto' : 'votos'})</span>
          {ratingMessage && (
            <div className="rating-message" style={{ marginTop: 6, color: '#9fe6a0' }}>{ratingMessage}</div>
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

       {/* 🎬 TRAILER */}
<div className="movie-player">
  {trailerUrl ? (
    <div style={{ padding: "56.25% 0 0 0", position: "relative" }}>
      <iframe
        src="https://player.vimeo.com/video/1131425612?title=0&byline=0&portrait=0&badge=0&autopause=0"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
        title="cmia"
      ></iframe>
    </div>
  ) : (
    <div className="fallback">🎬 Tráiler no disponible</div>
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