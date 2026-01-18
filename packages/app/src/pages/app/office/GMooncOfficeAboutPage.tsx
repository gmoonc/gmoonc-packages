import React from 'react';
import { Info, Code, ExternalLink } from 'lucide-react';

export function GMooncOfficeAboutPage() {
  const version = 'v0.0.4'; // Fixed version string

  return (
    <div className="gmoonc-content-wrapper">
      <div className="gmoonc-content-header">
        <h2>About</h2>
      </div>
      <div className="gmoonc-content-body">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Main About Card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #dbe2ea',
            padding: '32px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '12px',
                backgroundColor: '#6374AD',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: 'bold'
              }}>
                GC
              </div>
              <div>
                <h3 style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#374161',
                  margin: 0,
                  marginBottom: '4px'
                }}>
                  Goalmoon Ctrl
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#6374AD',
                  margin: 0,
                  fontWeight: 500
                }}>
                  (gmoonc)
                </p>
              </div>
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              marginBottom: '24px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                color: '#6374AD',
                fontSize: '14px',
                fontWeight: 500
              }}>
                <Code size={16} />
                Version
              </div>
              <div style={{
                color: '#374161',
                fontSize: '18px',
                fontWeight: 600
              }}>
                {version}
              </div>
            </div>

            <div style={{
              marginTop: '24px',
              paddingTop: '24px',
              borderTop: '1px solid #e9ecef'
            }}>
              <h4 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#374161',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Info size={20} style={{ color: '#6374AD' }} />
                About Goalmoon Ctrl
              </h4>
              <p style={{
                color: '#6374AD',
                fontSize: '14px',
                lineHeight: '1.6',
                marginBottom: '16px'
              }}>
                Goalmoon Ctrl (gmoonc) is a comprehensive dashboard application kit designed to provide
                a complete RBAC (Role-Based Access Control) system with user management, permissions,
                authorizations, and notification management capabilities.
              </p>
              <p style={{
                color: '#6374AD',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                Built with React and React Router, gmoonc offers a flexible and extensible foundation
                for building modern web applications with robust administrative features.
              </p>
            </div>
          </div>

          {/* Links Card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #dbe2ea',
            padding: '32px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
          }}>
            <h4 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#374161',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <ExternalLink size={20} style={{ color: '#6374AD' }} />
              Resources
            </h4>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <a
                href="https://github.com/gmoonc/gmoonc"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#6374AD',
                  textDecoration: 'none',
                  fontSize: '14px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <ExternalLink size={16} />
                GitHub Repository
              </a>
              <a
                href="https://github.com/gmoonc/gmoonc/blob/main/README.md"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#6374AD',
                  textDecoration: 'none',
                  fontSize: '14px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <ExternalLink size={16} />
                Documentation
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
