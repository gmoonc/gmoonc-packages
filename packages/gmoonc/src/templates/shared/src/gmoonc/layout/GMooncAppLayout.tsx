import React, { useCallback } from 'react';
import { Outlet, useLocation, useNavigate, Link, Navigate } from 'react-router-dom';
import { GmooncShell } from '../ui/shell';
import { defaultConfig } from '../config/defaultConfig';
import { GMooncSessionProvider, useGMooncSession } from '../session/GMooncSessionContext';
import { GMooncUserProfile } from '../components/GMooncUserProfile';
import logoUrl from '../assets/gmoonc-logo.png';

function GMooncAppLayoutInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { roles, logout, isLoading, isAuthenticated } = useGMooncSession();

  // Determine basePath from current location
  // If path is /app/..., basePath is /app
  // If path is /dashboard/..., basePath is /dashboard
  const getBasePath = useCallback(() => {
    const path = location.pathname;
    // Match pattern: /app, /dashboard, etc. (first segment after /)
    const match = path.match(/^\/([^/]+)/);
    if (match && match[1] !== 'login' && match[1] !== 'register' && match[1] !== 'forgot-password' && match[1] !== 'reset-password' && match[1] !== 'logout') {
      return `/${match[1]}`;
    }
    // Default to /app
    return '/app';
  }, [location.pathname]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleAccount = useCallback(() => {
    const basePath = getBasePath();
    navigate(`${basePath}/office/account`);
  }, [navigate, getBasePath]);

  const handleAbout = useCallback(() => {
    const basePath = getBasePath();
    navigate(`${basePath}/office/about`);
  }, [navigate, getBasePath]);

  const handleLogoClick = useCallback(() => {
    const basePath = getBasePath();
    // Normalize: remove trailing slash if present
    const normalizedBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
    navigate(normalizedBasePath);
  }, [navigate, getBasePath]);

  // Show loading state while checking authentication (verificar primeiro)
  if (isLoading) {
    return (
      <div className="gmoonc-root">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: 'var(--gmoonc-font-size-base, 16px)',
          color: 'var(--gmoonc-color-text, #333)'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  // Route protection: redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

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
        logoUrl={logoUrl}
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
