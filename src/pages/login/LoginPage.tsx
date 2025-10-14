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
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    // Aquí irá la lógica de autenticación
    const url: string = "https://movie-platform-back.onrender.com/api/v1/users/login";
    try {
      const response = await fetch(url, {
        method: "POST", 
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          correo: email,
          contrasena: password
        }) 
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      console.log("respuesta del servidor",result)
      if (result.success) {
        localStorage.setItem("token", result.session.access_token);
        localStorage.setItem("user", JSON.stringify(result.user));

        console.log("Inicio de sesión exitoso:", result.user);
        // Redirect to peliculas list
        navigate('/peliculas');
      } else {
        alert(result.message || "Credenciales inválidas");
      }
    } catch (error:any) {
      console.error(error.message);
    }
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
                {/* {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )} */}
              </button>
            </div>

            {/* Botón de Submit */}
            <button type="submit" className="submit-button">
              Iniciar Sesion
            </button>

            {/* Enlace de olvido de contraseña */}
            <div className="forgot-password-container">
              <button
                type="button"
                className="forgot-password-link"
                onClick={() => { setForgotOpen(true); setForgotMessage(null); }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>

          {/* Enlace de registro */}
          <div className="signup-prompt">
            <span>¿Primera vez en Samfilms? </span>
            <a href="/registro" className="signup-link">
              Crea tu cuenta aqui
            </a>
          </div>

          {/* Forgot password modal */}
          {forgotOpen && (
            <div className="modal-overlay" role="dialog" aria-modal="true">
              <div className="forgot-modal">
                <button className="modal-close" onClick={() => setForgotOpen(false)} aria-label="Cerrar modal">×</button>

                <h3>Recuperar contraseña</h3>
                <p>Ingresa tu correo y te enviaremos un enlace para restablecer la contraseña.</p>
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
                    onClick={async () => {
                      if (!forgotEmail) {
                        setForgotMessage('Ingresa un correo válido.');
                        return;
                      }
                      setForgotLoading(true);
                      setForgotMessage(null);
                      try {
                        const res = await fetch('http://localhost:3000/api/v1/users/forgot-password', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ correo: forgotEmail }),
                        });
                        const data = await res.json();
                        if (res.ok) {
                          setForgotMessage(data.message || 'Correo enviado. Revisa tu bandeja.');
                        } else {
                          setForgotMessage(data.message || 'Ocurrió un error al enviar el correo.');
                        }
                      } catch (err:any) {
                        setForgotMessage(err.message || 'Error de red');
                      } finally {
                        setForgotLoading(false);
                      }
                    }}
                  >
                    {forgotLoading ? 'Enviando...' : 'Enviar correo'}
                  </button>
                  <button className="btn-register" onClick={() => setForgotOpen(false)}>Cancelar</button>
                </div>
                {forgotMessage && <p className="forgot-message">{forgotMessage}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;