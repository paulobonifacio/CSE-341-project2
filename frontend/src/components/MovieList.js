import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './movieList.css';

function MovieList() {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/movies`);
        setMovies(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch movies');
        console.error('Error fetching movies:', err);
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const handleDelete = async (id) => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/movies/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMovies(movies.filter(movie => movie._id !== id));
      setError(''); // Clear error on success
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete movie';
      setError(`Delete error: ${errorMsg}`);
      console.error('Delete error:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  return (
    <div className="movie-list-container">
      <div className="movie-list-header">
        <h2 className="movie-list-title">Movies</h2>
        {token && (
          <Link to="/movies/new" className="add-movie-button">
            Add New Movie
          </Link>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : movies.length === 0 ? (
        <p className="no-movies">No movies found.</p>
      ) : (
        <div className="movies-grid">
          {movies.map(movie => (
            <div key={movie._id} className="movie-card">
              <h3 className="movie-title">{movie.title}</h3>
              <p className="movie-description">{movie.description}</p>
              
              <div className="movie-details">
                <p><span className="detail-label">Release Date:</span> {new Date(movie.releaseDate).toISOString().split('T')[0]}</p>
                <p><span className="detail-label">Genre:</span> {movie.genre.join(', ')}</p>
                <p><span className="detail-label">Director:</span> {movie.director}</p>
                <p><span className="detail-label">Cast:</span> {movie.cast.join(', ')}</p>
                <p><span className="detail-label">Rating:</span> {movie.rating}/10</p>
              </div>
              
              {token && (
                <div className="movie-actions">
                  <Link to={`/movies/edit/${movie._id}`} className="edit-button">
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleDelete(movie._id)} 
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MovieList;