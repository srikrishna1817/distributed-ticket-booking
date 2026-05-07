import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

const API_URL = 'https://ticket-booking-backend-1vuk.onrender.com/api';

function RegisterPage({ onGoLogin }) {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.full_name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('All fields are required.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/register`, {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password
      });

      if (res.data.success) {
        setSuccess('Account created! Redirecting to login…');
        setTimeout(() => onGoLogin(), 1800);
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
        <div className="auth-logo">🎟️</div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join to book match tickets</p>

        {error && (
          <div className="inline-error">
            <span>⚠️</span> {error}
          </div>
        )}
        {success && (
          <div className="inline-success">
            <span>✅</span> {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label-custom">Full Name</label>
            <input
              type="text"
              name="full_name"
              className="form-input"
              placeholder="Srikrishna Kausik"
              value={form.full_name}
              onChange={handleChange}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label-custom">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label-custom">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label-custom">Confirm Password</label>
            <input
              type="password"
              name="confirm"
              className="form-input"
              placeholder="Repeat password"
              value={form.confirm}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary-custom"
            disabled={loading}
          >
            {loading ? <><span className="spinner" /> Creating Account…</> : '🚀 Create Account'}
          </button>
        </form>

        <div className="auth-link">
          Already have an account?{' '}
          <button type="button" className="auth-link-btn" onClick={onGoLogin}>Sign in →</button>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
