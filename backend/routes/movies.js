const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Movie = require('../models/Movie');

// Middleware to validate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied: No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// GET all movies created by the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const movies = await Movie.find({ createdBy: req.user.id });
    res.status(200).json(movies);
  } catch (err) {
    console.error('Error fetching movies:', err.message, err.stack);
    res.status(500).json({ message: 'Failed to fetch movies' });
  }
});

// POST a new movie
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, director, releaseYear, genre } = req.body;

    if (!title || !director || !releaseYear || !genre) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const movie = new Movie({
      title,
      director,
      releaseYear,
      genre,
      createdBy: req.user.id,
    });

    await movie.save();
    res.status(201).json(movie);
  } catch (err) {
    console.error('Error saving movie:', err.message, err.stack);
    res.status(500).json({ message: 'Failed to save movie', error: err.message });
  }
});

module.exports = router;
