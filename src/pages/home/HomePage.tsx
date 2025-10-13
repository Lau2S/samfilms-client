import React from "react";
import "./HomePage.css";
import { useNavigate } from "react-router";

/**
 * Home (landing) page of the application.
 *
 * @component
 * @returns {JSX.Element} The landing view with a CTA button to browse movies.
 * @example
 * // Renders a title, subtitle, and a button that navigates to "/peliculas"
 * <HomePage />
 */
const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>SamFilms</h1>
      <h2>Disfruta de las mejores peliculas aqui</h2>
      <button onClick={() => navigate("peliculas")}>Ver peliculas</button>
    </div>
  );
};

export default HomePage;