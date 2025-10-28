import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  message_es?: string;
  data?: T;
  error?: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
    if (!this.baseURL) console.warn('VITE_API_URL no configurada, usando localhost');
  }

  private getHeaders(includeAuth: boolean = false): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (includeAuth) {
      const token = localStorage.getItem('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth: boolean = false
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(requiresAuth),
          ...options.headers,
        },
      });

      // Manejar respuestas sin body (204) o sin JSON
      const contentType = response.headers.get('content-type') || '';
      let data: any = {};

      if (response.status !== 204 && contentType.includes('application/json')) {
        // Sólo parseamos JSON cuando el servidor devuelve JSON
        data = await response.json();
      }

      if (!response.ok) {
        // Si el servidor devolvió JSON con mensajes, úsalos; si no, lanza genérico
        const message = (data && (data.message || data.message_es)) || 'Error en la petición';
        // Añadimos endpoint y status al error para facilitar el debugging desde el front
        throw new Error(`${message} (endpoint: ${endpoint}, status: ${response.status})`);
      }

      return data;
    } catch (error: any) {
      console.error('❌ API Error:', error);
      
      // Manejo de errores de red
      if (error.message === 'Failed to fetch') {
        throw new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
      }
      
      throw error;
    }
  }
  // ========== AUTENTICACIÓN ==========
  
  async register(userData: {
    nombres: string;
    apellidos: string;
    edad: number;
    correo: string;
    contrasena: string;
  }) {
    return this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { correo: string; contrasena: string }) {
    return this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/users/logout', {
      method: 'POST',
    }, true); // Requiere autenticación
  }

  async forgotPassword(email: string) {
    // Basic client-side validation
    if (!email || typeof email !== 'string') {
      throw new Error('Email inválido');
    }
    // Optional: simple email regex
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Email inválido');
    }

    return this.request('/users/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ correo: email }),
    });
  }

  async resetPassword(token: string, nuevaContrasena: string) {
    if (!token || typeof token !== 'string') {
      throw new Error('Token inválido');
    }
    if (!nuevaContrasena || nuevaContrasena.length < 8) {
      throw new Error('La nueva contraseña debe tener al menos 8 caracteres');
    }

    return this.request('/users/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, nuevaContrasena }),
    });
  }

  // ========== PERFIL DE USUARIO ==========
  
  async getProfile() {
    return this.request('/users/me', { method: 'GET' }, true);
  }

  async updateProfile(userData: {
    nombres?: string;
    apellidos?: string;
    edad?: number;
    contrasena?: string;
  }) {
    return this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    }, true);
  }

  async deleteAccount(password?: string) {
    return this.request('/users/me', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    }, true);
  }

  // // ========== PELÍCULAS ==========
  
  // async getMovies() {
  //   return this.request('/movies', { method: 'GET' });
  // }

  // async getMovieById(id: string) {
  //   return this.request(`/movies/${id}`, { method: 'GET' });
  // }

  // async searchMovies(nombre: string) {
  //   return this.request(`/movies/search/${nombre}`, { method: 'GET' });
  // }

  // async getMoviesByGenre(genero: string) {
  //   return this.request(`/movies/genero/${genero}`, { method: 'GET' });
  // }

  // // ========== FAVORITOS ==========
  
  // async getFavorites() {
  //   return this.request('/favorites', { method: 'GET' }, true);
  // }

  // async addToFavorites(movieId: string) {
  //   return this.request('/favorites', {
  //     method: 'POST',
  //     body: JSON.stringify({ movieId }),
  //   }, true);
  // }

  // async removeFromFavorites(movieId: string) {
  //   return this.request(`/favorites/${movieId}`, {
  //     method: 'DELETE',
  //   }, true);
  // }

  // async checkIfFavorite(movieId: string) {
  //   return this.request(`/favorites/check/${movieId}`, {
  //     method: 'GET',
  //   }, true);
  // }

  // async getFavoritesStats() {
  //   return this.request('/favorites/stats', { method: 'GET' }, true);
  // }

  // async clearAllFavorites() {
  //   return this.request('/favorites', { method: 'DELETE' }, true);
  // }

  // ========== PELÍCULAS - TMDB ==========
  
  async getMovies(limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/movies${params}`, { method: 'GET' });
  }

  async getMovieById(id: string) {
    return this.request(`/movies/${id}`, { method: 'GET' });
  }

  async searchMovies(nombre: string) {
    return this.request(`/movies/search/${encodeURIComponent(nombre)}`, { 
      method: 'GET' 
    });
  }

  async getMoviesByGenre(genero: string, limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/movies/genero/${encodeURIComponent(genero)}${params}`, { 
      method: 'GET' 
    });
  }
  // metodo para mostrar trailer en WatchMoviePage
