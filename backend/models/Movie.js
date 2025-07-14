// models/Movie.js
const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  title: String,
  description: String,
  genre: String,
  rating: String,
  duration: String,
  year: Number,
  imdbScore: Number,
  trailerUrl: String,
  // You can either store a URL or a path to an uploaded image
  poster: String, // e.g., '/uploads/posters/xyz.jpg'
  fare: Number,
  casts: [String],
});

module.exports = mongoose.model('Movie', MovieSchema);
