import React, { useCallback } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { GmooncShell } from '../ui/shell';
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

  const handleLogoClick = useCallback(() => {
    navigate('/app');
  }, [navigate]);

  return (
    <div className="gmoonc-root">
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
        logoUrl="/gmoonc/assets/gmoonc-logo.png"
        logoAlt="GMoonc"
        renderLink={({ path, label, isActive, onClick, className, children }) => (
          <Link
            to={path}
            onClick={onClick}
            className={className}
            style={{
              textDecoration: isActive ? 'underline' : 'none',
              color: 'inherit'
            }}
          >
            {children || label}
          </Link>
        )}
      >
        <Outlet />
      </GmooncShell>
    </div>
  );
}

export function GmooncAppLayout() {
  return (
    <GMooncSessionProvider>
      <GMooncAppLayoutInner />
    </GMooncSessionProvider>
  );
}
