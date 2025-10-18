const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Log para debugging (se puede remover en producción)
if (import.meta.env.MODE === 'development') {
  console.log('🔧 Environment:', import.meta.env.MODE);
  console.log('🌐 API URL:', API_BASE_URL);
}

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
    
    // Advertencia si no hay URL configurada en producción
    if (!import.meta.env.VITE_API_URL && import.meta.env.MODE === 'production') {
      console.error('❌ VITE_API_URL no configurada en producción');
    }
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
      const url = `${this.baseURL}${endpoint}`;
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(requiresAuth),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.message_es || 'Error en la petición');
      }

      return data;
    } catch (error: any) {
      console.error('❌ API Error:', error);
      
      // Manejo de errores de red
      if (error.message === 'Failed to fetch') {
        throw new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
      }
      
      // Manejo de errores CORS
      if (error.message.includes('CORS')) {
        throw new Error('Error de CORS. Verifica la configuración del servidor.');
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
    }, true);
  }

  async forgotPassword(email: string) {
    return this.request('/users/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ correo: email }),
    });
  }

  async resetPassword(token: string, nuevaContrasena: string) {
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

  // ========== USUARIOS ==========

  async getUsers() {
    return this.request('/users', { method: 'GET' });
  }

  // ========== UTILIDADES ==========

  /**
   * Verifica si la API está disponible
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL.replace('/api/v1', '')}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Obtiene la URL base de la API
   */
  getBaseURL(): string {
    return this.baseURL;
  }
}

const api = new ApiService();

// Convenience named export usado por algunos componentes (e.g. HomePage)
export const getUsers = async () => {
  const res = await api.getUsers();
  return res?.data ?? res;
};

export default api;