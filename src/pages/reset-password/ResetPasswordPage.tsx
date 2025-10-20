import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import "./ResetPasswordPage.scss";

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      const response = await fetch('http://localhost:3000/api/v1/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token, 
          nuevaContrasena: password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/inicio-sesion');
        }, 3000);
      } else {
        setError(data.message || "Error al restablecer la contraseña");
      }
    } catch (err: any) {
      setError(err.message || "Error de conexión");
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
            <div className="form-group">

              <div className="password-group">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Ingresa tu nueva contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`form-input ${error && password !== confirmPassword ? 'error' : ''}`}
                />
                {/* <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {/* {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )} 
                </button> */}
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
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirmar Contraseña
              </label>
              <div className="password-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  placeholder="Confirma tu nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`form-input ${error && password !== confirmPassword ? 'error' : ''}`}
                />
                {/* <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {/* {showConfirmPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )} 
                </button> */}
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