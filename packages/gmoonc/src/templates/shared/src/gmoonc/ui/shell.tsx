import { useState, useEffect, useCallback } from 'react';
import type { GmooncConfig } from '../core/types';
import { GmooncHeader } from './header';
import { GmooncSidebar } from './sidebar';
import { GmooncMenu, type GmooncMenuItem } from './menu';
import './styles.css';

export interface GmooncShellProps {
  config: GmooncConfig;
  roles?: string[];
  activePath?: string;
  onNavigate?: (path: string) => void;
  renderLink?: (args: {
    path: string;
    label: string;
    isActive: boolean;
    onClick?: () => void;
  }) => React.ReactNode;
  children?: React.ReactNode;
  headerRight?: React.ReactNode;
  logoUrl?: string;
  logoAlt?: string;
  titleMobile?: string;
}

export function GmooncShell({
  config,
  roles = [],
  activePath,
  onNavigate,
  renderLink,
  children,
  headerRight,
  logoUrl,
  logoAlt,
  titleMobile
}: GmooncShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) {
      return;
    }

    const handleResize = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth > 1366) {
          setMenuOpen(true);
        } else {
          setMenuOpen(false);
        }
      }
    };
    
    handleResize();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isClient]);

  const handleToggleMenu = useCallback(() => {
    setMenuOpen(prev => !prev);
  }, []);

  const handleLogoClick = useCallback(() => {
    if (onNavigate) {
      // Navigate to basePath (default /app)
      const basePath = config.menu && Array.isArray(config.menu) && config.menu.length > 0
        ? (config.menu[0] as any).path?.replace(/\/[^/]+$/, '') || '/app'
        : '/app';
      onNavigate(basePath);
    }
  }, [onNavigate, config]);

  const handleMenuNavigate = useCallback((path: string) => {
    if (onNavigate) {
      onNavigate(path);
    }
  }, [onNavigate]);

  return (
    <div className="gmoonc-shell">
      {isClient && (
        <button
          type="button"
          className={`gmoonc-menu-hamburger ${menuOpen ? 'open' : ''}`}
          onClick={handleToggleMenu}
          aria-label="Toggle menu"
        >
          <span className="gmoonc-hamburger-line"></span>
          <span className="gmoonc-hamburger-line"></span>
          <span className="gmoonc-hamburger-line"></span>
        </button>
      )}

      <GmooncHeader
        title={config.appName}
        titleMobile={titleMobile}
      >
        {headerRight}
      </GmooncHeader>

      <div className="gmoonc-content">
        <GmooncSidebar isOpen={menuOpen}>
          <GmooncMenu
            items={config.menu as GmooncMenuItem[]}
            roles={roles}
            activePath={activePath}
            onNavigate={handleMenuNavigate}
            renderLink={renderLink}
            isOpen={menuOpen}
            onToggle={handleToggleMenu}
            onLogoClick={handleLogoClick}
            logoUrl={logoUrl}
            logoAlt={logoAlt || config.appName}
          />
        </GmooncSidebar>

        <main className="gmoonc-main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
