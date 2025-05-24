const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose'); 
const Movie = require('../models/Movie');

// Middleware to validate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  let token = authHeader;

  if (!token) {
    return res.status(401).json({ message: 'Access denied: No token provided' });
  }

  // Remove "Bearer " if present
  if (token.startsWith('Bearer ')) {
    token = token.slice(7).trim();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
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

// GET a movie by ID (supports MongoDB _id or custom movieId)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    let movie = null;

    // Check if the ID is a valid MongoDB ObjectId before calling findById
    if (mongoose.Types.ObjectId.isValid(id)) {
      movie = await Movie.findById(id);
    }

    // If not found by _id, or not an ObjectId, search by movieId
    if (!movie) {
      movie = await Movie.findOne({ movieId: id });
    }

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.status(200).json(movie);
  } catch (err) {
    console.error('Error fetching movie by ID:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST a new movie
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      movieId,
      title,
      description,
      releaseDate,
      genre,
      director,
      cast,
      rating
    } = req.body;

    if (!movieId || !title || !description || !releaseDate || !genre || !director || !cast || !rating) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newMovie = new Movie({
      movieId,
      title,
      description,
      releaseDate,
      genre,
      director,
      cast,
      rating,
      createdBy: req.user.id
    });

    await newMovie.save();
    res.status(201).json(newMovie);
  } catch (err) {
    console.error('Error saving movie:', err);
    res.status(500).json({ message: 'Failed to save movie', error: err.message });
  }
});

// PUT update a movie by ID (supports MongoDB _id or custom movieId)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    let movie = null;

    // If it's a valid MongoDB ObjectId, try finding by _id
    if (mongoose.Types.ObjectId.isValid(id)) {
      movie = await Movie.findById(id);
    }

    // If not found by _id, or not an ObjectId, search by movieId
    if (!movie) {
      movie = await Movie.findOne({ movieId: id });
    }

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Update fields with new data from the request body
    Object.assign(movie, updateData);

    await movie.save();

    res.status(200).json(movie);
  } catch (err) {
    console.error('Error updating movie:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE a movie by ID (supports MongoDB _id or custom movieId)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    let movie = null;

    // If it's a valid MongoDB ObjectId, try finding by _id
    if (mongoose.Types.ObjectId.isValid(id)) {
      movie = await Movie.findById(id);
    }

    // If not found by _id, or not an ObjectId, search by movieId
    if (!movie) {
      movie = await Movie.findOne({ movieId: id });
    }

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Remove the movie
    await movie.remove();

    res.status(200).json({ message: 'Movie deleted successfully' });
  } catch (err) {
    console.error('Error deleting movie:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
