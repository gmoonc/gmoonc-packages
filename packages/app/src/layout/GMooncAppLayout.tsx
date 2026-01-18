import React, { useCallback } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
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

  const handleAccount = useCallback(() => {
    navigate('/app/office/account');
  }, [navigate]);

  const handleAbout = useCallback(() => {
    navigate('/app/office/about');
  }, [navigate]);

  return (
    <GmooncShell
      config={defaultConfig}
      roles={roles}
      activePath={location.pathname}
      onNavigate={(path) => navigate(path)}
      headerRight={
        <GMooncUserProfile
          onAccount={handleAccount}
          onAbout={handleAbout}
          onLogoutRequest={handleLogout}
        />
      }
      renderLink={({ path, label, isActive, onClick }) => (
        <Link
          to={path}
          onClick={onClick}
          style={{
            textDecoration: isActive ? 'underline' : 'none',
            color: 'inherit'
          }}
        >
          {label}
        </Link>
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
