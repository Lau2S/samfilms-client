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
        throw new Error(message);
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

  // ========== PELÍCULAS ==========
  
  async getMovies() {
    return this.request('/movies', { method: 'GET' });
  }

  async getMovieById(id: string) {
    return this.request(`/movies/${id}`, { method: 'GET' });
  }

  async searchMovies(nombre: string) {
    return this.request(`/movies/search/${nombre}`, { method: 'GET' });
  }

  async getMoviesByGenre(genero: string) {
    return this.request(`/movies/genero/${genero}`, { method: 'GET' });
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
    pelicula_id: string;
    contenido: string;
  }) {
    return this.request('/comments', {
      method: 'POST',
      body: JSON.stringify(commentData),
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
// TMDb SERVICE
// =========================
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const TMDbService = {
  async getPopularMovies() {
    const res = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: { api_key: TMDB_API_KEY, language: 'es-ES', page: 1 },
    });
    return res.data.results;
  },

  async getMovieById(id: string) {
    const res = await axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
      params: { api_key: TMDB_API_KEY, language: 'es-ES' },
    });
    return res.data;
  },

  async getMoviesByGenre(genreId: number) {
    const res = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
      params: { api_key: TMDB_API_KEY, with_genres: genreId, language: 'es-ES' },
    });
    return res.data.results;
  },

  async searchMovies(query: string) {
    const res = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: { api_key: TMDB_API_KEY, query, language: 'es-ES' },
    });
    return res.data.results;
  },

  // 🧠 Lo que usaremos para el WatchMoviePage
  async getMovieVideos(id: string) {
    const res = await axios.get(`${TMDB_BASE_URL}/movie/${id}/videos`, {
      params: { api_key: TMDB_API_KEY, language: 'es-ES' },
    });
    return res.data.results.filter((v: any) => v.site === 'YouTube' && v.type === 'Trailer');
  },
  async getMovieDetails(id: string) {
    const res = await axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
      params: { 
        api_key: TMDB_API_KEY,
        language: 'es-ES',
      },
    });
    return res.data;
  },
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