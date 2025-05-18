import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import MovieForm from './components/MovieForm';
import MovieList from './components/MovieList';
import './App.css';

function App() {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <Link to="/" className="navbar-logo">MovieDB</Link>
          </div>
          <div className="navbar-links">
            <Link to="/movies" className="navbar-link">Movies</Link>
            {token && (
              <Link to="/movies/new" className="navbar-link">Add Movie</Link>
            )}
            <a 
              href={`${process.env.REACT_APP_API_URL}/../api-docs`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="navbar-link"
            >
              API Docs
            </a>
          </div>
          <div className="navbar-auth">
            {token ? (
              <button onClick={logout} className="navbar-button">Logout</button>
            ) : (
              <Link to="/login" className="navbar-button">Login</Link>
            )}
          </div>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<h1 className="welcome-title">Welcome to Movie Registration System</h1>} />
          <Route path="/login" element={<Login />} />
          <Route path="/movies" element={<MovieList />} />
          <Route
            path="/movies/new"
            element={token ? <MovieForm /> : <Login />}
          />
          <Route
            path="/movies/edit/:id"
            element={token ? <MovieForm /> : <Login />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;