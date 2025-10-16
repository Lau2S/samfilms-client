import React, { useEffect } from "react";
import "./HomePage.scss";
import { useNavigate } from "react-router";
import { getUsers } from "../../services/api.ts";

/**
 * Home (landing) page of the application.
 *
 * @component
 * @returns {JSX.Element} The landing view with a CTA button to browse movies.
 */
const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // ✅ Esto se ejecuta cuando se carga la página
  useEffect(() => {
    getUsers()
      .then((data) => console.log("✅ Conectado al backend. Usuarios:", data))
      .catch((err) => console.error("❌ Error conectando al backend:", err));
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section con fondo borroso de películas */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            Tu entretenimiento
            <br />
            sin límites
          </h1>
          <p className="hero-subtitle">
            Disfruta de películas y series gratis en cualquier lugar, en todos tus
            <br />
            dispositivos y sin anuncios
          </p>
          <button className="cta-button" onClick={() => navigate("/inicio-sesion")}>Comenzar</button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;