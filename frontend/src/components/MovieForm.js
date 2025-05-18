import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './movieForm.css';

function MovieForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState({
    movieId: '',
    title: '',
    description: '',
    releaseDate: '',
    genre: '',
    director: '',
    cast: '',
    rating: 0,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchMovie = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            setError('Please log in to edit a movie');
            navigate('/login');
            return;
          }
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/movies/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setMovie({
            movieId: response.data.movieId,
            title: response.data.title,
            description: response.data.description,
            releaseDate: response.data.releaseDate.split('T')[0],
            genre: response.data.genre?.join(', ') || '',
            director: response.data.director,
            cast: response.data.cast?.join(', ') || '',
            rating: response.data.rating,
          });
        } catch (error) {
          console.error('Fetch movie error:', error);
          if (error.response?.status === 401) {
            setError('Session expired or invalid token. Please log in again.');
            localStorage.removeItem('token');
            navigate('/login');
          } else if (error.response?.status === 404) {
            setError('Movie not found');
            navigate('/movies');
          } else {
            setError(error.response?.data?.message || 'Error fetching movie');
          }
        }
      };
      fetchMovie();
    }
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to create/edit a movie');
        navigate('/login');
        return;
      }
      
      const filteredMovie = {
        movieId: movie.movieId,
        title: movie.title,
        description: movie.description,
        releaseDate: movie.releaseDate,
        genre: movie.genre.split(',').map(item => item.trim()).filter(item => item),
        director: movie.director,
        cast: movie.cast.split(',').map(item => item.trim()).filter(item => item),
        rating: movie.rating,
      };

      const url = id
        ? `${process.env.REACT_APP_API_URL}/movies/${id}`
        : `${process.env.REACT_APP_API_URL}/movies`;
      const method = id ? 'put' : 'post';
      
      await axios[method](url, filteredMovie, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/movies');
    } catch (error) {
      console.error('Submit error:', error);
      if (error.response?.status === 401) {
        setError('Session expired or invalid token. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(error.response?.data?.message || 'An error occurred');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMovie({ ...movie, [name]: value });
  };

  return (
    <div className="movie-form-container">
      <h1 className="movie-form-title">{id ? 'Edit Movie' : 'Add New Movie'}</h1>
      
      {error && <div className="error-message">{error}</div>}

      <form className="movie-form" onSubmit={handleSubmit}>
        <div className="movie-form-group">
          <label className="movie-form-label">Movie ID</label>
          <input
            className="movie-form-input"
            name="movieId"
            value={movie.movieId}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="movie-form-group">
          <label className="movie-form-label">Title</label>
          <input
            className="movie-form-input"
            name="title"
            value={movie.title}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="movie-form-group">
          <label className="movie-form-label">Description</label>
          <textarea
            className="movie-form-input movie-form-textarea"
            name="description"
            value={movie.description}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="movie-form-group">
          <label className="movie-form-label">Release Date</label>
          <input
            className="movie-form-input"
            type="date"
            name="releaseDate"
            value={movie.releaseDate}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="movie-form-group">
          <label className="movie-form-label">Genre (comma separated)</label>
          <input
            className="movie-form-input"
            name="genre"
            value={movie.genre}
            onChange={handleChange}
            placeholder="Action, Comedy, Drama"
            required
          />
        </div>
        
        <div className="movie-form-group">
          <label className="movie-form-label">Director</label>
          <input
            className="movie-form-input"
            name="director"
            value={movie.director}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="movie-form-group">
          <label className="movie-form-label">Cast (comma separated)</label>
          <input
            className="movie-form-input"
            name="cast"
            value={movie.cast}
            onChange={handleChange}
            placeholder="Actor 1, Actor 2, Actor 3"
            required
          />
        </div>
        
        <div className="movie-form-group">
          <label className="movie-form-label">Rating (0-10)</label>
          <input
            className="movie-form-input"
            type="number"
            name="rating"
            value={movie.rating}
            onChange={handleChange}
            min="0"
            max="10"
            step="0.1"
            required
          />
        </div>
        
        <div className="movie-form-actions">
          <button
            type="button"
            className="movie-form-button movie-form-cancel"
            onClick={() => navigate('/movies')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="movie-form-button movie-form-submit"
          >
            {id ? 'Update Movie' : 'Create Movie'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default MovieForm;