async getMovieTrailer(movieId: string) {
  return this.request(`/movies/${encodeURIComponent(movieId)}/trailer`, { 
    method: 'GET' 
  });
}



  // ========== FAVORITOS ==========
  
  async getFavorites() {
    return this.request('/favorites', { method: 'GET' }, true);
  }

  async addToFavorites(movieId: string) {
    return this.request('/favorites', {
      method: 'POST',
      body: JSON.stringify({ movieId }),
    }, true);
  }

  async removeFromFavorites(movieId: string) {
    return this.request(`/favorites/${movieId}`, {
      method: 'DELETE',
    }, true);
  }

  async checkIfFavorite(movieId: string) {
    return this.request(`/favorites/check/${movieId}`, {
      method: 'GET',
    }, true);
  }

  async getFavoritesStats() {
    return this.request('/favorites/stats', { method: 'GET' }, true);
  }

   async clearAllFavorites() {
    return this.request('/favorites', { method: 'DELETE' }, true);
  }

  // ========== COMENTARIOS ==========
  
  async getComments() {
    return this.request('/comments', { method: 'GET' });
  }

  async getCommentsByMovie(movieId: string) {
    return this.request(`/comments/movie/${movieId}`, { method: 'GET' });
  }

  async getCommentsByUser(userId: string) {
    return this.request(`/comments/user/${userId}`, { method: 'GET' });
  }

  async createComment(commentData: {
    usuario_id: string;
    pelicula_id?: string;
    tmdb_id?: number;
    contenido: string;
  }) {
    // Build body so we can send either an internal pelicula_id (UUID) or a tmdb_id (number)
    const body: any = {
      usuario_id: commentData.usuario_id,
      contenido: commentData.contenido,
    };
    if (commentData.pelicula_id) body.pelicula_id = commentData.pelicula_id;
    // If pelicula_id not provided but tmdb_id is, send tmdb_id instead
    if (!commentData.pelicula_id && typeof commentData.tmdb_id === 'number') body.tmdb_id = commentData.tmdb_id;

    return this.request('/comments', {
      method: 'POST',
      body: JSON.stringify(body),
    }, true);
  }

  async updateComment(id: string, contenido: string, usuario_id: string) {
    return this.request(`/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ contenido, usuario_id }),
    }, true);
  }

  async deleteComment(id: string, usuario_id: string) {
    return this.request(`/comments/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ usuario_id }),
    }, true);
  }

  // ========== RATINGS ==========

  // Obtener promedio por tmdb id (público)
  async getRatingAverageByTmdb(tmdbId: number) {
    return this.request(`/ratings/average?tmdb_id=${tmdbId}`, { method: 'GET' });
  }

  // Obtener promedio por pelicula id (público)
  async getRatingAverageByPelicula(peliculaId: string) {
    return this.request(`/ratings/pelicula/${peliculaId}/average`, { method: 'GET' });
  }

  // Obtener calificación del usuario actual para una película (requiere auth)
  // Se puede pasar tmdb_id o pelicula_id como query
  async getUserRating(opts: { tmdb_id?: number; pelicula_id?: string }) {
    const params: string[] = [];
    if (opts.tmdb_id) params.push(`tmdb_id=${opts.tmdb_id}`);
    if (opts.pelicula_id) params.push(`pelicula_id=${encodeURIComponent(opts.pelicula_id)}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.request(`/ratings/user${qs}`, { method: 'GET' }, true);
  }

  // Guardar / actualizar calificación (requiere auth)
  async submitRating(data: { pelicula_id?: string | null; tmdb_id?: number | null; rating: number }) {
    const body: any = { rating: data.rating };
    if (data.pelicula_id) body.pelicula_id = data.pelicula_id;
    if (data.tmdb_id) body.tmdb_id = data.tmdb_id;
    return this.request('/ratings', {
      method: 'POST',
      body: JSON.stringify(body),
    }, true);
  }

  // ========== USUARIOS (ADMIN / listado público si aplica) ==========

  async getUsers() {
    return this.request('/users', { method: 'GET' });
  }


}

const api = new ApiService();

// Convenience named export used by some components (e.g. HomePage)
export const getUsers = async () => {
  const res = await api.getUsers();
  return res?.data ?? res;
};

// =========================
// YouTube SERVICE
// =========================
const YT_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YT_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const YouTubeService = {
  async searchTrailer(title: string) {
    const res = await axios.get(`${YT_BASE_URL}/search`, {
      params: {
        key: YT_API_KEY,
        q: `${title} trailer oficial`,
        part: 'snippet',
        type: 'video',
        maxResults: 1,
      },
    });
    if (res.data.items.length > 0) {
      return res.data.items[0];
    }
    return null;
  },
};



export default api;