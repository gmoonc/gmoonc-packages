import React, { useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { GmooncShell } from '@gmoonc/ui';
import { defaultConfig } from '../config/defaultConfig';
import { GMooncSessionProvider, useGMooncSession } from '../session/GMooncSessionContext';
import { GMooncUserProfile } from '../components/GMooncUserProfile';

function GMooncAppLayoutInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { roles, logout } = useGMooncSession();

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  return (
    <GmooncShell
      config={defaultConfig}
      roles={roles}
      activePath={location.pathname}
      onNavigate={(path) => navigate(path)}
      headerRight={<GMooncUserProfile onLogoutRequest={handleLogout} />}
      renderLink={({ path, label, isActive, onClick }) => (
        <button
          type="button"
          onClick={onClick}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            textDecoration: isActive ? 'underline' : 'none',
            font: 'inherit'
          }}
        >
          {label}
        </button>
      )}
    >
      <Outlet />
    </GmooncShell>
  );
}

export function GmooncAppLayout() {
  return (
    <GMooncSessionProvider>
      <GMooncAppLayoutInner />
    </GMooncSessionProvider>
  );
}
