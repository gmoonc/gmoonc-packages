import React from 'react';
import { useGMooncSession } from '../../../session/GMooncSessionContext';
import { User, Mail, Calendar } from 'lucide-react';

export function GMooncOfficeAccountPage() {
  const { user } = useGMooncSession();

  return (
    <div className="gmoonc-content-wrapper">
      <div className="gmoonc-content-header">
        <h2>Account</h2>
      </div>
      <div className="gmoonc-content-body">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Profile Card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #dbe2ea',
            padding: '32px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: 'var(--gmoonc-color-text-primary, #374161)',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontFamily: 'var(--gmoonc-font-family)'
            }}>
              <User size={24} style={{ color: 'var(--gmoonc-color-primary-2, #6374AD)' }} />
              Profile Information
            </h3>

            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#6374AD',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}>
                    {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : user.email.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: 'var(--gmoonc-color-text-primary, #374161)',
                    marginBottom: '4px',
                    fontFamily: 'var(--gmoonc-font-family)'
                  }}>
                    {user.name || 'No name'}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: 'var(--gmoonc-color-primary-2, #6374AD)',
                    fontFamily: 'var(--gmoonc-font-family)'
                  }}>
                    {user.email}
                  </div>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '16px'
                }}>
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                      color: '#6374AD',
                      fontSize: '14px'
                    }}>
                      <Mail size={16} />
                      <span style={{ fontWeight: 500 }}>Email</span>
                    </div>
                    <div style={{ color: 'var(--gmoonc-color-text-primary, #374161)', fontSize: '16px', fontFamily: 'var(--gmoonc-font-family)' }}>
                      {user.email}
                    </div>
                  </div>

                  <div style={{
                    padding: '16px',
                    backgroundColor: 'var(--gmoonc-color-surface-light, #f8f9fa)',
                    borderRadius: '8px',
                    border: '1px solid var(--gmoonc-color-border-light, #e9ecef)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                      color: 'var(--gmoonc-color-primary-2, #6374AD)',
                      fontSize: '14px',
                      fontFamily: 'var(--gmoonc-font-family)'
                    }}>
                      <User size={16} />
                      <span style={{ fontWeight: 500 }}>Role</span>
                    </div>
                    <div style={{ color: 'var(--gmoonc-color-text-primary, #374161)', fontSize: '16px', fontFamily: 'var(--gmoonc-font-family)' }}>
                      {user.role || 'No role assigned'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                padding: '24px',
                textAlign: 'center',
                color: '#6374AD'
              }}>
                <p>No user information available.</p>
              </div>
            )}
          </div>

          {/* Placeholder for future features */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #dbe2ea',
            padding: '32px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: 'var(--gmoonc-color-text-primary, #374161)',
              marginBottom: '16px',
              fontFamily: 'var(--gmoonc-font-family)'
            }}>
              Account Settings
            </h3>
            <p style={{
              color: 'var(--gmoonc-color-primary-2, #6374AD)',
              fontSize: '14px',
              lineHeight: '1.6',
              fontFamily: 'var(--gmoonc-font-family)'
            }}>
              Additional account settings and preferences will be available here in a future update.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
