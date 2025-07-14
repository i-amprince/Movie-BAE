const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  seatNumber: { type: String, required: true },
  time: { type: Date, required: true },
  region: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', BookingSchema); 