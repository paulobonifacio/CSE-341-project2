import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import './login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  if (!process.env.REACT_APP_GOOGLE_CLIENT_ID) {
    console.warn('Warning: REACT_APP_GOOGLE_CLIENT_ID is not set. Google OAuth will not work.');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const url = isRegister ? '/auth/register' : '/auth/login';
      const data = isRegister ? { email, password, name } : { email, password };
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}${url}`,
        data
      );
      const token = response.data.token;
      localStorage.setItem('token', token);
      navigate('/movies');
    } catch (error) {
      console.error('Request error:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
      });
      let errorMessage = 'An error occurred during registration/login';
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to the server. Please ensure the server is running on http://localhost:5000.';
      } else if (error.response) {
        errorMessage = error.response.data.message || 'Request failed';
      }
      setError(errorMessage);
    }
  };

  const onGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/google`,
        { credential: credentialResponse.credential }
      );
      const token = res.data.token;
      localStorage.setItem('token', token);
      navigate('/movies');
    } catch (error) {
      console.error('Google login error:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
      });
      setError('Google login failed. Please ensure the server is running and Google Client ID is configured.');
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
      <p className="login-subtitle">{isRegister ? 'Join our movie community' : 'Sign in to continue'}</p>

      {error && <div className="error-message">{error}</div>}

      <form className="login-form" onSubmit={handleSubmit}>
        {isRegister && (
          <input
            type="text"
            className="login-input"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          className="login-input"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="login-input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="login-button">
          {isRegister ? 'Register' : 'Login'}
        </button>
      </form>

      <div className="login-toggle">
        <button className="login-toggle-button" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
        </button>
      </div>

      <div className="login-divider">
        <span className="login-divider-text">OR</span>
      </div>

      <div className="google-login-container">
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}>
          <GoogleLogin
            onSuccess={onGoogleSuccess}
            onError={() => {
              console.error('Google login failed');
              setError('Google login failed. Please check Google Client ID configuration.');
            }}
          />
        </GoogleOAuthProvider>
      </div>
    </div>
  );
}

export default Login;