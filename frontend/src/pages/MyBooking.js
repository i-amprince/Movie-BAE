import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import './MyBooking.css';

const isExpired = (showTime) => {
  const now = new Date();
  const showDate = new Date(showTime);
  return showDate.getTime() < now.getTime() - 2 * 60 * 60 * 1000;
};

const isUpcoming = (showTime) => {
  const now = new Date();
  const showDate = new Date(showTime);
  return showDate.getTime() > now.getTime();
};

const isLive = (showTime) => {
  const now = new Date();
  const showDate = new Date(showTime);
  const diff = showDate.getTime() - now.getTime();
  return diff <= 0 && diff > -2 * 60 * 60 * 1000;
};

const MyBooking = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/bookings?userEmail=${encodeURIComponent(user.email)}`);
        if (!res.ok) throw new Error('Failed to fetch bookings');
        const data = await res.json();
        setBookings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user]);

  useEffect(() => {
    if (localStorage.getItem('showTicketBookedToast')) {
      toast.success('Ticket booked!', { icon: '🎟️', style: { background: '#22c55e', color: '#fff', fontWeight: 700, fontSize: '1.1rem', borderRadius: '0.7rem', boxShadow: '0 4px 24px rgba(34,197,94,0.15)' } });
      localStorage.removeItem('showTicketBookedToast');
    }
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this ticket?')) return;
    setCancelling(bookingId);
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to cancel ticket');
      setBookings(prev => prev.filter(b => b._id !== bookingId));
      toast.success('Ticket cancelled');
    } catch (err) {
      alert('Failed to cancel ticket. Please try again.');
    }
    setCancelling(null);
  };

  if (!user) return <div className="mybooking-root"><div className="mybooking-container"><div style={{ color: '#fff', textAlign: 'center', marginTop: '3rem' }}>Please sign in to view your bookings.</div></div></div>;
  if (loading) return <div className="mybooking-root"><div className="mybooking-container"><div style={{ color: '#fff', textAlign: 'center', marginTop: '3rem' }}>Loading your bookings...</div></div></div>;
  if (error) return <div className="mybooking-root"><div className="mybooking-container"><div style={{ color: '#fff', textAlign: 'center', marginTop: '3rem' }}>Error: {error}</div></div></div>;

  // Sort bookings: non-expired (upcoming/ongoing) first, then expired (past 2 hours)
  const sortedBookings = [...bookings].sort((a, b) => {
    const aExpired = isExpired(a.time);
    const bExpired = isExpired(b.time);
    if (aExpired !== bExpired) return aExpired ? 1 : -1;
    // For same group, most recent first
    return new Date(b.time) - new Date(a.time);
  });

  // Find the index where expired bookings start
  const firstExpiredIdx = sortedBookings.findIndex(b => isExpired(b.time));

  return (
    <div className="mybooking-root">
      <div className="mybooking-container">
        <h2 className="mybooking-title">My Bookings</h2>
        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#aaa' }}>No bookings found.</div>
        ) : (
          <div className="mybooking-list">
            {sortedBookings.map((booking, idx) => {
              const expired = isExpired(booking.time);
              const upcoming = isUpcoming(booking.time);
              const live = isLive(booking.time);
              // Insert a horizontal dotted line before the first expired ticket
              const showSeparator = firstExpiredIdx !== -1 && idx === firstExpiredIdx;
              return (
                <React.Fragment key={booking._id}>
                  {showSeparator && (
                    <div style={{ width: '100%', borderTop: '2.5px dotted #a855f7', margin: '1.5rem 0', opacity: 0.7 }}></div>
                  )}
                  <div className={`mybooking-card${expired ? ' mybooking-expired' : ''}`}>
                    {/* Poster */}
                    {booking.movieId ? (
                      <img
                        className="mybooking-poster"
                        src={booking.movieId.poster || '/placeholder-poster.jpg'}
                        alt={booking.movieId.title}
                        onError={e => { e.target.src = '/placeholder-poster.jpg'; }}
                      />
                    ) : (
                      <div className="mybooking-poster" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red', fontWeight: 600 }}>
                        No Poster
                      </div>
                    )}
                    {/* Perforated Divider */}
                    <div className="mybooking-perforated">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="mybooking-perforated-dot"></div>
                      ))}
                    </div>
                    {/* Details */}
                    <div className="mybooking-details">
                      {booking.movieId ? (
                        <>
                          <div className="mybooking-header-row">
                            <h3 className="mybooking-movie-title">{booking.movieId.title}</h3>
                            <span className="mybooking-fare-badge">₹{booking.movieId.fare}</span>
                          </div>
                          <div className="mybooking-meta">{booking.movieId.genre} • {booking.movieId.year}</div>
                          <div className="mybooking-info-row">
                            <strong>Seat:</strong> {booking.seatNumber} &nbsp;|&nbsp;
                            <strong>Time:</strong> {new Date(booking.time).toLocaleString()} &nbsp;|&nbsp;
                            <strong>Region:</strong> {booking.region}
                          </div>
                          <div className="mybooking-booked-row">{expired ? 'Expired' : `Booked on: ${new Date(booking.createdAt).toLocaleString()}`}</div>
                          {/* Cancel Ticket Button */}
                          {upcoming && !live && !expired && (
                            <button
                              onClick={() => handleCancel(booking._id)}
                              disabled={cancelling === booking._id}
                              className="mybooking-cancel-btn"
                            >
                              {cancelling === booking._id ? 'Cancelling...' : 'Cancel Ticket'}
                            </button>
                          )}
                        </>
                      ) : (
                        <div style={{ color: 'red', fontWeight: 600 }}>
                          Movie not found (may have been deleted or is missing)
                        </div>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBooking; 