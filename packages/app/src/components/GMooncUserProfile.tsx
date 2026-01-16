import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGMooncSession } from '../session/GMooncSessionContext';

interface GMooncUserProfileProps {
  onAccount?: () => void;
  onAbout?: () => void;
  onLogoutRequest?: () => void;
}

// Simple avatar component (no Gravatar dependency)
function SimpleAvatar({ email, name, size = 40 }: { email: string; name?: string; size?: number }) {
  const initials = useMemo(() => {
    if (name) {
      return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
    }
    return email?.charAt(0).toUpperCase() || 'U';
  }, [name, email]);

  return (
    <div
      className="avatar-initial"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: '#6374AD',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.4,
        fontWeight: 'bold'
      }}
    >
      {initials}
    </div>
  );
}

export function GMooncUserProfile({ onAccount, onAbout, onLogoutRequest }: GMooncUserProfileProps) {
  const { user, logout } = useGMooncSession();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleLogout = useCallback(async () => {
    if (onLogoutRequest) {
      onLogoutRequest();
      closeDropdown();
      return;
    }

    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('GMooncUserProfile: Error logging out:', error);
    } finally {
      closeDropdown();
    }
  }, [closeDropdown, logout, navigate, onLogoutRequest]);

  const handleAccount = useCallback(() => {
    onAccount?.();
    closeDropdown();
  }, [closeDropdown, onAccount]);

  const handleAbout = useCallback(() => {
    onAbout?.();
    closeDropdown();
  }, [closeDropdown, onAbout]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeDropdown]);

  useEffect(() => {
    if (isOpen && firstItemRef.current) {
      firstItemRef.current.focus();
    }
  }, [isOpen]);

  if (!user) {
    return null;
  }

  return (
    <div className="user-profile" ref={dropdownRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', zIndex: 1001 }}>
      <button
        className="user-profile-button"
        onClick={toggleDropdown}
        aria-label="User menu"
        aria-expanded={isOpen}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          borderRadius: '50%',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <div className="user-avatar" style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '2px solid #dbe2ea',
          transition: 'border-color 0.2s ease'
        }}>
          <SimpleAvatar email={user.email} name={user.name} size={40} />
        </div>
      </button>

      {isOpen && (
        <div className="user-dropdown" role="menu" style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(55, 65, 97, 0.15)',
          border: '1px solid #e9ecef',
          minWidth: '280px',
          zIndex: 1002,
          animation: 'dropdownFadeIn 0.2s ease',
          opacity: 1,
          visibility: 'visible',
          pointerEvents: 'auto'
        }}>
          <div className="user-info" style={{
            padding: '20px',
            borderBottom: '1px solid #f1f3f4'
          }}>
            <div className="user-name" style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#374161',
              marginBottom: '4px'
            }}>{user.name || 'User'}</div>
            <div className="user-email" style={{
              fontSize: '14px',
              color: '#6374AD'
            }}>{user.email}</div>
          </div>

          <div className="dropdown-divider" style={{
            height: '1px',
            backgroundColor: '#f1f3f4',
            margin: '8px 0'
          }}></div>

          <div className="dropdown-options" style={{
            padding: '8px 0'
          }}>
            {onAccount && (
              <button
                className="dropdown-option"
                role="menuitem"
                onClick={handleAccount}
                ref={firstItemRef}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '14px',
                  color: '#374161',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span className="option-icon" style={{ fontSize: '18px' }}>👤</span>
                Account
              </button>
            )}

            {onAbout && (
              <button
                className="dropdown-option"
                role="menuitem"
                onClick={handleAbout}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '14px',
                  color: '#374161',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span className="option-icon" style={{ fontSize: '18px' }}>ℹ️</span>
                About
              </button>
            )}

            <button
              className="dropdown-option"
              onClick={handleLogout}
              role="menuitem"
              style={{
                width: '100%',
                padding: '12px 20px',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                color: '#374161',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span className="option-icon" style={{ fontSize: '18px' }}>🚪</span>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
