import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './MovieBookingLanding.css';

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
        const response = await fetch(`http://localhost:5000/api/movies/${id}`);
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!movie) return <div>Movie not found.</div>;

  const backgroundStyle = {
    minHeight: '100vh',
    background: `linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.3) 100%), url(${movie.poster})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <div className="landing-container" style={backgroundStyle}>
      <button
        onClick={() => navigate(-1)}
        style={{
          position: 'absolute',
          top: '80px',
          left: '32px',
          background: 'rgba(24,24,27,0.85)',
          color: '#fff',
          border: 'none',
          borderRadius: '0.5rem',
          padding: '0.5rem 1.5rem',
          cursor: 'pointer',
          zIndex: 100
        }}
      >
        ← Back
      </button>
      <main className="main-content">
        <div className="content-container">
          <div className="movie-info" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
            <div className="movie-details" style={{ flex: 1, minWidth: 0 }}>
              <h1 className="movie-title">{movie.title}</h1>
              <p className="movie-description" style={{ marginBottom: '0.5rem' }}>{movie.description}</p>
              <div className="movie-meta" style={{ marginBottom: '0.5rem' }}>
                <span className="genre">{movie.genre}</span>
                <span className="separator">•</span>
                <span className="rating">{movie.rating}</span>
                <span className="separator">•</span>
                <span className="duration">{movie.duration}</span>
                <span className="separator">•</span>
                <span className="year">{movie.year}</span>
                <span className="separator">•</span>
                {/* IMDb badge styled like MoviesPage */}
                {movie.imdbScore && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3em',
                    background: 'rgba(245, 197, 24, 0.15)',
                    border: '1px solid rgba(245, 197, 24, 0.3)',
                    borderRadius: '1em',
                    padding: '0.3em 0.9em',
                    fontWeight: 700,
                    fontSize: '1rem',
                    marginLeft: '0.5em',
                    color: '#f5c518',
                    boxShadow: '0 1px 4px 0 rgba(245,197,24,0.08)'
                  }}>
                    <span style={{ fontWeight: 700, color: '#f5c518', fontSize: '0.95em', letterSpacing: '0.5px' }}>IMDb</span>
                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '1em' }}>{movie.imdbScore}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#f5c518" style={{ marginLeft: 2, marginRight: -2 }}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85em', marginLeft: 2 }}>/10</span>
                  </span>
                )}
                <span className="separator">•</span>
                {/* Price badge styled like genre, no explicit label */}
                <span className="genre" style={{ marginLeft: '0.5em', background: 'rgba(59, 130, 246, 0.18)', color: '#93c5fd', fontWeight: 700, fontSize: '1rem', padding: '0.3em 0.9em', borderRadius: '1em' }}>₹{movie.fare}</span>
              </div>
              <div style={{ margin: '0.5rem 0 0 0' }}>
                <strong style={{ fontSize: '1.1rem', letterSpacing: '0.5px' }}>Casts:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.3rem' }}>
                  {movie.casts && movie.casts.map((cast, idx) => (
                    <span key={idx} style={{
                      background: 'rgba(96,165,250,0.15)',
                      color: '#fff',
                      borderRadius: '1em',
                      padding: '0.35em 1em',
                      fontWeight: 500,
                      fontSize: '1rem',
                      letterSpacing: '0.2px',
                      boxShadow: '0 1px 4px 0 rgba(96,165,250,0.08)'
                    }}>{cast}</span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => navigate(`/book/${id}`)}
                style={{
                  margin: '2rem 0 0 0',
                  background: 'linear-gradient(90deg, #ef4444 0%, #f59e42 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 2rem',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px 0 rgba(239,68,68,0.10)',
                  letterSpacing: '0.5px',
                  transition: 'background 0.2s',
                  display: 'inline-block'
                }}
              >
                Book Ticket
              </button>
            </div>
            <div style={{ flex: 1, minWidth: 320, maxWidth: 700, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '90%' }}>
                <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1.3rem', marginBottom: '1rem', textAlign: 'center', letterSpacing: '0.5px' }}>Trailer</h2>
                {movie.trailerUrl && (
                  <div style={{ marginBottom: '2rem', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
                    <iframe
                      width="100%"
                      height="400"
                      src={getYouTubeEmbedUrl(movie.trailerUrl)}
                      title="Movie Trailer"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MovieDetails; 