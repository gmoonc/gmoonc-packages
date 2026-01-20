import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export function GMooncForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Mock password recovery
    setTimeout(() => {
      setIsSent(true);
      setIsLoading(false);
    }, 1000);
  };

  if (isSent) {
    return (
      <div className="gmoonc-root gmoonc-auth-page">
        <div className="gmoonc-auth-card">
          <div className="gmoonc-auth-header">
            <h1>Email Sent</h1>
            <p>Check your inbox</p>
          </div>

          <div className="gmoonc-auth-success">
            <p>
              We sent a recovery link to <strong>{email}</strong>.
              Click the link to reset your password.
            </p>
          </div>

          <div className="gmoonc-auth-links">
            <Link to="/login" className="gmoonc-auth-link">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gmoonc-root gmoonc-auth-page">
      <div className="gmoonc-auth-card">
        <div className="gmoonc-auth-header">
          <h1>Recover Password</h1>
          <p>Enter your email to receive the recovery link</p>
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
            />
          </div>

          <button
            type="submit"
            className="gmoonc-auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Recovery Link'}
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
