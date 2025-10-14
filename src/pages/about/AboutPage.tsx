import React from "react";
import "./AboutPage.scss";
import { useNavigate } from "react-router";

/**
 * About page describing the CrunchyEISC team and purpose.
 *
 * @component
 * @returns {JSX.Element} A brief description about the team.
 */
const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  return (
     <div className="home-page">
      {/* Hero Section con fondo borroso de películas */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            Sobre Nosotros
          </h1>
          <p className="hero-subtitle">
            Somos un pequeño equipo de desarrollo amantes de las 
            <br />
            peliculas y el desarrollo web, hemos creado esta aplicación <br/>
            para que otras personas que al igual que nosotros aman el <br/>
            cine puedan disfrutar de sus peliculas favoritas de forma <br/>
            gratuita y sin interrupciones.
          </p>
          <button className="cta-button" onClick={() => navigate("/inicio-sesion")}>Comenzar</button>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;