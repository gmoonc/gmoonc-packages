'use client';

import { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GravatarAvatar } from './user-avatar/GravatarAvatar';

interface UserProfileProps {
  onAccount?: () => void;
  onAbout?: () => void;
  onLogoutRequest?: () => void;
}

export default function UserProfile({ onAccount, onAbout, onLogoutRequest }: UserProfileProps) {
  const { user, logout } = useAuth();

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
    } catch (error) {
      console.error('UserProfile: Erro ao fazer logout:', error);
    } finally {
      closeDropdown();
    }
  }, [closeDropdown, logout, onLogoutRequest]);

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

  // Mover useMemo antes do early return para seguir as regras dos hooks
  const initials = useMemo(() => {
    if (!user) return 'U';
    return user.name
      ? user.name
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0])
          .join('')
          .toUpperCase()
      : user.email?.charAt(0).toUpperCase() || 'U';
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div className="user-profile" ref={dropdownRef}>
      <button
        className="user-profile-button"
        onClick={toggleDropdown}
        aria-label="Menu do usuário"
        aria-expanded={isOpen}
      >
        <div className="user-avatar">
          <GravatarAvatar
            email={user.email}
            size={80}
            alt={`Avatar de ${user.name || user.email}`}
            fallback={<div className="avatar-initial">{initials}</div>}
            className="avatar-image"
          />
        </div>
      </button>

      {isOpen && (
        <div className="user-dropdown" role="menu">
          <div className="user-info">
            <div className="user-name">{user.name || 'Usuário'}</div>
            <div className="user-email">{user.email}</div>
          </div>

          <div className="dropdown-divider"></div>

          <div className="dropdown-options">
            <button
              className="dropdown-option"
              role="menuitem"
              onClick={handleAccount}
              ref={firstItemRef}
            >
              <span className="option-icon">👤</span>
              Conta
            </button>

            <button className="dropdown-option" role="menuitem" onClick={handleAbout}>
              <span className="option-icon">ℹ️</span>
              Sobre
            </button>

            <button className="dropdown-option" onClick={handleLogout} role="menuitem">
              <span className="option-icon">🚪</span>
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
