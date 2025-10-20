import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import api from "../../services/api";
import "./LoginPage.scss";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result: any = await api.login({ correo: email, contrasena: password });
      if (result && result.success && result.data) {
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));
        navigate("/peliculas");
        return;
      }
      setError(result?.message || "Credenciales inválidas");
    } catch (err: any) {
      setError(err?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (forgotOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [forgotOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setForgotOpen(false);
      }
    };

    if (forgotOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [forgotOpen]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setForgotOpen(false);
    }
  };

  // ✅ USAR EL API SERVICE EN LUGAR DE FETCH DIRECTO
  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      setForgotMessage('Ingresa un correo válido.');
      return;
    }
    
    setForgotLoading(true);
    setForgotMessage(null);
    
    try {
      console.log('📧 Enviando solicitud de recuperación a:', forgotEmail);
      
      // ✅ Usar el API service centralizado
      const response = await api.forgotPassword(forgotEmail);
      
      console.log('✅ Respuesta del servidor:', response);
      
      if (response.success) {
        setForgotMessage(
          response.message || 
          response.message_es || 
          'Correo enviado. Revisa tu bandeja de entrada.'
        );
      } else {
        setForgotMessage(
          response.message || 
          response.message_es || 
          'Ocurrió un error al enviar el correo.'
        );
      }
    } catch (error: any) {
      console.error('❌ Error en forgot password:', error);
      setForgotMessage(
        error.message || 
        'Error al conectar con el servidor. Verifica tu conexión.'
      );
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          {/* Botón de regresar */}
          <button className="back-button" onClick={handleBack} aria-label="Regresar">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Título */}
          <h1 className="login-title">Inicia Sesion</h1>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Campo de Email */}
            <div className="form-group">
              <input
                type="email"
                id="email"
                placeholder="Ingresa tu Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
            </div>

            {/* Campo de Contraseña */}
            <div className="form-group password-group">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Ingresa tu Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {/* Iconos comentados */}
              </button>
            </div>

            {/* Botón de Submit */}
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Iniciando...' : 'Iniciar Sesion'}
            </button>

            {error && <p className="form-error" role="alert">{error}</p>}

            {/* Enlace de olvido de contraseña */}
            <div className="forgot-password-container">
              <button
                type="button"
                className="forgot-password-link"
                onClick={() => { 
                  setForgotOpen(true); 
                  setForgotMessage(null);
                  setForgotEmail('');
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>

          {/* Enlace de registro */}
          <div className="signup-prompt">
            <span>¿Primera vez en Samfilms? </span>
            <Link to="/registro" className="signup-link">
              Crea tu cuenta aqui
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot password modal */}
      {forgotOpen && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="forgot-modal">
            <button 
              className="modal-close" 
              onClick={() => setForgotOpen(false)} 
              aria-label="Cerrar modal"
            >
              ×
            </button>

            <h3>Recuperar contraseña</h3>
            <p className="modal-sub">
              Ingresa tu correo y te enviaremos un enlace para restablecer la contraseña.
            </p>
            
            <input
              type="email"
              placeholder="Tu correo"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="form-input"
            />
            
            <div className="modal-actions">
              <button
                className="submit-button"
                onClick={handleForgotPassword}
                disabled={forgotLoading}
              >
                {forgotLoading ? 'Enviando...' : 'Enviar correo'}
              </button>
              <button 
                className="btn-register" 
                onClick={() => setForgotOpen(false)}
              >
                Cancelar
              </button>
            </div>
            
            {forgotMessage && (
              <p className="forgot-message">{forgotMessage}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;