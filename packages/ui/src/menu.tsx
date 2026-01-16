import { useState, useCallback, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { MenuItem as CoreMenuItem } from '@gmoonc/core';
import './styles.css';

export interface MenuItem extends CoreMenuItem {
  submenu?: MenuItem[];
}

export interface GmooncMenuProps {
  items: MenuItem[];
  roles?: string[];
  activePath?: string;
  onNavigate?: (path: string) => void;
  renderLink?: (args: {
    path: string;
    label: string;
    isActive: boolean;
    onClick?: () => void;
  }) => React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  onLogoClick?: () => void;
  logoUrl?: string;
  logoAlt?: string;
}

function normalizePath(path?: string | null): string {
  if (!path) {
    return '';
  }

  let cleanPath = path;

  try {
    const url = new URL(path, 'http://localhost');
    cleanPath = url.pathname;
  } catch {
    const queryIndex = cleanPath.indexOf('?');
    const hashIndex = cleanPath.indexOf('#');
    const cutIndex = [queryIndex, hashIndex]
      .filter(index => index >= 0)
      .reduce((min, index) => (index < min ? index : min), cleanPath.length);

    cleanPath = cleanPath.slice(0, cutIndex);
  }

  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }

  return cleanPath;
}

function hasRoleAccess(item: MenuItem, roles: string[] = []): boolean {
  if (!item.roles || item.roles.length === 0) {
    return true;
  }
  return item.roles.some(role => roles.includes(role));
}

