import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function GMooncResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    // Mock password reset
    setTimeout(() => {
      setSuccess(true);
      setIsLoading(false);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }, 1000);
  };

  if (success) {
    return (
      <div className="gmoonc-root gmoonc-auth-page">
        <div className="gmoonc-auth-card">
          <div className="gmoonc-auth-header">
            <h1>Password Reset</h1>
            <p>Success!</p>
          </div>

          <div className="gmoonc-auth-success">
            <p>Your password has been reset successfully. Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gmoonc-root gmoonc-auth-page">
      <div className="gmoonc-auth-card">
        <div className="gmoonc-auth-header">
          <h1>Reset Password</h1>
          <p>Enter your new password</p>
        </div>

        <form onSubmit={handleSubmit} className="gmoonc-auth-form">
          {error && (
            <div className="gmoonc-auth-error">
              {error}
            </div>
          )}

          <div className="gmoonc-form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          <div className="gmoonc-form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
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
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="gmoonc-auth-links">
          <Link to="/login" className="gmoonc-auth-link">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
