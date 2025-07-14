import React, { useState, useEffect } from 'react';
import './MovieBookingLanding.css';
import moviePoster from '../images/movie-poster.jpg';

const getYouTubeEmbedUrl = (url) => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/) || url.match(/v=([\w-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1` : '';
};

const MovieBookingLanding = () => {
  const [showTrailer, setShowTrailer] = useState(false);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMostBookedMovie = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/analytics/most-booked-movie', {
          headers: {
            // No auth required for this endpoint on landing
          }
        });
        const data = await res.json();
        setMovie(data.mostBookedMovie);
      } catch (err) {
        setMovie(null);
      }
      setLoading(false);
    };
    fetchMostBookedMovie();
  }, []);

  const handleShowTrailer = () => {
    setShowTrailer(true);
  };

  const handleBookTicket = () => {
    if (movie && movie._id) {
      window.location.href = `/book/${movie._id}`;
    } else {
      alert('No movie available to book.');
    }
  };

  // Use the movie's poster if available, otherwise fallback to default
  const backgroundImage = movie && movie.poster ? movie.poster : moviePoster;
  const backgroundStyle = {
    minHeight: '100vh',
    background: `linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.3) 100%), url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    position: 'relative',
    overflow: 'hidden',
  };

  if (loading) {
    return <div className="landing-container" style={backgroundStyle}><div className="main-content"><div className="content-container"><div className="movie-info"><div className="movie-details"><h1 className="movie-title">Loading...</h1></div></div></div></div></div>;
  }
  if (!movie) {
    return <div className="landing-container" style={backgroundStyle}><div className="main-content"><div className="content-container"><div className="movie-info"><div className="movie-details"><h1 className="movie-title">No popular movie found.</h1></div></div></div></div></div>;
  }

  return (
    <div className="landing-container" style={backgroundStyle}>
      {/* Main Content */}
      <main className="main-content">
        <div className="content-container">
          <div className="movie-info">
            <div className="movie-details">
              <h1 className="movie-title" style={{ margin: 0 }}>{movie.title}</h1>
              <p className="movie-description">
                {movie.description || 'No description available.'}
              </p>
              <div className="movie-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="genre">{movie.genre || 'Genre'}</span>
                <span className="separator">•</span>
                <span className="rating">{movie.rating || 'NR'}</span>
                <span className="separator">•</span>
                <span className="duration">{movie.duration || 'N/A'}</span>
                <span className="separator">•</span>
                <span className="year">{movie.year || 'Year'}</span>
                <span className="movies-card-fare-badge" style={{ marginLeft: '0.75rem' }}>₹{movie.fare || 'N/A'}</span>
              </div>
              <div className="action-buttons">
                <button onClick={handleShowTrailer} className="trailer-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5,3 19,12 5,21"/>
                  </svg>
                  Show Trailer
                </button>
                <button onClick={handleBookTicket} className="book-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Book Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Trailer Modal */}
      {showTrailer && (
        <div className="modal-overlay" onClick={() => setShowTrailer(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Movie Trailer</h3>
              <button onClick={() => setShowTrailer(false)} className="close-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div style={{ borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', background: '#000' }}>
                <iframe
                  width="100%"
                  height="480"
                  src={getYouTubeEmbedUrl(movie.trailerUrl || '')}
                  title="Movie Trailer"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ display: 'block', width: '100%', minHeight: 320, background: '#000', maxWidth: '900px', margin: '0 auto' }}
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieBookingLanding;