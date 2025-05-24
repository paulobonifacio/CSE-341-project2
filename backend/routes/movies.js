const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose'); // ADICIONADO para validar ObjectId
const Movie = require('../models/Movie');

// Middleware to validate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  let token = authHeader;

  if (!token) {
    return res.status(401).json({ message: 'Access denied: No token provided' });
  }

  // Remove "Bearer " se estiver presente
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

// GET a movie by ID (either MongoDB _id or movieId)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    let movie = null;

    // Verifica se o id é um ObjectId válido antes de usar findById
    if (mongoose.Types.ObjectId.isValid(id)) {
      movie = await Movie.findById(id);
    }

    // Se não encontrou pelo _id ou se não era um ObjectId, tenta pelo movieId
    if (!movie) {
      movie = await Movie.findOne({ movieId: id });
    }

    // Se não encontrou de nenhuma forma, retorna 404
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

module.exports = router;
