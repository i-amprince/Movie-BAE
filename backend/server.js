// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const movieRoutes = require('./routes/movies');
const bookingsRouter = require('./routes/bookings');
const adminRouter = require('./routes/admin');
const showsRouter = require('./routes/shows');
const usersRouter = require('./routes/users');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust as needed for production
    methods: ['GET', 'POST']
  }
});

// Make io accessible in routes
app.set('io', io);

// In-memory seat lock tracking: { [movieId]: { [seatId]: { lockedBy, lockedAt } } }
const seatLocks = {};
const SEAT_LOCK_TIMEOUT = 2 * 60 * 1000; // 2 minutes

io.on('connection', (socket) => {
  // Client requests to lock a seat
  socket.on('lock_seat', ({ movieId, seatId, userId }) => {
    if (!seatLocks[movieId]) seatLocks[movieId] = {};
    const seat = seatLocks[movieId][seatId];
    if (!seat || (Date.now() - seat.lockedAt > SEAT_LOCK_TIMEOUT)) {
      // Lock seat
      seatLocks[movieId][seatId] = { lockedBy: userId, lockedAt: Date.now() };
      io.emit('seat_locked', { movieId, seatId, lockedBy: userId });
    } else {
      // Already locked
      socket.emit('seat_lock_failed', { movieId, seatId, lockedBy: seat.lockedBy });
    }
  });

  // Client requests to unlock a seat
  socket.on('unlock_seat', ({ movieId, seatId, userId }) => {
    if (seatLocks[movieId] && seatLocks[movieId][seatId] && seatLocks[movieId][seatId].lockedBy === userId) {
      delete seatLocks[movieId][seatId];
      io.emit('seat_unlocked', { movieId, seatId });
    }
  });

  // Optionally: handle disconnects, clean up locks, etc.
});

// Middleware
app.use(cors());
app.use(express.json()); // to parse JSON
app.use('/uploads', express.static('uploads')); // if using image uploads

// Routes
app.use('/api/movies', movieRoutes);
app.use('/api/bookings', bookingsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/shows', showsRouter);
app.use('/api/users', usersRouter);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB error:', err));

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
