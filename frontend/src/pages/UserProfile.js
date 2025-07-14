import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const containerStyle = {
  maxWidth: 520,
  margin: '40px auto',
  padding: '0 20px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const cardStyle = {
  background: '#ffffff',
  borderRadius: '16px',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)',
  border: '1px solid rgba(0, 0, 0, 0.06)',
  overflow: 'hidden',
  position: 'relative',
};

const headerStyle = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '40px 30px 30px',
  textAlign: 'center',
  position: 'relative',
};

const headerOverlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.1)',
  backdropFilter: 'blur(0.5px)',
};

const avatarContainerStyle = {
  position: 'relative',
  zIndex: 2,
  marginBottom: 20,
};

const avatarStyle = {
  width: 100,
  height: 100,
  borderRadius: '50%',
  objectFit: 'cover',
  border: '4px solid rgba(255, 255, 255, 0.9)',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
  display: 'block',
  margin: '0 auto',
};

const nameStyle = {
  fontWeight: 700,
  fontSize: '28px',
  color: '#ffffff',
  marginBottom: 8,
  position: 'relative',
  zIndex: 2,
  textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
};

const emailStyle = {
  color: 'rgba(255, 255, 255, 0.9)',
  fontWeight: 500,
  fontSize: '16px',
  position: 'relative',
  zIndex: 2,
  opacity: 0.95,
};

const contentStyle = {
  padding: '30px',
};

const statsContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '16px',
  marginBottom: '30px',
};

const statCardStyle = {
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '20px 16px',
  textAlign: 'center',
  transition: 'all 0.2s ease',
  cursor: 'default',
};

const statCardHoverStyle = {
  ...statCardStyle,
  background: '#f1f5f9',
  transform: 'translateY(-2px)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
};

const statValueStyle = {
  fontSize: '24px',
  fontWeight: 700,
  color: '#1e293b',
  marginBottom: '4px',
};

const statLabelStyle = {
  fontSize: '13px',
  fontWeight: 500,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const sectionTitleStyle = {
  fontSize: '18px',
  fontWeight: 600,
  color: '#1e293b',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const lastBookingStyle = {
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
  fontSize: '14px',
  color: '#475569',
};

const bookingsListStyle = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  overflow: 'hidden',
  marginBottom: '30px',
};

const bookingsHeaderStyle = {
  background: '#f8fafc',
  padding: '16px 20px',
  borderBottom: '1px solid #e2e8f0',
  fontWeight: 600,
  color: '#1e293b',
  fontSize: '16px',
};

const bookingItemStyle = {
  padding: '18px 20px',
  borderBottom: '1px solid #f1f5f9',
  fontSize: '14px',
  lineHeight: '1.5',
  transition: 'background-color 0.2s ease',
};

const bookingItemHoverStyle = {
  ...bookingItemStyle,
  backgroundColor: '#f8fafc',
};

const bookingRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
};

const bookingLabelStyle = {
  fontWeight: 500,
  color: '#374151',
  minWidth: '60px',
};

const bookingValueStyle = {
  color: '#6b7280',
  flex: 1,
  textAlign: 'right',
};

const viewAllButtonStyle = {
  background: 'none',
  color: '#667eea',
  border: 'none',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: '14px',
  textDecoration: 'none',
  padding: '12px 20px',
  display: 'block',
  width: '100%',
  textAlign: 'center',
  transition: 'all 0.2s ease',
  borderTop: '1px solid #f1f5f9',
};

const signOutButtonStyle = {
  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  color: '#ffffff',
  border: 'none',
  borderRadius: '10px',
  fontWeight: 600,
  fontSize: '16px',
  padding: '14px 28px',
  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'block',
  margin: '0 auto',
  minWidth: '140px',
};

const signOutButtonHoverStyle = {
  ...signOutButtonStyle,
  transform: 'translateY(-1px)',
  boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)',
};

const loadingStyle = {
  padding: '20px',
  textAlign: 'center',
  color: '#64748b',
  fontSize: '14px',
};

const emptyStateStyle = {
  padding: '40px 20px',
  textAlign: 'center',
  color: '#94a3b8',
  fontSize: '14px',
};

