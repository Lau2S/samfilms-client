import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import "./RegisterPage.scss";
import { Link } from "react-router";
import api from "../../services/api.ts";

/**
 * Register page with user registration form.
 *
 * @component
 * @returns {JSX.Element} Registration form with all required user inputs.
 */
const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    edad: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  useEffect(() => {
    setPasswordValidation({
      minLength: formData.password.length >= 8,
      hasUpperCase: /[A-Z]/.test(formData.password),
      hasLowerCase: /[a-z]/.test(formData.password),
      hasNumber: /[0-9]/.test(formData.password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password),
    });
  }, [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      const result = await api.register({
        nombres: formData.nombre,
        apellidos: formData.apellido,
        edad: parseInt(formData.edad),
        correo: formData.email,
        contrasena: formData.password,
      });

      if (result.success) {
        alert("Registro exitoso");
        navigate("/inicio-sesion");
      }
    } catch (error: any) {
      alert(error.message || "Error al registrar");
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
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
          <h1 className="register-title">Crea tu Cuenta</h1>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="register-form">
            {/* Campo de Nombre */}
            <div className="form-group">
              <input
                type="text"
                name="nombre"
                placeholder="Ingresa tu Nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            {/* Campo de Apellido */}
            <div className="form-group">
              <input
                type="text"
                name="apellido"
                placeholder="Ingresa tu Apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            {/* Campo de Email */}
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Ingresa tu Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            {/* Campo de Edad */}
            <div className="form-group">
              <input
                type="number"
                name="edad"
                placeholder="Ingresa tu Edad"
                value={formData.edad}
                onChange={handleChange}
                required
                min="18"
                max="120"
                className="form-input"
              />
            </div>

            {/* Campo de Contraseña */}
            <div className="form-group password-group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Ingresa tu Contraseña"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="form-input"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {/* Iconos comentados */}
              </button>
              
              {formData.password && (
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

            {/* Campo de Confirmar Contraseña */}
            <div className="form-group password-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirma tu Contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
                className="form-input"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword((s) => !s)}
                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {/* Iconos comentados */}
              </button>
            </div>

            {/* Botón de Submit */}
            <button type="submit" className="submit-button" >
              Crear Cuenta
            </button>
          </form>

          {/* Enlace de login */}
          <div className="login-prompt">
            <span>¿Ya tienes una cuenta? </span>
            <Link to="/inicio-sesion" className="login-link">
              Inicia Sesion aqui
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;