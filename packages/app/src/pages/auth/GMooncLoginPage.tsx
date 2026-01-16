import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGMooncSession } from '../../session/GMooncSessionContext';

export function GMooncLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useGMooncSession();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="gmoonc-auth-page">
      <div className="gmoonc-auth-card">
        <div className="gmoonc-auth-header">
          <h1>Goalmoon Ctrl</h1>
          <p>Dashboard Control System</p>
        </div>

        <form onSubmit={handleSubmit} className="gmoonc-auth-form">
          {error && (
            <div className="gmoonc-auth-error">
              {error}
            </div>
          )}

          <div className="gmoonc-form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          <div className="gmoonc-form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="gmoonc-auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="gmoonc-auth-links">
          <Link to="/forgot-password" className="gmoonc-auth-link">
            Forgot password?
          </Link>
          <Link to="/register" className="gmoonc-auth-link">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
