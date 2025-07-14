import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const toggleMenu = () => setIsMenuOpen((open) => !open);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-content">
          <div className="logo">
            <Link to="/">
              <h1>Movie&BAE</h1>
            </Link>
          </div>
          <div className="desktop-menu">
            <div className="nav-links">
              <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                Home
              </Link>
              <Link to="/movies" className={`nav-link ${location.pathname === '/movies' ? 'active' : ''}`}>
                Movies
              </Link>
              {user && (
                <Link to="/mybookings" className={`nav-link ${location.pathname === '/mybookings' ? 'active' : ''}`}>
                  My Bookings
                </Link>
              )}
            </div>
          </div>
          <div className="nav-actions">
            <button className="icon-btn" title="Search" onClick={() => navigate('/movies')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </button>
            {user ? (
              <>
                <img
                  src={user.picture}
                  alt={user.name}
                  title={user.name}
                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', marginLeft: 8, border: '2px solid #60a5fa', background: '#222', cursor: 'pointer' }}
                  onClick={() => navigate('/profile')}
                />
                <button className="sign-in-btn" style={{ marginLeft: 12 }} onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <button className="icon-btn" title="Sign In" onClick={() => navigate('/signin')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </button>
                <button className="sign-in-btn" onClick={() => navigate('/signin')}>Sign In</button>
              </>
            )}
          </div>
          <div className="mobile-menu-btn">
            <button onClick={toggleMenu} className="menu-toggle" aria-label="Toggle menu">
              {isMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            <Link to="/" className="mobile-nav-link">Home</Link>
            <Link to="/movies" className="mobile-nav-link">Movies</Link>
            <a href="#" className="mobile-nav-link">Theaters</a>
            <a href="#" className="mobile-nav-link">Events</a>
            <a href="#" className="mobile-nav-link">Offers</a>
            {user ? (
              <button className="mobile-sign-in-btn" onClick={handleLogout}>Logout</button>
            ) : (
              <button className="mobile-sign-in-btn" onClick={() => navigate('/signin')}>Sign In</button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 