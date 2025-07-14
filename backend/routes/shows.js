const express = require('express');
const router = express.Router();
const Show = require('../models/Show');
const Movie = require('../models/Movie');
const adminAuth = require('../middleware/auth');

// Public: Get all shows (with optional filtering)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.movieId) filter.movieId = req.query.movieId;
    if (req.query.region) filter.region = req.query.region;
    if (req.query.time) filter.time = req.query.time;
    const shows = await Show.find(filter).populate('movieId');
    res.json(shows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public: Get a single show by ID
router.get('/:id', async (req, res) => {
  try {
    const show = await Show.findById(req.params.id).populate('movieId');
    if (!show) return res.status(404).json({ error: 'Show not found' });
    res.json(show);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// All routes below require admin authentication
router.use(adminAuth);

// Admin-only: Create a new show
router.post('/', async (req, res) => {
  try {
    const { movieId, time, region } = req.body;
    if (!movieId || !time || !region) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const show = new Show({ movieId, time, region });
    await show.save();
    // Populate movieId for socket event
    const populatedShow = await Show.findById(show._id).populate('movieId');
    req.app.get('io').emit('show_added', populatedShow);
    res.status(201).json(populatedShow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin-only: Bulk add shows
router.post('/bulk', async (req, res) => {
  try {
    const shows = req.body; // Expecting an array
    const inserted = await Show.insertMany(shows);
    res.status(201).json({ message: 'Shows added successfully', data: inserted });
  } catch (error) {
    res.status(500).json({ error: 'Failed to insert shows' });
  }
});

// Admin-only: Update a show
router.put('/:id', async (req, res) => {
  try {
    const { movieId, time, region } = req.body;
    const show = await Show.findByIdAndUpdate(
      req.params.id,
      { movieId, time, region },
      { new: true }
    );
    if (!show) return res.status(404).json({ error: 'Show not found' });
    res.json(show);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin-only: Delete a show
router.delete('/:id', async (req, res) => {
  try {
    const show = await Show.findByIdAndDelete(req.params.id);
    if (!show) return res.status(404).json({ error: 'Show not found' });
    res.json({ message: 'Show deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 