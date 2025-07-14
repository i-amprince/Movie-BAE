const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const { sendMail } = require('../utils/email');

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const { userEmail, movieId, seatNumber, time, region } = req.body;
    if (!userEmail || !movieId || !seatNumber || !time || !region) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const booking = new Booking({ userEmail, movieId, seatNumber, time, region });
    await booking.save();
    // Fetch movie details for email
    const movie = await Movie.findById(movieId);
    // Send booking confirmation email
    try {
      await sendMail({
        to: userEmail,
        subject: 'Booking Confirmed - Movie&BAE',
        html: `
          <h2>Your ticket is confirmed!</h2>
          <p><strong>Movie:</strong> ${movie?.title || 'N/A'}</p>
          <p><strong>Seat:</strong> ${seatNumber}</p>
          <p><strong>Time:</strong> ${new Date(time).toLocaleString()}</p>
          <p><strong>Region:</strong> ${region}</p>
          <p>Thank you for booking with Movie&BAE!</p>
        `
      });
    } catch (e) {
      // Log but don't fail booking if email fails
      console.error('Failed to send booking email:', e.message);
    }
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all bookings for a user
router.get('/', async (req, res) => {
  try {
    const { userEmail } = req.query;
    if (!userEmail) {
      return res.status(400).json({ error: 'userEmail is required.' });
    }
    const bookings = await Booking.find({ userEmail })
      .populate('movieId');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get booked seats for a movie, region, and time
router.get('/seats', async (req, res) => {
  try {
    const { movieId, region, time } = req.query;
    if (!movieId || !region || !time) {
      return res.status(400).json({ error: 'movieId, region, and time are required.' });
    }
    // Find all bookings for this movie, region, and time
    const bookings = await Booking.find({ movieId, region, time: new Date(time) });
    const bookedSeats = bookings.map(b => b.seatNumber);
    res.json({ bookedSeats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a booking by ID
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    const movie = await Movie.findById(booking.movieId);
    await Booking.findByIdAndDelete(req.params.id);
    // Emit socket event for live update
    req.app.get('io').emit('booking_cancelled', {
      movieId: booking.movieId,
      seatNumber: booking.seatNumber,
      time: booking.time,
      region: booking.region,
      bookingId: booking._id
    });
    // Send cancellation email
    try {
      await sendMail({
        to: booking.userEmail,
        subject: 'Ticket Cancelled - Movie&BAE',
        html: `
          <h2>Your ticket has been cancelled.</h2>
          <p><strong>Movie:</strong> ${movie?.title || 'N/A'}</p>
          <p><strong>Seat:</strong> ${booking.seatNumber}</p>
          <p><strong>Time:</strong> ${new Date(booking.time).toLocaleString()}</p>
          <p><strong>Region:</strong> ${booking.region}</p>
          <p>If this was a mistake, please book again on our website.</p>
        `
      });
    } catch (e) {
      console.error('Failed to send cancellation email:', e.message);
    }
    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 