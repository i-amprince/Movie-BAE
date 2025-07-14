import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './MovieDetails.css';

const getYouTubeEmbedUrl = (url) => {
  if (!url) return '';
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/) || url.match(/v=([\w-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : '';
};

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'https://movie-bae-backend.onrender.com/api';
        const response = await fetch(`${apiUrl}/movies/${id}`);
        if (!response.ok) throw new Error('Failed to fetch movie');
        const data = await response.json();
        setMovie(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  if (loading) return <div className="loading-state">Loading...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;
  if (!movie) return <div className="not-found-state">Movie not found.</div>;

  const containerStyle = {
    backgroundImage: `url(${movie.poster})`
  };

  return (
    <div className="movie-details-container" style={containerStyle}>
      <button
        className="back-button"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>
      
      <main className="main-content">
        <div className="content-layout">
          <div className="movie-info-section">
            <h1 className="movie-title">{movie.title}</h1>
            <p className="movie-description">{movie.description}</p>
            
            <div className="movie-metadata">
              <span className="metadata-item genre">{movie.genre}</span>
              <span className="metadata-item rating">{movie.rating}</span>
              <span className="metadata-item">{movie.duration}</span>
              <span className="metadata-item">{movie.year}</span>
              
              {movie.imdbScore && (
                <span className="imdb-badge">
                  <span className="imdb-logo">IMDb</span>
                  <span className="imdb-score">{movie.imdbScore}</span>
                  <svg className="imdb-star" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span className="imdb-total">/10</span>
                </span>
              )}
              
              <span className="metadata-item price">₹{movie.fare}</span>
            </div>
            
            <div className="cast-section">
              <h3 className="cast-title">Casts:</h3>
              <div className="cast-list">
                {movie.casts && movie.casts.map((cast, idx) => (
                  <span key={idx} className="cast-member">{cast}</span>
                ))}
              </div>
            </div>
            
            <button
              className="book-ticket-button"
              onClick={() => navigate(`/book/${id}`)}
            >
              Book Ticket
            </button>
          </div>
          
          <div className="trailer-section">
            <h2 className="trailer-title">Trailer</h2>
            {movie.trailerUrl && (
              <div className="trailer-container">
                <iframe
                  className="trailer-iframe"
                  src={getYouTubeEmbedUrl(movie.trailerUrl)}
                  title="Movie Trailer"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MovieDetails;