const UserProfile = () => {
  const { user, logout } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredStat, setHoveredStat] = useState(null);
  const [hoveredBooking, setHoveredBooking] = useState(null);
  const [signOutHovered, setSignOutHovered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/bookings?userEmail=${encodeURIComponent(user.email)}`);
        if (!res.ok) throw new Error('Failed to fetch bookings');
        const data = await res.json();
        setBookings(data);
      } catch (err) {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user]);

  if (!user) {
    return (
      <div style={{ ...containerStyle, textAlign: 'center', marginTop: '60px' }}>
        <div style={{ color: '#64748b', fontSize: '18px' }}>Please sign in to view your profile.</div>
      </div>
    );
  }

  // Booking stats
  const now = new Date();
  const totalBookings = bookings.length;
  const upcoming = bookings.filter(b => new Date(b.time) > now).length;
  const past = bookings.filter(b => new Date(b.time) <= now).length;
  const lastBooking = bookings.length > 0 ? bookings.reduce((latest, b) => new Date(b.createdAt) > new Date(latest.createdAt) ? b : latest, bookings[0]) : null;
  const recentBookings = bookings.slice(0, 3);

  const StatCard = ({ value, label, index }) => (
    <div
      style={hoveredStat === index ? statCardHoverStyle : statCardStyle}
      onMouseEnter={() => setHoveredStat(index)}
      onMouseLeave={() => setHoveredStat(null)}
    >
      <div style={statValueStyle}>{value}</div>
      <div style={statLabelStyle}>{label}</div>
    </div>
  );

  const BookingItem = ({ booking, index }) => (
    <div
      style={hoveredBooking === index ? bookingItemHoverStyle : bookingItemStyle}
      onMouseEnter={() => setHoveredBooking(index)}
      onMouseLeave={() => setHoveredBooking(null)}
    >
      <div style={bookingRowStyle}>
        <span style={bookingLabelStyle}>Movie:</span>
        <span style={bookingValueStyle}>{booking.movieId?.title || 'N/A'}</span>
      </div>
      <div style={bookingRowStyle}>
        <span style={bookingLabelStyle}>Seat:</span>
        <span style={bookingValueStyle}>{booking.seatNumber}</span>
      </div>
      <div style={bookingRowStyle}>
        <span style={bookingLabelStyle}>Time:</span>
        <span style={bookingValueStyle}>{new Date(booking.time).toLocaleString()}</span>
      </div>
      <div style={bookingRowStyle}>
        <span style={bookingLabelStyle}>Region:</span>
        <span style={bookingValueStyle}>{booking.region}</span>
      </div>
    </div>
  );

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={headerOverlayStyle} />
          <div style={avatarContainerStyle}>
            <img src={user.picture} alt={user.name} style={avatarStyle} />
          </div>
          <h2 style={nameStyle}>{user.name}</h2>
          <div style={emailStyle}>{user.email}</div>
        </div>
        
        <div style={contentStyle}>
          <div style={statsContainerStyle}>
            <StatCard value={totalBookings} label="Total Bookings" index={0} />
            <StatCard value={upcoming} label="Upcoming" index={1} />
            <StatCard value={past} label="Past Bookings" index={2} />
          </div>

          {lastBooking && (
            <div style={lastBookingStyle}>
              <strong>Last Booking:</strong> {new Date(lastBooking.createdAt).toLocaleString()}
            </div>
          )}

          <div style={sectionTitleStyle}>
            📋 Recent Bookings
          </div>

          <div style={bookingsListStyle}>
            <div style={bookingsHeaderStyle}>
              Latest Activity
            </div>
            
            {loading ? (
              <div style={loadingStyle}>Loading bookings...</div>
            ) : recentBookings.length === 0 ? (
              <div style={emptyStateStyle}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎬</div>
                <div>No bookings yet</div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>Your movie bookings will appear here</div>
              </div>
            ) : (
              <>
                {recentBookings.map((booking, index) => (
                  <BookingItem key={booking._id} booking={booking} index={index} />
                ))}
                <button
                  style={viewAllButtonStyle}
                  onClick={() => navigate('/mybookings')}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f8fafc';
                    e.target.style.color = '#5a67d8';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#667eea';
                  }}
                >
                  View All Bookings →
                </button>
              </>
            )}
          </div>

          <button
            style={signOutHovered ? signOutButtonHoverStyle : signOutButtonStyle}
            onMouseEnter={() => setSignOutHovered(true)}
            onMouseLeave={() => setSignOutHovered(false)}
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;