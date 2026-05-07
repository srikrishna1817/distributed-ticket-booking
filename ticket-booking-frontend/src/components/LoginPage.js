import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

const API_URL = 'https://ticket-booking-backend-1vuk.onrender.com/api';

function LoginPage({ onLogin, onGoRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (res.data.success) {
        onLogin(res.data.user);
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Unable to connect to server. Is the backend running?');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">🏏</div>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to book your tickets</p>

        {error && (
          <div className="inline-error">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label-custom">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label-custom">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary-custom"
            disabled={loading}
          >
            {loading ? <><span className="spinner" /> Signing In…</> : '🔐 Sign In'}
          </button>
        </form>

        <div className="auth-link">
          Don't have an account?{' '}
          <button type="button" className="auth-link-btn" onClick={onGoRegister}>Create one →</button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
