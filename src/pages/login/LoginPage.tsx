import React, { useState } from "react";
import { useNavigate } from "react-router";
import "./LoginPage.scss";

/**
 * Login page with authentication form.
 *
 * @component
 * @returns {JSX.Element} Login form with email and password inputs.
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí irá la lógica de autenticación
    console.log("Login:", { email, password });
  };

  const handleBack = () => {
    navigate("/");
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

            {/* Enlace de olvido de contraseña */}
            <div className="forgot-password-container">
              <a href="#" className="forgot-password-link">
                ¿Olvidaste tu contraseña?
              </a>
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
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {/* Botón de Submit */}
            <button type="submit" className="submit-button">
              Iniciar Sesion
            </button>
          </form>

          {/* Enlace de registro */}
          <div className="signup-prompt">
            <span>¿Primera vez en Samfilms? </span>
            <a href="/registro" className="signup-link">
              Crea tu cuenta aqui
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;