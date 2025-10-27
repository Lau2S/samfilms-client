import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import api from "../../services/api";
import "./ResetPasswordPage.scss";

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Password validation
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  useEffect(() => {
    if (!token) {
      setError("Token inválido o expirado");
    }
  }, [token]);

  useEffect(() => {
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    });
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (!passwordValidation.minLength || !passwordValidation.hasUpperCase || 
        !passwordValidation.hasLowerCase || !passwordValidation.hasNumber ||
        !passwordValidation.hasSpecialChar) {
      setError("La contraseña no cumple con los requisitos mínimos");
      return;
    }

    if (!token) {
      setError("Token inválido o expirado");
      return;
    }

    setLoading(true);

    try {
      console.log('🔐 Restableciendo contraseña con token...');
      
      // ✅ Usar el API service centralizado
      const response = await api.resetPassword(token, password);

      console.log('✅ Respuesta del servidor:', response);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/inicio-sesion');
        }, 3000);
      } else {
        setError(
          response.message || 
          response.message_es || 
          "Error al restablecer la contraseña"
        );
      }
    } catch (error: any) {
      console.error('❌ Error restableciendo contraseña:', error);
      setError(
        error.message || 
        "Error al conectar con el servidor"
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="reset-password-page">
        <div className="reset-container">
          <div className="reset-card">
            <div className="reset-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h1 className="reset-title">¡Contraseña Restablecida!</h1>
            <p className="reset-subtitle">
              Tu contraseña ha sido actualizada exitosamente. Serás redirigido al inicio de sesión en unos segundos...
            </p>
            <div className="back-to-login">
              <Link to="/inicio-sesion">Ir al inicio de sesión ahora</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="reset-container">
        <div className="reset-card">
          <h1 className="reset-title">Restablecer Contraseña</h1>
          <p className="reset-subtitle">
            Ingresa tu nueva contraseña
          </p>

          <form onSubmit={handleSubmit} className="reset-form">
            {/* Nueva Contraseña */}
            <div className="form-group password-group">
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Ingresa tu nueva contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`form-input ${error && password !== confirmPassword ? 'error' : ''}`}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="3.2" />
                      <path d="M2 12C3.5 7.3 7.5 4 12 4s8.5 3.3 10 8-3.5 8-10 8-8.5-3.3-10-8z" />
                    </svg>
                  ) : (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="3.2" />
                      <path d="M2 12C3.5 7.3 7.5 4 12 4s8.5 3.3 10 8-3.5 8-10 8-8.5-3.3-10-8z" />
                      <line
                        x1="3"
                        y1="3"
                        x2="21"
                        y2="21"
                        stroke="#8b5cf6"
                        strokeWidth="2"
                      />
                    </svg>
                  )}
                </button>
              </div>
              
              {password && (
                <div className="password-requirements">
                  <p>La contraseña debe contener:</p>
                  <ul>
                    <li className={passwordValidation.minLength ? 'valid' : ''}>
                      Al menos 8 caracteres
                    </li>
                    <li className={passwordValidation.hasUpperCase ? 'valid' : ''}>
                      Una letra mayúscula
                    </li>
                    <li className={passwordValidation.hasLowerCase ? 'valid' : ''}>
                      Una letra minúscula
                    </li>
                    <li className={passwordValidation.hasNumber ? 'valid' : ''}>
                      Un número
                    </li>
                    <li className={passwordValidation.hasSpecialChar ? 'valid' : ''}>
                      Un carácter especial (!@#$%^&*...)
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div className="form-group password-group">
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  placeholder="Confirma tu nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`form-input ${error && password !== confirmPassword ? 'error' : ''}`}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="3.2" />
                      <path d="M2 12C3.5 7.3 7.5 4 12 4s8.5 3.3 10 8-3.5 8-10 8-8.5-3.3-10-8z" />
                    </svg>
                  ) : (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="3.2" />
                      <path d="M2 12C3.5 7.3 7.5 4 12 4s8.5 3.3 10 8-3.5 8-10 8-8.5-3.3-10-8z" />
                      <line
                        x1="3"
                        y1="3"
                        x2="21"
                        y2="21"
                        stroke="#8b5cf6"
                        strokeWidth="2"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" className="submit-button" disabled={loading || !token}>
              {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
            </button>
          </form>

          <div className="back-to-login">
            <Link to="/inicio-sesion">Volver al inicio de sesión</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;