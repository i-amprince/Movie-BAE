import React, { useEffect, useState, useContext } from 'react';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import './AdminShows.css';

const initialForm = {
  movieId: '',
  time: '',
  region: ''
};

const AdminShows = () => {
  const { admin } = useContext(AdminAuthContext);
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL || 'https://movie-bae-backend.onrender.com/api';

  const fetchShows = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${apiUrl}/shows`, {
        headers: {
          Authorization: `Bearer ${admin.token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setShows(data);
      } else {
        setError(data.error || 'Failed to fetch shows');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    }
    setLoading(false);
  };

  const fetchMovies = async () => {
    try {
      const res = await fetch(`${apiUrl}/movies`);
      const data = await res.json();
      if (res.ok) {
        setMovies(data);
      }
    } catch (err) {
      console.error('Failed to fetch movies:', err);
    }
  };

  useEffect(() => {
    fetchMovies();
    fetchShows();
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
    if (!form.movieId || !form.time || !form.region) {
      setError('All fields are required');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(
        editingId 
          ? `${apiUrl}/shows/${editingId}` 
          : `${apiUrl}/shows`,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${admin.token}`
          },
          body: JSON.stringify(form)
        }
      );

      const data = await res.json();
      
      if (res.ok) {
        setForm(initialForm);
        setEditingId(null);
        fetchShows();
      } else {
        setError(data.error || 'Failed to save show');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
    setSubmitting(false);
  };

  const handleEdit = (show) => {
    setForm({
      movieId: show.movieId._id,
      time: show.time ? show.time.slice(0, 16) : '',
      region: show.region
    });
    setEditingId(show._id);
    // Scroll to form
    document.querySelector('.show-form').scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this show? This action cannot be undone.')) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${apiUrl}/shows/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${admin.token}`
        }
      });

      const data = await res.json();
      
      if (res.ok) {
        fetchShows();
      } else {
        setError(data.error || 'Failed to delete show');
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

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMovieTitle = (movieId) => {
    const movie = movies.find(m => m._id === movieId);
    return movie ? movie.title : 'Unknown Movie';
  };

  const getShowStatus = (showTime) => {
    if (!showTime) return 'unknown';
    const now = new Date();
    const showDate = new Date(showTime);
    const timeDiff = showDate - now;
    
    if (timeDiff > 0) return 'upcoming';
    if (timeDiff > -7200000) return 'ongoing'; // 2 hours ago
    return 'completed';
  };

  return (
    <div className="admin-shows-container">
      <h1 className="admin-shows-header">Show Management</h1>
      
      <div className="show-form">
        <h2 className="form-header">
          {editingId ? 'Edit Show' : 'Add New Show'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <select
              name="movieId"
              value={form.movieId}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">Select Movie *</option>
              {movies.map(movie => (
                <option key={movie._id} value={movie._id}>
                  {movie.title}
                </option>
              ))}
            </select>
            
            <input
              name="time"
              value={form.time}
              onChange={handleChange}
              type="datetime-local"
              required
              className="form-input"
              title="Show Date & Time"
            />
            
            <input
              name="region"
              value={form.region}
              onChange={handleChange}
              placeholder="Region/City *"
              required
              className="form-input"
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
                  {editingId ? 'Save Changes' : 'Add Show'}
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

      <div className="shows-section">
        <div className="section-header">
          All Shows ({shows.length})
        </div>
        
        {loading ? (
          <div className="loading-spinner">
            Loading shows...
          </div>
        ) : error && shows.length === 0 ? (
          <div className="error-message" style={{ margin: '2rem' }}>
            {error}
          </div>
        ) : shows.length === 0 ? (
          <div className="empty-state">
            <p>No shows found. Add your first show using the form above!</p>
          </div>
        ) : (
          <table className="shows-table">
            <thead>
              <tr>
                <th>Movie</th>
                <th>Show Time</th>
                <th>Region</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shows.map((show) => {
                const status = getShowStatus(show.time);
                return (
                  <tr key={show._id}>
                    <td className="show-movie">
                      {show.movieId?.title || getMovieTitle(show.movieId)}
                    </td>
                    <td className="show-time">
                      {formatDateTime(show.time)}
                    </td>
                    <td>
                      <span className="show-region">{show.region}</span>
                    </td>
                    <td>
                      <span className={`status-${status}`}>
                        {status === 'upcoming' && '🔜 Upcoming'}
                        {status === 'ongoing' && '🔴 Live'}
                        {status === 'completed' && '✅ Completed'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          onClick={() => handleEdit(show)}
                          className="btn-edit"
                          disabled={submitting}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(show._id)}
                          className="btn-delete"
                          disabled={submitting}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminShows;