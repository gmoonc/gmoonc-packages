import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export function GMooncRegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    // Mock registration
    setTimeout(() => {
      setSuccess('Account created successfully! Please check your email to activate your account.');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="gmoonc-root gmoonc-auth-page">
      <div className="gmoonc-auth-card">
        <div className="gmoonc-auth-header">
          <h1>Create Account</h1>
          <p>Goalmoon Ctrl - Dashboard System</p>
        </div>

        <form onSubmit={handleSubmit} className="gmoonc-auth-form">
          {error && (
            <div className="gmoonc-auth-error">
              {error}
            </div>
          )}
          {success && (
            <div className="gmoonc-auth-success">
              {success}
            </div>
          )}

          <div className="gmoonc-form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              required
              disabled={isLoading}
            />
          </div>

          <div className="gmoonc-form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div className="gmoonc-form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          <div className="gmoonc-form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="gmoonc-auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="gmoonc-auth-links">
          <Link to="/login" className="gmoonc-auth-link">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
