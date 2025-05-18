const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find();
    if (!movies || movies.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, validate('movie'), async (req, res) => {
  try {
    const { movieId, title, description, releaseDate, genre, director, cast, rating } = req.body;
    const movie = new Movie({
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
    const savedMovie = await movie.save();
    res.status(201).json(savedMovie);
  } catch (error) {
    console.error('Error creating movie:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: 'Invalid data' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

router.put('/:id', auth, validate('movie'), async (req, res) => {
  try {
    const { id } = req.params;
    const { movieId, title, description, releaseDate, genre, director, cast, rating } = req.body;
    const movie = await Movie.findById(id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    if (movie.createdBy.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    movie.movieId = movieId || movie.movieId;
    movie.title = title || movie.title;
    movie.description = description || movie.description;
    movie.releaseDate = releaseDate || movie.releaseDate;
    movie.genre = genre || movie.genre;
    movie.director = director || movie.director;
    movie.cast = cast || movie.cast;
    movie.rating = rating || movie.rating;

    const updatedMovie = await movie.save();
    res.status(200).json(updatedMovie);
  } catch (error) {
    console.error('Error updating movie:', error);
    if (error.name === 'CastError') {
      res.status(400).json({ message: 'Invalid ID' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.status(200).json(movie);
  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    if (movie.createdBy.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    await movie.deleteOne(); 
    res.status(200).json({ message: 'Movie deleted' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;