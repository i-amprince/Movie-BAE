import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './MovieDetails.css'; // This now safely imports the unique styles

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

  if (loading) return <div className="movie-details-page-loading-state">Loading...</div>;
  if (error) return <div className="movie-details-page-error-state">Error: {error}</div>;
  if (!movie) return <div className="movie-details-page-not-found-state">Movie not found.</div>;

  const containerStyle = {
    backgroundImage: `url(${movie.poster})`
  };

  return (
    <div className="movie-details-page-container" style={containerStyle}>
      <button
        className="movie-details-page-back-button"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>
      
      <main className="movie-details-page-main-content">
        <div className="movie-details-page-content-layout">
          <div className="movie-details-page-info-section">
            <h1 className="movie-details-page-title">{movie.title}</h1>
            <p className="movie-details-page-description">{movie.description}</p>
            
            <div className="movie-details-page-metadata">
              <span className="movie-details-page-metadata-item genre">{movie.genre}</span>
              <span className="movie-details-page-metadata-item rating">{movie.rating}</span>
              <span className="movie-details-page-metadata-item">{movie.duration}</span>
              <span className="movie-details-page-metadata-item">{movie.year}</span>
              
              {movie.imdbScore && (
                <span className="movie-details-page-imdb-badge">
                  <span className="movie-details-page-imdb-logo">IMDb</span>
                  <span className="movie-details-page-imdb-score">{movie.imdbScore}</span>
                  <svg className="movie-details-page-imdb-star" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span className="movie-details-page-imdb-total">/10</span>
                </span>
              )}
              
              <span className="movie-details-page-metadata-item price">₹{movie.fare}</span>
            </div>
            
            <div className="movie-details-page-cast-section">
              <h3 className="movie-details-page-cast-title">Casts:</h3>
              <div className="movie-details-page-cast-list">
                {movie.casts && movie.casts.map((cast, idx) => (
                  <span key={idx} className="movie-details-page-cast-member">{cast}</span>
                ))}
              </div>
            </div>
            
            <button
              className="movie-details-page-book-ticket-button"
              onClick={() => navigate(`/book/${id}`)}
            >
              Book Ticket
            </button>
          </div>
          
          <div className="movie-details-page-trailer-section">
            <h2 className="movie-details-page-trailer-title">Trailer</h2>
            {movie.trailerUrl && (
              <div className="movie-details-page-trailer-container">
                <iframe
                  className="movie-details-page-trailer-iframe"
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