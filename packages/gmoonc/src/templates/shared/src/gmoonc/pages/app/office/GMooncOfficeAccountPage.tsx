import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGMooncSession } from '../../../session/GMooncSessionContext';
import { User, Mail, Lock, ArrowLeft, Save, Key } from 'lucide-react';

export function GMooncOfficeAccountPage() {
  const { user } = useGMooncSession();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [newEmail, setNewEmail] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/app');
    }
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculatePasswordStrength = (password: string) => {
    if (!password) {
      return { score: 0, label: '', color: '' };
    }

    let score = 0;
    
    // Criterion 1: Length
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Criterion 2: Uppercase
    if (/[A-Z]/.test(password)) score += 1;
    
    // Criterion 3: Lowercase
    if (/[a-z]/.test(password)) score += 1;
    
    // Criterion 4: Numbers
    if (/[0-9]/.test(password)) score += 1;
    
    // Criterion 5: Symbols
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    // Penalize obvious sequences
    if (/(.)\1{2,}/.test(password) || /123|abc|qwerty|password/i.test(password)) {
      score = Math.max(0, score - 2);
    }

    // Define strength based on score
    if (score <= 2) return { score, label: 'Weak', color: 'var(--gmoonc-color-error, #ef4444)' };
    if (score <= 4) return { score, label: 'Medium', color: 'var(--gmoonc-color-accent, #f59e0b)' };
    return { score, label: 'Strong', color: 'var(--gmoonc-color-accent, #71b399)' };
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    // Calculate strength only for new password field
    if (name === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      // Placeholder: Update profile name
      // In a real implementation, this would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessage('✅ Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Error updating profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPasswordLoading) return;

    setIsPasswordLoading(true);
    setPasswordError('');
    setPasswordMessage('');

    try {
      // Validations
      if (!passwordData.currentPassword) {
        setPasswordError('Please enter your current password.');
        setIsPasswordLoading(false);
        return;
      }

      if (passwordData.newPassword.length < 8) {
        setPasswordError('New password must be at least 8 characters.');
        setIsPasswordLoading(false);
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError('Passwords do not match.');
        setIsPasswordLoading(false);
        return;
      }

      // Validate password strength
      if (passwordStrength.score < 3) {
        setPasswordError('Please choose a stronger password following the recommendations.');
        setIsPasswordLoading(false);
        return;
      }

      // Placeholder: Update password
      // In a real implementation, this would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));

      setPasswordMessage('✅ Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordStrength({ score: 0, label: '', color: '' });
      
      setTimeout(() => setPasswordMessage(''), 3000);
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError('Error updating password. Please try again.');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleEmailChange = useCallback(async () => {
    if (!newEmail || newEmail === user?.email) {
      setError('Please enter a new email different from the current one.');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      // Placeholder: Request email change
      // In a real implementation, this would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage('✅ A confirmation email will be sent to the new address.');
      setNewEmail('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error changing email:', error);
      setError(error instanceof Error ? error.message : 'Unexpected error changing email.');
    }
  }, [newEmail, user?.email]);

  if (!user) {
    return (
      <div className="gmoonc-account-page">
        <div className="gmoonc-account-header">
          <button onClick={handleBack} className="back-button" aria-label="Back">
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div className="header-content">
            <h1 className="page-title">Manage Account</h1>
            <p className="page-subtitle">Configure your personal information and security preferences</p>
          </div>
        </div>
        <div className="gmoonc-account-grid">
          <div className="gmoonc-account-card">
            <p>No user information available.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gmoonc-account-page">
      {/* Header */}
      <div className="gmoonc-account-header">
        <button onClick={handleBack} className="back-button" aria-label="Back">
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <div className="header-content">
          <h1 className="page-title">Manage Account</h1>
          <p className="page-subtitle">Configure your personal information and security preferences</p>
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="gmoonc-account-grid">
        {/* Card: Personal Information */}
        <div className="gmoonc-account-card">
          <div className="card-header">
            <div className="card-icon">
              <User size={24} />
            </div>
            <div>
              <h2 className="card-title">Personal Information</h2>
              <p className="card-description">Update your name and basic information</p>
            </div>
          </div>

          {message && (
            <div className="alert alert-success">
              {message}
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="card-form">
            <div className="form-field">
              <label htmlFor="name" className="form-label">
                <User size={16} />
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Your full name"
                required
                minLength={2}
              />
            </div>

            <div className="form-field">
              <label htmlFor="email" className="form-label">
                <Mail size={16} />
                Current Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                className="form-input disabled"
                disabled
              />
              <small className="form-hint">
                The current email cannot be edited directly. Use the "Change Email" section below.
              </small>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              <Save size={18} />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Card: Account Security */}
        <div className="gmoonc-account-card">
          <div className="card-header">
            <div className="card-icon">
              <Lock size={24} />
            </div>
            <div>
              <h2 className="card-title">Account Security</h2>
              <p className="card-description">Change your password to keep your account secure</p>
            </div>
          </div>

          {passwordMessage && (
            <div className="alert alert-success">
              {passwordMessage}
            </div>
          )}

          {passwordError && (
            <div className="alert alert-error">
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="card-form">
            <div className="form-field">
              <label htmlFor="currentPassword" className="form-label">
                <Lock size={16} />
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="form-input"
                placeholder="Enter your current password"
                required
                disabled={isPasswordLoading}
              />
            </div>

            <div className="form-field">
              <label htmlFor="newPassword" className="form-label">
                <Key size={16} />
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="form-input"
                placeholder="Enter your new password"
                required
                minLength={8}
                disabled={isPasswordLoading}
              />
              
              {/* Password Strength Indicator */}
              {passwordData.newPassword && (
                <div className="password-strength-container">
                  <div className="password-strength-bar">
                    <div 
                      className="password-strength-fill"
                      style={{
                        width: `${(passwordStrength.score / 6) * 100}%`,
                        backgroundColor: passwordStrength.color
                      }}
                    />
                  </div>
                  <span 
                    className="password-strength-label"
                    style={{ color: passwordStrength.color }}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="confirmPassword" className="form-label">
                <Lock size={16} />
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="form-input"
                placeholder="Confirm your new password"
                required
                minLength={8}
                disabled={isPasswordLoading}
              />
            </div>

            {/* Password Tips */}
            <div className="password-tips">
              <h4 className="password-tips-title">Password Recommendations:</h4>
              <ul className="password-tips-list">
                <li className={passwordData.newPassword.length >= 8 ? 'tip-met' : ''}>
                  Minimum: 8 characters (recommended: 12+)
                </li>
                <li className={/[A-Z]/.test(passwordData.newPassword) && /[a-z]/.test(passwordData.newPassword) && /[0-9]/.test(passwordData.newPassword) && /[^A-Za-z0-9]/.test(passwordData.newPassword) ? 'tip-met' : ''}>
                  Combine: uppercase, lowercase, numbers and symbols
                </li>
                <li>
                  Avoid: personal information and obvious sequences
                </li>
                <li>
                  Use: unique password for this account
                </li>
              </ul>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isPasswordLoading}
            >
              <Lock size={18} />
              {isPasswordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Card: Change Email */}
        <div className="gmoonc-account-card">
          <div className="card-header">
            <div className="card-icon">
              <Mail size={24} />
            </div>
            <div>
              <h2 className="card-title">Change Email</h2>
              <p className="card-description">Update your primary email address</p>
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleEmailChange(); }} className="card-form">
            <div className="form-field">
              <label htmlFor="newEmail" className="form-label">
                <Mail size={16} />
                New Email
              </label>
              <input
                type="email"
                id="newEmail"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="form-input"
                placeholder="Enter the new email"
                required
              />
              <small className="form-hint">
                A confirmation email will be sent to the new address.
              </small>
            </div>

            <button
              type="submit"
              className="btn btn-secondary"
              disabled={!newEmail || newEmail === user.email}
            >
              <Mail size={18} />
              Request Change
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
