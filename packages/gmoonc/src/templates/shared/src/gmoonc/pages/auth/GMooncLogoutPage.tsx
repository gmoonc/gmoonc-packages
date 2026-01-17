import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useGMooncSession } from '../../session/GMooncSessionContext';

export function GMooncLogoutPage() {
  const { logout } = useGMooncSession();

  useEffect(() => {
    logout();
  }, [logout]);

  return <Navigate to="/login" replace />;
}
