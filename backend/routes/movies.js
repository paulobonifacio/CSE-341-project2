// routes/movies.js
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

// GET all movies
router.get('/', authenticateToken, async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json(movies);
  } catch (err) {
    console.error('Error fetching movies:', err);
    res.status(500).json({ message: 'Failed to fetch movies' });
  }
});

// POST a new movie
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, director, year } = req.body;
    const newMovie = new Movie({ title, director, year });
    await newMovie.save();
    res.status(201).json(newMovie);
  } catch (err) {
    console.error('Error saving movie:', err);
    res.status(500).json({ message: 'Failed to save movie' });
  }
});

module.exports = router;
