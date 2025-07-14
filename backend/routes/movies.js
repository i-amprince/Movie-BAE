// routes/movies.js
const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const adminAuth = require('../middleware/auth');

// GET all movies
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// POST a new movie
router.post('/', async (req, res) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();
    res.status(201).json(movie);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add movie' });
  }
});

router.post('/bulk', async (req, res) => {
  try {
    const movies = req.body; // Expecting an array
    const inserted = await Movie.insertMany(movies);
    res.status(201).json({ message: 'Movies added successfully', data: inserted });
  } catch (error) {
    res.status(500).json({ error: 'Failed to insert movies' });
  }
});

// GET a single movie by ID
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
});

// Admin-only: Update a movie
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update movie' });
  }
});

// Admin-only: Delete a movie
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json({ message: 'Movie deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete movie' });
  }
});


module.exports = router;
