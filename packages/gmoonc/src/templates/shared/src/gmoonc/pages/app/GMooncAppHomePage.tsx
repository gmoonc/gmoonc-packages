import React from 'react';
import { useGMooncSession } from '../../session/GMooncSessionContext';

export function GMooncAppHomePage() {
  const { user } = useGMooncSession();

  return (
    <div className="gmoonc-welcome-content">
      <h2>Welcome to Goalmoon Ctrl</h2>
      <p>Select a module from the menu on the left to get started.</p>
      
      {user && (
        <div style={{ 
          backgroundColor: '#e0f2fe', 
          padding: '16px', 
          borderRadius: '8px', 
          marginTop: '16px',
          textAlign: 'left',
          maxWidth: '600px',
          margin: '16px auto 0'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1e40af', 
            marginBottom: '8px',
            margin: '0 0 8px 0'
          }}>
            👤 User: {user.name}
          </h3>
          <p style={{ color: '#1e3a8a', margin: 0 }}>
            You are logged in as <strong>{user.role}</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
