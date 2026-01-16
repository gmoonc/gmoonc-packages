import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { GmooncShell } from '@gmoonc/ui';
import { defaultGmooncConfig } from '../config/defaultConfig';
import { GMooncSessionProvider, useGMooncSession } from '../session/GMooncSessionContext';

function GMooncAppLayoutInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { roles, user } = useGMooncSession();

  return (
    <GmooncShell
      config={defaultGmooncConfig}
      roles={roles}
      activePath={location.pathname}
      onNavigate={(path) => navigate(path)}
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