export function GmooncMenu({
  items,
  roles = [],
  activePath,
  onNavigate,
  renderLink,
  isOpen = true,
  onToggle,
  onLogoClick,
  logoUrl,
  logoAlt = 'Logo'
}: GmooncMenuProps) {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isOverlayMode, setIsOverlayMode] = useState(false);
  const [activeSubItemPath, setActiveSubItemPath] = useState<string>('');
  const [lastManualSubmenuSelection, setLastManualSubmenuSelection] = useState<string | null>(null);
  const [wasManuallyClosed, setWasManuallyClosed] = useState(false);

  const normalizedActivePath = useMemo(() => normalizePath(activePath), [activePath]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) {
      return;
    }

    const updateOverlayMode = () => {
      if (typeof window !== 'undefined') {
        setIsOverlayMode(window.innerWidth <= 1366);
      }
    };

    updateOverlayMode();

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateOverlayMode);
      return () => {
        window.removeEventListener('resize', updateOverlayMode);
      };
    }
  }, [isClient]);

  useEffect(() => {
    if (!isClient || !isOverlayMode) {
      return;
    }

    if (isOpen && typeof document !== 'undefined') {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isClient, isOverlayMode, isOpen]);

  useEffect(() => {
    setWasManuallyClosed(false);
  }, [normalizedActivePath]);

  const findActiveSubmenu = useCallback((items: MenuItem[], targetPath: string): string | null => {
    if (!targetPath) {
      return null;
    }

    for (const item of items) {
      if (item.submenu) {
        for (const subItem of item.submenu) {
          if (normalizePath(subItem.path) === targetPath) {
            return item.id;
          }
        }
      }
    }
    return null;
  }, []);

  const handleCloseMenu = useCallback(() => {
    if (isOpen && onToggle) {
      onToggle();
    }
  }, [isOpen, onToggle]);

  const handleLogoClick = useCallback(() => {
    setActiveSubmenu(null);
    setWasManuallyClosed(true);

    if (onLogoClick) {
      onLogoClick();
    }

    if (typeof window !== 'undefined' && onToggle && isOpen && window.innerWidth <= 1366) {
      onToggle();
    }

    if (onNavigate) {
      onNavigate('/');
    }
  }, [isOpen, onLogoClick, onToggle, onNavigate]);

  useEffect(() => {
    if (!isClient || !isOverlayMode || !isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleCloseMenu();
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleCloseMenu, isClient, isOverlayMode, isOpen]);

  useEffect(() => {
    if (!isClient) {
      return;
    }

    const handleResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth > 1366 && onToggle && !isOpen) {
        onToggle();
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isOpen, onToggle, isClient]);

  const filterMenuItems = useCallback((items: MenuItem[]): MenuItem[] => {
    return items
      .filter(item => hasRoleAccess(item, roles))
      .map(item => {
        if (item.submenu) {
          const filteredSubmenu = filterMenuItems(item.submenu);
          if (filteredSubmenu.length > 0) {
            return { ...item, submenu: filteredSubmenu };
          }
          return null;
        }
        return item;
      })
      .filter((item): item is MenuItem => item !== null);
  }, [roles]);

  const filteredMenuData = useMemo(() => {
    return filterMenuItems(items);
  }, [items, filterMenuItems]);

  const subItems = useMemo(() => {
    return filteredMenuData.flatMap(item => item.submenu?.filter(subItem => !!subItem.path) ?? []);
  }, [filteredMenuData]);

  useEffect(() => {
    if (!normalizedActivePath) {
      return;
    }

    const hasMatch = subItems.some(subItem => normalizePath(subItem.path) === normalizedActivePath);

    if (hasMatch) {
      setActiveSubItemPath(normalizedActivePath);
    }
  }, [normalizedActivePath, subItems]);

  useEffect(() => {
    if (!activeSubItemPath) {
      return;
    }

    const stillExists = subItems.some(subItem => normalizePath(subItem.path) === activeSubItemPath);

    if (!stillExists) {
      setActiveSubItemPath('');
    }
  }, [activeSubItemPath, subItems]);

  useEffect(() => {
    const referencePath = activeSubItemPath || normalizedActivePath;
    if (!referencePath) {
      return;
    }

    if (wasManuallyClosed) {
      return;
    }

    const activeMenu = findActiveSubmenu(filteredMenuData, referencePath);
    if (!activeMenu) {
      return;
    }

    if (
      lastManualSubmenuSelection &&
      activeSubmenu === lastManualSubmenuSelection &&
      lastManualSubmenuSelection !== activeMenu
    ) {
      return;
    }

    setActiveSubmenu(prev => (prev === activeMenu ? prev : activeMenu));
    setLastManualSubmenuSelection(null);
  }, [
    activeSubItemPath,
    activeSubmenu,
    filteredMenuData,
    findActiveSubmenu,
    lastManualSubmenuSelection,
    normalizedActivePath,
    wasManuallyClosed
  ]);

  const handleMenuItemClick = useCallback((item: MenuItem) => {
    if (item.submenu) {
      const nextSubmenu = activeSubmenu === item.id ? null : item.id;
      setActiveSubmenu(nextSubmenu);
      setLastManualSubmenuSelection(nextSubmenu);
      if (nextSubmenu === null) {
        setActiveSubItemPath('');
        setWasManuallyClosed(true);
      } else {
        setWasManuallyClosed(false);
      }
    } else if (item.path) {
      if (onNavigate) {
        onNavigate(item.path);
      }
      if (typeof window !== 'undefined' && window.innerWidth <= 1366 && onToggle && isOpen) {
        onToggle();
      }
    }
  }, [activeSubmenu, onNavigate, onToggle, isOpen]);

  const isSubItemActive = useCallback((subItem: MenuItem) => {
    if (!subItem.path) {
      return false;
    }

    const normalizedPath = normalizePath(subItem.path);
    if (!normalizedPath) {
      return false;
    }

    return activeSubItemPath === normalizedPath || normalizedActivePath === normalizedPath;
  }, [activeSubItemPath, normalizedActivePath]);

  const renderMenuItem = useCallback((item: MenuItem) => {
    const hasSubmenu = !!item.submenu && item.submenu.length > 0;
    const isActive = activeSubmenu === item.id;

    return (
      <li key={item.id} className="gmoonc-menu-item">
        <button
          type="button"
          className={`gmoonc-menu-link ${hasSubmenu ? 'has-submenu' : ''} ${isActive ? 'active' : ''}`}
          onClick={() => handleMenuItemClick(item)}
        >
          {item.label}
          {hasSubmenu && (
            <span className="gmoonc-submenu-arrow">
              {isActive ? '▼' : '▶'}
            </span>
          )}
        </button>
        {hasSubmenu && isActive && (
          <ul className="gmoonc-submenu">
            {item.submenu!.map((subItem) => {
              const isSubActive = isSubItemActive(subItem);
              const normalizedSubPath = normalizePath(subItem.path);

              const handleSubItemClick = () => {
                if (onNavigate && subItem.path) {
                  onNavigate(subItem.path);
                }
                if (typeof window !== 'undefined' && window.innerWidth <= 1366 && onToggle && isOpen) {
                  onToggle();
                }
              };

              const linkContent = renderLink ? renderLink({
                path: subItem.path || '',
                label: subItem.label,
                isActive: isSubActive,
                onClick: handleSubItemClick
              }) : (
                <button
                  type="button"
                  className={`gmoonc-submenu-link ${isSubActive ? 'active' : ''}`}
                  onClick={handleSubItemClick}
                >
                  {subItem.label}
                </button>
              );

              return (
                <li key={subItem.id} className="gmoonc-submenu-item">
                  {linkContent}
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  }, [
    activeSubmenu,
    handleMenuItemClick,
    isOpen,
    isSubItemActive,
    onNavigate,
    onToggle,
    renderLink
  ]);

  const menuContent = (
    <div className={`gmoonc-menu ${isOpen ? 'menu-open' : 'menu-closed'}`}>
      {(logoUrl || onLogoClick) && (
        <div className="gmoonc-menu-header">
          <div className="gmoonc-menu-logo-container">
            {renderLink ? (
              renderLink({
                path: '/',
                label: logoAlt,
                isActive: false,
                onClick: handleLogoClick
              })
            ) : (
              <button
                type="button"
                className="gmoonc-menu-logo-link"
                onClick={handleLogoClick}
              >
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt={logoAlt}
                    className="gmoonc-menu-logo"
                  />
                )}
                {!logoUrl && <span>{logoAlt}</span>}
              </button>
            )}
          </div>
        </div>
      )}
      <ul className="gmoonc-menu-list">
        {filteredMenuData.map(renderMenuItem)}
      </ul>
    </div>
  );

  if (!isClient) {
    return menuContent;
  }

  if (isOverlayMode && typeof document !== 'undefined') {
    const menuStructure = (
      <>
        <div
          className={`gmoonc-menu-backdrop ${isOpen ? 'active' : ''}`}
          onClick={handleCloseMenu}
          aria-hidden="true"
        />
        {menuContent}
      </>
    );

    return createPortal(menuStructure, document.body);
  }

  return menuContent;
}
