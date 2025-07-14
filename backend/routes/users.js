const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Upsert user on Google login or booking
router.post('/google', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }
    const user = await User.findOneAndUpdate(
      { email },
      { $setOnInsert: { name, email, createdAt: new Date() } },
      { upsert: true, new: true }
    );
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users (for admin analytics)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 