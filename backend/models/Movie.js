const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  movieId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  releaseDate: { type: Date, required: true },
  genre: { type: [String], required: true },
  director: { type: String, required: true },
  cast: { type: [String], required: true },
  rating: { type: Number, required: true, min: 0, max: 10 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Movie', movieSchema);