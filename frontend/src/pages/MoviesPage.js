import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './MoviesPage.css';
import { AuthContext } from '../context/AuthContext';

const MoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTrailer, setShowTrailer] = useState(false);
  const [selectedTrailer, setSelectedTrailer] = useState('');
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/movies');
        if (!response.ok) throw new Error('Failed to fetch movies');
        const data = await response.json();
        setMovies(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const genres = ['All', ...new Set(movies.map(movie => movie.genre))];

  const filteredMovies = movies.filter(movie => {
    const matchesGenre = selectedGenre === 'All' || movie.genre === selectedGenre;
    const matchesSearch =
      movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  const handleTrailerClick = (trailerUrl) => {
    setSelectedTrailer(trailerUrl);
    setShowTrailer(true);
  };

  const handleBookTicket = (movieId) => {
    if (!user) {
      navigate('/signin');
      return;
    }
    navigate(`/book/${movieId}`);
  };

  const handleCardClick = (movieId, e) => {
    // Prevent navigation if clicking on a button inside the card
    if (e.target.closest('.movies-trailer-btn') || e.target.closest('.movies-book-btn')) return;
    navigate(`/movies/${movieId}`);
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  };

  return (
    <div className="movies-page-wrapper">
      <div className="movies-main-container">
        <div className="movies-page-header">
          <h1>Now Showing</h1>
          <p>Discover and book tickets for the latest movies</p>
        </div>
        <div className="movies-filters-section">
          <div className="movies-search-container">
            <div className="movies-search-input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <svg className="movies-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search movies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="movies-search-input"
                style={{ minWidth: 0, flex: 1 }}
              />
              <select
                value={selectedGenre}
                onChange={e => setSelectedGenre(e.target.value)}
                className="movies-genre-dropdown"
                style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid #ccc', fontSize: '1rem', background: '#18181b', color: '#fff' }}
              >
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="movies-loading-spinner">
            <div className="movies-spinner"></div>
            <p>Loading movies...</p>
          </div>
        ) : error ? (
          <div className="movies-error-message">
            <h2>Error loading movies</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : (
          <div className="movies-grid-container">
            {filteredMovies.length === 0 ? (
              <div className="movies-no-results">
                <h3>No movies found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              filteredMovies.map(movie => (
                <div
                  key={movie._id}
                  className="movies-card"
                  onClick={(e) => handleCardClick(movie._id, e)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="movies-poster-container">
                    <img
                      src={movie.poster || '/placeholder-poster.jpg'}
                      alt={movie.title}
                      onError={e => { e.target.src = '/placeholder-poster.jpg'; }}
                      className="movies-poster-image"
                    />
                    <div className="movies-card-overlay">
                      <div className="movies-overlay-actions">
                        {movie.trailerUrl && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleTrailerClick(movie.trailerUrl); }}
                            className="movies-trailer-btn"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polygon points="5,3 19,12 5,21"/>
                            </svg>
                            Trailer
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleBookTicket(movie._id); }}
                          className="movies-book-btn"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="movies-card-info">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                      <h3 className="movies-card-title" style={{ margin: 0 }}>{movie.title}</h3>
                      <span className="movies-card-fare-badge">₹{movie.fare}</span>
                    </div>
                    <p className="movies-card-description">{movie.description}</p>
                    <div className="movies-card-meta">
                      <span className="movies-card-genre">{movie.genre}</span>
                      <span className="movies-meta-separator">•</span>
                      <span className="movies-card-rating">{movie.rating}</span>
                      <span className="movies-meta-separator">•</span>
                      <span className="movies-card-duration">{movie.duration}</span>
                      <span className="movies-meta-separator">•</span>
                      <span className="movies-card-year">{movie.year}</span>
                    </div>
                    {movie.imdbScore && (
                      <div className="movies-imdb-rating">
                        <span className="movies-imdb-label">IMDb</span>
                        <span className="movies-imdb-score">{movie.imdbScore}</span>
                        <div className="movies-imdb-stars">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <span className="movies-rating-text">/10</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {showTrailer && (
          <div className="movies-modal-overlay" onClick={() => setShowTrailer(false)}>
            <div className="movies-modal-content" onClick={e => e.stopPropagation()}>
              <div className="movies-modal-header">
                <h3>Movie Trailer</h3>
                <button onClick={() => setShowTrailer(false)} className="movies-modal-close-btn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div className="movies-modal-body">
                <div className="movies-video-container">
                  <iframe
                    width="100%"
                    height="400"
                    src={getYouTubeEmbedUrl(selectedTrailer)}
                    title="Movie Trailer"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoviesPage;