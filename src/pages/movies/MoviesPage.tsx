import React from 'react';
import './MoviesPage.scss';

const MoviesPage: React.FC = () => {
  const movies = [
    { id: 1, title: 'The Shawshank Redemption', year: 1994 },
    { id: 2, title: 'The Godfather', year: 1972 },
    { id: 3, title: 'Inception', year: 2010 },
  ];

  return (
    <div className="movies-page">
      <div className="movies-container">
        <h2 className="movies-title">Lista de Películas</h2>
        <ul className="movies-list">
          {movies.map((m) => (
            <li key={m.id} className="movie-item">
              <div className="movie-info">
                <span className="movie-title">{m.title}</span>
                <span className="movie-year">{m.year}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MoviesPage;
