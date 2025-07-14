import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

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

  if (!user) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '3rem' }}>Please sign in to view your bookings.</div>;
  if (loading) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '3rem' }}>Loading your bookings...</div>;
  if (error) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '3rem' }}>Error: {error}</div>;

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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)', padding: '3rem 0' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem', borderRadius: '1.2rem', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', background: 'rgba(24,24,27,0.95)' }}>
        <h2 style={{ fontWeight: 700, marginBottom: '2rem', letterSpacing: '0.5px', textAlign: 'center' }}>My Bookings</h2>
        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#aaa' }}>No bookings found.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
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
                  <div style={{
                    background: expired
                      ? 'linear-gradient(90deg, rgba(60,60,70,0.45) 60%, rgba(80,80,100,0.25) 100%)'
                      : 'linear-gradient(90deg, #18181b 60%, #23233b 100%)',
                    border: expired ? '2px dashed #a855f7' : '2px dashed #60a5fa',
                    borderRadius: '1.5rem',
                    boxShadow: expired ? '0 4px 24px rgba(168,85,247,0.10)' : '0 4px 24px rgba(0,0,0,0.18)',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    overflow: 'hidden',
                    position: 'relative',
                    minHeight: 160,
                    height: 180,
                    opacity: expired ? 0.65 : 1,
                    filter: expired ? 'blur(0.5px) grayscale(0.2)' : 'none',
                    backdropFilter: expired ? 'blur(2px)' : 'none',
                    transition: 'opacity 0.3s, filter 0.3s',
                  }}>
                    {/* Left: Poster */}
                    {booking.movieId ? (
                      <img
                        src={booking.movieId.poster || '/placeholder-poster.jpg'}
                        alt={booking.movieId.title}
                        style={{ width: 110, height: '100%', minHeight: 180, objectFit: 'cover', borderRadius: '1.5rem 0 0 1.5rem', background: '#222', borderRight: expired ? '1.5px dashed #a855f7' : '1.5px dashed #60a5fa', display: 'block' }}
                        onError={e => { e.target.src = '/placeholder-poster.jpg'; }}
                      />
                    ) : (
                      <div style={{ width: 110, height: 180, background: '#222', borderRadius: '1.5rem 0 0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red', fontWeight: 600 }}>
                        No Poster
                      </div>
                    )}
                    {/* Perforated Divider */}
                    <div style={{
                      width: 18,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'transparent',
                      position: 'relative',
                      zIndex: 2
                    }}>
                      {[...Array(8)].map((_, i) => (
                        <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: expired ? '#a855f7' : '#23233b', margin: '5px 0' }}></div>
                      ))}
                    </div>
                    {/* Right: Details */}
                    <div style={{ flex: 1, padding: '1.2rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
                      {booking.movieId ? (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: 6 }}>
                            <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.3rem', letterSpacing: '0.5px' }}>{booking.movieId.title}</h3>
                            <span style={{ background: expired ? 'linear-gradient(90deg, #a855f7 0%, #6366f1 100%)' : 'linear-gradient(90deg, #60a5fa 0%, #a855f7 100%)', color: '#fff', fontWeight: 700, fontSize: '1rem', padding: '0.35em 1em', borderRadius: '1.2em', boxShadow: '0 2px 8px 0 rgba(96, 165, 250, 0.10)', letterSpacing: '0.5px', marginLeft: '0.5em', whiteSpace: 'nowrap', display: 'inline-block' }}>₹{booking.movieId.fare}</span>
                          </div>
                          <div style={{ color: '#ccc', marginBottom: 8 }}>{booking.movieId.genre} • {booking.movieId.year}</div>
                          <div style={{ margin: '0.5rem 0', fontSize: '1.08rem', color: '#fff' }}>
                            <strong>Seat:</strong> {booking.seatNumber} &nbsp;|&nbsp;
                            <strong>Time:</strong> {new Date(booking.time).toLocaleString()} &nbsp;|&nbsp;
                            <strong>Region:</strong> {booking.region}
                          </div>
                          <div style={{ marginTop: 8, color: expired ? '#a855f7' : '#fbbf24', fontWeight: 600, fontSize: '1.05rem' }}>{expired ? 'Expired' : `Booked on: ${new Date(booking.createdAt).toLocaleString()}`}</div>
                          {/* Cancel Ticket Button */}
                          {upcoming && !live && !expired && (
                            <button
                              onClick={() => handleCancel(booking._id)}
                              disabled={cancelling === booking._id}
                              style={{
                                position: 'absolute',
                                top: 18,
                                right: 18,
                                background: 'linear-gradient(90deg, #ef4444 0%, #f59e42 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '1.2em',
                                fontWeight: 700,
                                fontSize: '1rem',
                                padding: '0.45em 1.3em',
                                boxShadow: '0 2px 8px 0 rgba(239,68,68,0.10)',
                                letterSpacing: '0.5px',
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                                zIndex: 10
                              }}
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