import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './BookTicket.css';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';

const SEAT_ROWS = ['A', 'B', 'C', 'D', 'E'];
const SEAT_NUMBERS = [1,2,3,4,5,6,7,8,9,10];
const REGIONS = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai'];

// Generate showtimes for next 7 days, 3 times per day
const getShowtimes = () => {
  const times = ['18:00', '19:30', '21:30'];
  const showtimes = [];
  const today = new Date();
  for (let d = 0; d < 7; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    for (const t of times) {
      const [h, m] = t.split(':');
      const show = new Date(date);
      show.setHours(Number(h), Number(m), 0, 0);
      showtimes.push(show.toISOString());
    }
  }
  return showtimes;
};
const TIMES = getShowtimes();

const BookTicket = () => {
  const { id: movieId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [shows, setShows] = useState([]);
  const [region, setRegion] = useState('');
  const [time, setTime] = useState('');
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [booking, setBooking] = useState({ loading: false, error: null, success: false });
  const [movie, setMovie] = useState(null);
  const [lockedSeats, setLockedSeats] = useState({}); // { seat: lockedBy }
  const socketRef = React.useRef(null);

  const backendUrl = process.env.REACT_APP_API_URL || 'https://movie-bae-backend.onrender.com/api';
  const apiUrl = backendUrl;
  const socketBaseUrl = backendUrl.replace(/\/api$/, '');

  const socket = io(socketBaseUrl);

  // Fetch available shows for this movie
  useEffect(() => {
    const fetchShows = async () => {
      const res = await fetch(`${apiUrl}/shows?movieId=${movieId}`);
      if (res.ok) {
        const data = await res.json();
        setShows(data.filter(show => show.movieId && show.movieId._id === movieId));
      }
    };
    fetchShows();
  }, [movieId]);

  // Set default region and time when shows are loaded
  useEffect(() => {
    if (shows.length > 0) {
      setRegion(shows[0].region);
      setTime(shows[0].time);
    }
  }, [shows]);

  useEffect(() => {
    // Fetch movie details for display
    const fetchMovie = async () => {
      const res = await fetch(`${apiUrl}/movies/${movieId}`);
      if (res.ok) setMovie(await res.json());
    };
    fetchMovie();
  }, [movieId]);

  // Fetch booked seats for the current movie, region, and time
  const fetchBookedSeats = async () => {
    if (!region || !time) return;
    const res = await fetch(`${apiUrl}/bookings/seats?movieId=${movieId}&region=${region}&time=${encodeURIComponent(time)}`);
    if (res.ok) {
      const data = await res.json();
      setBookedSeats(data.bookedSeats);
    }
  };

  useEffect(() => {
    fetchBookedSeats();
    // eslint-disable-next-line
  }, [movieId, region, time, booking.success]);

  useEffect(() => {
    // Connect to socket.io server
    socketRef.current = io(socketBaseUrl);
    const socket = socketRef.current;

    // Listen for seat lock events
    socket.on('seat_locked', ({ movieId: mId, seatId, lockedBy }) => {
      if (mId === movieId) {
        setLockedSeats(prev => ({ ...prev, [seatId]: lockedBy }));
      }
    });
    socket.on('seat_unlocked', ({ movieId: mId, seatId }) => {
      if (mId === movieId) {
        setLockedSeats(prev => {
          const copy = { ...prev };
          delete copy[seatId];
          return copy;
        });
      }
    });
    socket.on('seat_lock_failed', ({ movieId: mId, seatId, lockedBy }) => {
      if (mId === movieId) {
        setLockedSeats(prev => ({ ...prev, [seatId]: lockedBy }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [movieId]);

  useEffect(() => {
    socket.on('booking_cancelled', (data) => {
      // If the cancelled booking matches the current movie/time/region, refresh seats
      if (
        data.movieId === movieId &&
        data.time === time &&
        data.region === region
      ) {
        fetchBookedSeats();
      }
    });
    return () => {
      socket.off('booking_cancelled');
    };
  }, [movieId, time, region]);

  // Unlock seats on unmount or region/time change
  useEffect(() => {
    return () => {
      if (socketRef.current && selectedSeats.length > 0) {
        selectedSeats.forEach(seat => {
          socketRef.current.emit('unlock_seat', { movieId, seatId: seat, userId: user?.email });
        });
      }
    };
    // eslint-disable-next-line
  }, [region, time, movieId]);

  const handleSeatClick = (seat) => {
    const lockedBy = lockedSeats[seat];
    if (bookedSeats.includes(seat)) return;
    // Only block if locked by someone else
    if (lockedBy && lockedBy !== user?.email) return;
    if (!selectedSeats.includes(seat)) {
      // Try to lock seat
      if (socketRef.current && user) {
        socketRef.current.emit('lock_seat', { movieId, seatId: seat, userId: user.email });
      }
      setSelectedSeats(prev => [...prev, seat]);
    } else {
      // Unlock seat
      if (socketRef.current && user) {
        socketRef.current.emit('unlock_seat', { movieId, seatId: seat, userId: user.email });
      }
      setSelectedSeats(prev => prev.filter(s => s !== seat));
    }
  };

  const handleBook = async () => {
    if (!user) {
      navigate('/signin');
      return;
    }
    if (selectedSeats.length === 0) {
      setBooking(b => ({ ...b, error: 'Please select at least one seat.' }));
      return;
    }
    setBooking({ loading: true, error: null, success: false });
    // Book all selected seats (one request per seat)
    let allSuccess = true;
    for (const seat of selectedSeats) {
      const res = await fetch(`${apiUrl}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          movieId,
          seatNumber: seat,
          time,
          region
        })
      });
      if (!res.ok) {
        allSuccess = false;
        const data = await res.json();
        setBooking({ loading: false, error: data.error || 'Booking failed', success: false });
        break;
      }
    }
    if (allSuccess) {
      setBooking({ loading: false, error: null, success: true });
      setSelectedSeats([]);
      localStorage.setItem('showTicketBookedToast', '1');
      setTimeout(() => {
        navigate('/mybookings');
      }, 1500);
    }
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    }) + ' • ' + date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const totalPrice = selectedSeats.length * (movie?.fare || 0);

  return (
    <div className="book-ticket-container">
      {/* Enhanced movie background with overlay effects */}
      <div className="book-ticket-background">
        {movie && (
          <>
            <div 
              className="background-image"
              style={{ backgroundImage: `url(${movie.poster})` }}
            />
            <div className="background-overlay" />
            <div className="background-gradient" />
          </>
        )}
      </div>
      
              <div className="book-ticket-card">
          {/* Movie Title at Top Center */}
          {movie && (
            <div className="movie-title-header">
              <h1 className="movie-title-main">{movie.title}</h1>
              <div className="movie-subtitle">Book your tickets for an amazing experience</div>
            </div>
          )}

          {/* Movie Info Section - Professional Layout */}
          {movie && (
            <div className="movie-info-section">
              <div className="movie-poster">
                <img src={movie.poster} alt={movie.title} />
                <div className="poster-glow" />
              </div>
              <div className="movie-details">
                <div className="movie-details-header">
                  <h2 className="movie-details-title">{movie.title}</h2>
                  <div className="movie-details-subtitle">Experience the magic of cinema</div>
                </div>
                
                <div className="movie-details-grid">
                  <div className="detail-item">
                    <div className="detail-label">Genre</div>
                    <div className="detail-value">
                      <span className="genre">{movie.genre}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Release Year</div>
                    <div className="detail-value">
                      <span>📅</span> {movie.year}
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Ticket Price</div>
                    <div className="detail-value">
                      <span className="price">₹{movie.fare}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Duration</div>
                    <div className="detail-value">
                      <span>⏱️</span> 2h 15m
                    </div>
                  </div>
                </div>
                

                
                <div className="movie-description">
                  Immerse yourself in this captivating cinematic experience. Book your preferred seats and enjoy the show with premium sound and visual quality.
                </div>
              </div>
            </div>
          )}

        <div className="booking-section">
          <h2 className="section-title">Select Your Experience</h2>
          
          {/* Enhanced Controls */}
          <div className="booking-controls">
            <div className="control-group">
              <label className="control-label">
                <span className="label-icon">📍</span>
                Choose City
              </label>
              <div className="select-wrapper">
                <select 
                  value={region} 
                  onChange={e => setRegion(e.target.value)} 
                  className="control-select"
                >
                  {[...new Set(shows.map(show => show.region))].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="control-group">
              <label className="control-label">
                <span className="label-icon">🎬</span>
                Show Time
              </label>
              <div className="select-wrapper">
                <select 
                  value={time} 
                  onChange={e => setTime(e.target.value)} 
                  className="control-select"
                >
                  {shows.filter(show => show.region === region).map(show => (
                    <option key={show._id} value={show.time}>{formatDateTime(show.time)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Enhanced Seat Selection */}
          <div className="seat-selection">
            <h3 className="section-subtitle">Choose Your Seats</h3>
            <div className="screen-indicator">
              <div className="screen">SCREEN</div>
              <div className="screen-glow" />
            </div>
            
            <div className="seat-grid-container">
              <div className="seat-grid">
                {SEAT_ROWS.map(row => (
                  <div key={row} className="seat-row">
                    <div className="row-label">{row}</div>
                    <div className="seats">
                      {SEAT_NUMBERS.map(num => {
                        const seat = row + num;
                        const isBooked = bookedSeats.includes(seat);
                        const isSelected = selectedSeats.includes(seat);
                        const isLocked = lockedSeats[seat] && lockedSeats[seat] !== user?.email;
                        return (
                          <div
                            key={seat}
                            className={`seat ${
                              isBooked ? 'seat-booked' :
                              isLocked ? 'seat-locked' :
                              isSelected ? 'seat-selected' : 'seat-available'
                            }`}
                            onClick={() => handleSeatClick(seat)}
                          >
                            <div className="seat-number">{num}</div>
                            {isLocked && <span className="seat-lock-indicator" title="Locked by another user">✖</span>}
                            {isSelected && <div className="seat-pulse" />}
                          </div>
                        );
                      })}
                    </div>
                    <div className="row-label">{row}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Seat Legend */}
            <div className="seat-legend">
              <div className="legend-item">
                <div className="legend-seat seat-available" />
                <span>Available</span>
              </div>
              <div className="legend-item">
                <div className="legend-seat seat-selected" />
                <span>Selected</span>
              </div>
              <div className="legend-item">
                <div className="legend-seat seat-booked" />
                <span>Booked</span>
              </div>
              <div className="legend-item">
                <div className="legend-seat seat-locked" />
                <span>Locked</span>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="booking-summary">
            <div className="summary-content">
              <div className="selected-info">
                <h4>Selected Seats</h4>
                <div className="seat-list">
                  {selectedSeats.length > 0 ? (
                    selectedSeats.map(seat => (
                      <span key={seat} className="selected-seat-tag">{seat}</span>
                    ))
                  ) : (
                    <span className="no-seats">No seats selected</span>
                  )}
                </div>
              </div>
              <div className="price-info">
                <div className="price-breakdown">
                  <span>Tickets ({selectedSeats.length})</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="total-price">
                  <span>Total Amount</span>
                  <span>₹{totalPrice}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Book Button */}
          <div className="booking-actions">
            <button
              onClick={handleBook}
              disabled={booking.loading || selectedSeats.length === 0}
              className="book-button"
            >
              <span className="button-text">
                {booking.loading ? 'Processing...' : `Book Now • ₹${totalPrice}`}
              </span>
              <div className="button-glow" />
            </button>
            
            {booking.error && (
              <div className="booking-message booking-error">
                <span className="message-icon">❌</span>
                {booking.error}
              </div>
            )}
            {booking.success && (
              <div className="booking-message booking-success">
                <span className="message-icon">✅</span>
                Booking confirmed! Redirecting to My Bookings...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookTicket;