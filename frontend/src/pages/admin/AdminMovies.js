import React, { useEffect, useState, useContext } from 'react';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import './AdminMovies.css';

const initialForm = {
  title: '',
  description: '',
  genre: '',
  rating: '',
  duration: '',
  year: '',
  imdbScore: '',
  trailerUrl: '',
  poster: '',
  fare: '',
  casts: ''
};

const AdminMovies = () => {
  const { admin } = useContext(AdminAuthContext);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL || 'https://movie-bae-backend.onrender.com/api';

  const fetchMovies = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${apiUrl}/movies`);
      const data = await res.json();
      if (res.ok) {
        setMovies(data);
      } else {
        setError(data.error || 'Failed to fetch movies');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleChange = (e) => {
    setForm(f => ({
      ...f,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Validate required fields
    if (!form.title || !form.genre) {
      setError('Title and Genre are required fields');
      setSubmitting(false);
      return;
    }

    const payload = {
      ...form,
      year: form.year ? Number(form.year) : undefined,
      imdbScore: form.imdbScore ? Number(form.imdbScore) : undefined,
      fare: form.fare ? Number(form.fare) : undefined,
      casts: form.casts ? form.casts.split(',').map(s => s.trim()).filter(Boolean) : []
    };

    try {
      const res = await fetch(
        editingId 
          ? `${apiUrl}/movies/${editingId}` 
          : `${apiUrl}/movies`,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${admin.token}`
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();
      
      if (res.ok) {
        setForm(initialForm);
        setEditingId(null);
        fetchMovies();
      } else {
        setError(data.error || 'Failed to save movie');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
    setSubmitting(false);
  };

  const handleEdit = (movie) => {
    setForm({
      ...movie,
      casts: movie.casts ? movie.casts.join(', ') : ''
    });
    setEditingId(movie._id);
    // Scroll to form
    document.querySelector('.movie-form').scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this movie? This action cannot be undone.')) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${apiUrl}/movies/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${admin.token}`
        }
      });

      const data = await res.json();
      
      if (res.ok) {
        fetchMovies();
      } else {
        setError(data.error || 'Failed to delete movie');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
    setSubmitting(false);
  };

  const handleCancel = () => {
    setForm(initialForm);
    setEditingId(null);
    setError('');
  };

  return (
    <div className="admin-movies-container">
      <h1 className="admin-movies-header">Movie Management</h1>
      
      <div className="movie-form">
        <h2 className="form-header">
          {editingId ? 'Edit Movie' : 'Add New Movie'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Movie Title *"
              required
              className="form-input"
            />
            <input
              name="genre"
              value={form.genre}
              onChange={handleChange}
              placeholder="Genre *"
              required
              className="form-input"
            />
            <input
              name="rating"
              value={form.rating}
              onChange={handleChange}
              placeholder="Rating (e.g., PG-13)"
              className="form-input"
            />
            <input
              name="duration"
              value={form.duration}
              onChange={handleChange}
              placeholder="Duration (e.g., 120 min)"
              className="form-input"
            />
            <input
              name="year"
              value={form.year}
              onChange={handleChange}
              placeholder="Release Year"
              type="number"
              min="1900"
              max="2030"
              className="form-input"
            />
            <input
              name="imdbScore"
              value={form.imdbScore}
              onChange={handleChange}
              placeholder="IMDB Score (0-10)"
              type="number"
              step="0.1"
              min="0"
              max="10"
              className="form-input"
            />
            <input
              name="fare"
              value={form.fare}
              onChange={handleChange}
              placeholder="Ticket Price (₹)"
              type="number"
              min="0"
              className="form-input"
            />
            <input
              name="trailerUrl"
              value={form.trailerUrl}
              onChange={handleChange}
              placeholder="Trailer URL"
              type="url"
              className="form-input"
            />
            <input
              name="poster"
              value={form.poster}
              onChange={handleChange}
              placeholder="Poster URL or Path"
              className="form-input"
            />
            <input
              name="casts"
              value={form.casts}
              onChange={handleChange}
              placeholder="Cast Members (comma separated)"
              className="form-input"
            />
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Movie Description"
              rows={3}
              className="form-textarea"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? (
                <>
                  <span>⏳</span>
                  {editingId ? 'Saving...' : 'Adding...'}
                </>
              ) : (
                <>
                  <span>{editingId ? '💾' : '➕'}</span>
                  {editingId ? 'Save Changes' : 'Add Movie'}
                </>
              )}
            </button>
            
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="movies-section">
        <div className="section-header">
          All Movies ({movies.length})
        </div>
        
        {loading ? (
          <div className="loading-spinner">
            Loading movies...
          </div>
        ) : error && movies.length === 0 ? (
          <div className="error-message" style={{ margin: '2rem' }}>
            {error}
          </div>
        ) : movies.length === 0 ? (
          <div className="empty-state">
            <p>No movies found. Add your first movie using the form above!</p>
          </div>
        ) : (
          <table className="movies-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Genre</th>
                <th>Year</th>
                <th>IMDB Score</th>
                <th>Fare</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movie) => (
                <tr key={movie._id}>
                  <td className="admin-movie-title">{movie.title}</td>
                  <td>
                    <span className="movie-genre">{movie.genre}</span>
                  </td>
                  <td className="movie-year">{movie.year || 'N/A'}</td>
                  <td className="movie-imdb">
                    {movie.imdbScore ? `⭐ ${movie.imdbScore}` : 'N/A'}
                  </td>
                  <td className="movie-fare">
                    {movie.fare ? movie.fare : 'N/A'}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        onClick={() => handleEdit(movie)}
                        className="btn-edit"
                        disabled={submitting}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(movie._id)}
                        className="btn-delete"
                        disabled={submitting}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminMovies;