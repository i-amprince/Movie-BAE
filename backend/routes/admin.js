const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const User = require('../models/User');
const Show = require('../models/Show');
const adminAuth = require('../middleware/auth');

// Admin login (plain text password)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    // Compare plain text password
    if (admin.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    // Generate JWT
    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: 'admin' },
      process.env.JWT_SECRET || 'supersecret',
      { expiresIn: '2h' }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Temporary: Create admin user (for setup/testing only)
router.post('/create', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  try {
    const exists = await Admin.findOne({ username });
    if (exists) return res.status(400).json({ error: 'Username already exists.' });
    const admin = new Admin({ username, password });
    await admin.save();
    res.status(201).json({ message: 'Admin created.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Analytics endpoints (admin only)
router.get('/analytics/total-bookings', adminAuth, async (req, res) => {
  try {
    const total = await Booking.countDocuments();
    res.json({ totalBookings: total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch total bookings' });
  }
});

router.get('/analytics/bookings-per-movie', adminAuth, async (req, res) => {
  try {
    const bookings = await Booking.aggregate([
      { $group: { _id: '$movieId', count: { $sum: 1 } } },
      { $lookup: { from: 'movies', localField: '_id', foreignField: '_id', as: 'movie' } },
      { $unwind: '$movie' },
      { $project: { _id: 0, movieId: '$_id', title: '$movie.title', count: 1 } }
    ]);
    res.json({ bookingsPerMovie: bookings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings per movie' });
  }
});

// Total revenue
router.get('/analytics/total-revenue', adminAuth, async (req, res) => {
  try {
    const bookings = await Booking.find().populate('movieId');
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.movieId && b.movieId.fare ? b.movieId.fare : 0), 0);
    res.json({ totalRevenue });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch total revenue' });
  }
});

// Total users
router.get('/analytics/total-users', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    res.json({ totalUsers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch total users' });
  }
});

// Movies running (with live/ongoing shows)
router.get('/analytics/movies-running', adminAuth, async (req, res) => {
  try {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    // A show is 'Live' if its time is in the future or within the last 2 hours
    const shows = await Show.find({ time: { $gte: twoHoursAgo } });
    const movieIds = [...new Set(shows.map(s => s.movieId.toString()))];
    res.json({ moviesRunning: movieIds.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch movies running' });
  }
});

// Most booked movie (public)
router.get('/analytics/most-booked-movie', async (req, res) => {
  try {
    const agg = await Booking.aggregate([
      { $group: { _id: '$movieId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    if (!agg.length) return res.json({ mostBookedMovie: null });
    const movie = await Movie.findById(agg[0]._id);
    res.json({ mostBookedMovie: movie, count: agg[0].count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch most booked movie' });
  }
});

// Top performing city/region
router.get('/analytics/top-city', adminAuth, async (req, res) => {
  try {
    const agg = await Booking.aggregate([
      { $group: { _id: '$region', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    if (!agg.length) return res.json({ topCity: null });
    res.json({ topCity: agg[0]._id, count: agg[0].count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch top city' });
  }
});

// Bookings over time (last 30 days)
router.get('/analytics/bookings-over-time', adminAuth, async (req, res) => {
  try {
    const from = new Date();
    from.setDate(from.getDate() - 29);
    const agg = await Booking.aggregate([
      { $match: { createdAt: { $gte: from } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      } },
      { $sort: { _id: 1 } }
    ]);
    res.json({ bookingsOverTime: agg });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings over time' });
  }
});

// Top 5 movies by bookings
router.get('/analytics/top-movies', adminAuth, async (req, res) => {
  try {
    const agg = await Booking.aggregate([
      { $group: { _id: '$movieId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    const movies = await Movie.find({ _id: { $in: agg.map(a => a._id) } });
    const result = agg.map(a => ({
      movie: movies.find(m => m._id.toString() === a._id.toString()),
      count: a.count
    }));
    res.json({ topMovies: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch top movies' });
  }
});

// Revenue by movie (pie/donut)
router.get('/analytics/revenue-by-movie', adminAuth, async (req, res) => {
  try {
    const bookings = await Booking.find().populate('movieId');
    const revenueMap = {};
    bookings.forEach(b => {
      if (b.movieId && b.movieId._id) {
        revenueMap[b.movieId._id] = (revenueMap[b.movieId._id] || 0) + (b.movieId.fare || 0);
      }
    });
    const movies = await Movie.find({ _id: { $in: Object.keys(revenueMap) } });
    const result = movies.map(m => ({
      movie: m,
      revenue: revenueMap[m._id] || 0
    }));
    res.json({ revenueByMovie: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch revenue by movie' });
  }
});

// User growth over time (last 30 days)
router.get('/analytics/user-growth', adminAuth, async (req, res) => {
  try {
    const from = new Date();
    from.setDate(from.getDate() - 29);
    const agg = await User.aggregate([
      { $match: { createdAt: { $gte: from } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      } },
      { $sort: { _id: 1 } }
    ]);
    res.json({ userGrowth: agg });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user growth' });
  }
});

module.exports = router; 