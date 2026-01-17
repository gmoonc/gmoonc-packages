import { useState, useCallback, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { MenuItem as CoreMenuItem } from '@gmoonc/core';
import './styles.css';

/**
 * Generic menu item type compatible with @gmoonc/app.
 * Supports nested submenus, icons, and role-based filtering.
 */
export interface GmooncMenuItem extends CoreMenuItem {
  /** Optional icon (ReactNode) - no default unicode icons */
  icon?: React.ReactNode;
  /** Nested submenu items */
  submenu?: GmooncMenuItem[];
  /** Optional icon for submenu expansion (ReactNode) - defaults to null */
  expandIcon?: React.ReactNode;
  /** Optional icon for submenu collapse (ReactNode) - defaults to null */
  collapseIcon?: React.ReactNode;
}

// Legacy alias for backward compatibility
export type MenuItem = GmooncMenuItem;

export interface GmooncMenuProps {
  /** Array of menu items */
  items: GmooncMenuItem[];
  /** User roles for filtering menu items */
  roles?: string[];
  /** Current active path for highlighting */
  activePath?: string;
  /** Callback when user navigates (used if renderLink is not provided) */
  onNavigate?: (path: string) => void;
  /** Custom link renderer (e.g., for React Router Link, Next.js Link) */
  renderLink?: (args: {
    path: string;
    label: string;
    isActive: boolean;
    onClick?: () => void;
  }) => React.ReactNode;
  /** Whether menu is open (for mobile/tablet) */
  isOpen?: boolean;
  /** Callback to toggle menu open state */
  onToggle?: () => void;
  /** Callback when logo is clicked */
  onLogoClick?: () => void;
  /** Logo image URL */
  logoUrl?: string;
  /** Logo alt text */
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

/**
 * Check if user has access to a menu item based on roles.
 * Items without roles are visible to everyone.
 */
function hasRoleAccess(item: GmooncMenuItem, roles: string[] = []): boolean {
  if (!item.roles || item.roles.length === 0) {
    return true;
  }
  return item.roles.some(role => roles.includes(role));
}

/**
 * Check if a path is active (exact match or parent of activePath).
 * Robust active state: path is active if:
 * - activePath === path (exact match)
 * - activePath starts with path + "/" (child route)
 */
function isPathActive(path: string | undefined, activePath: string | undefined): boolean {
  if (!path || !activePath) {
    return false;
  }
  
  const normalizedPath = normalizePath(path);
  const normalizedActive = normalizePath(activePath);
  
  if (normalizedPath === normalizedActive) {
    return true;
  }
  
  // Check if activePath is a child of path
  if (normalizedActive.startsWith(normalizedPath + '/')) {
    return true;
  }
  
  return false;
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

  const findActiveSubmenu = useCallback((items: GmooncMenuItem[], targetPath: string): string | null => {
    if (!targetPath) {
      return null;
    }

    for (const item of items) {
      if (item.submenu) {
        for (const subItem of item.submenu) {
          const subPath = normalizePath(subItem.path);
          // Check exact match or if targetPath is a child
          if (subPath === targetPath || targetPath.startsWith(subPath + '/')) {
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

  /**
   * Filter menu items recursively by roles.
   * Items without roles are visible to everyone.
   * If a parent item has no path but has visible children, it appears as collapsible.
   */
  const filterMenuItems = useCallback((items: GmooncMenuItem[]): GmooncMenuItem[] => {
    return items
      .filter(item => hasRoleAccess(item, roles))
      .map(item => {
        if (item.submenu) {
          const filteredSubmenu = filterMenuItems(item.submenu);
          // If parent has no path but has visible children, show it as collapsible
          if (filteredSubmenu.length > 0) {
            return { ...item, submenu: filteredSubmenu };
          }
          return null;
        }
        return item;
      })
      .filter((item): item is GmooncMenuItem => item !== null);
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

  const handleMenuItemClick = useCallback((item: GmooncMenuItem) => {
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
      // If renderLink is provided, it handles navigation
      // Otherwise, use onNavigate
      if (onNavigate) {
        onNavigate(item.path);
      }
      if (typeof window !== 'undefined' && window.innerWidth <= 1366 && onToggle && isOpen) {
        onToggle();
      }
    }
  }, [activeSubmenu, onNavigate, onToggle, isOpen]);

  const isSubItemActive = useCallback((subItem: GmooncMenuItem) => {
    if (!subItem.path) {
      return false;
    }

    return isPathActive(subItem.path, normalizedActivePath || activeSubItemPath);
  }, [normalizedActivePath, activeSubItemPath]);

  const renderMenuItem = useCallback((item: GmooncMenuItem) => {
    const hasSubmenu = !!item.submenu && item.submenu.length > 0;
    const isSubmenuOpen = activeSubmenu === item.id;
    const isItemActive = item.path ? isPathActive(item.path, normalizedActivePath) : false;

    const handleItemClick = () => {
      handleMenuItemClick(item);
    };

    // Render main item link/button
    const mainItemContent = item.path && renderLink ? (
      renderLink({
        path: item.path,
        label: item.label,
        isActive: isItemActive,
        onClick: handleItemClick
      })
    ) : (
      <button
        type="button"
        className={`gmoonc-menu-link ${hasSubmenu ? 'has-submenu' : ''} ${isSubmenuOpen ? 'submenu-open' : ''} ${isItemActive ? 'active' : ''}`}
        onClick={handleItemClick}
        disabled={!item.path && !hasSubmenu && !onNavigate}
      >
        {item.icon && <span className="gmoonc-menu-icon">{item.icon}</span>}
        <span className="gmoonc-menu-label">{item.label}</span>
        {hasSubmenu && (
          <span className="gmoonc-submenu-arrow">
            {isSubmenuOpen 
              ? (item.collapseIcon || null)
              : (item.expandIcon || null)
            }
          </span>
        )}
      </button>
    );

    return (
      <li key={item.id} className="gmoonc-menu-item">
        {mainItemContent}
        {hasSubmenu && isSubmenuOpen && (
          <ul className="gmoonc-submenu">
            {item.submenu!.map((subItem) => {
              const isSubActive = isSubItemActive(subItem);

              const handleSubItemClick = () => {
                if (subItem.path) {
                  if (renderLink) {
                    // renderLink handles navigation
                  } else if (onNavigate) {
                    onNavigate(subItem.path);
                  }
                }
                if (typeof window !== 'undefined' && window.innerWidth <= 1366 && onToggle && isOpen) {
                  onToggle();
                }
              };

              const linkContent = renderLink && subItem.path ? renderLink({
                path: subItem.path,
                label: subItem.label,
                isActive: isSubActive,
                onClick: handleSubItemClick
              }) : (
                <button
                  type="button"
                  className={`gmoonc-submenu-link ${isSubActive ? 'active' : ''}`}
                  onClick={handleSubItemClick}
                  disabled={!subItem.path && !onNavigate}
                >
                  {subItem.icon && <span className="gmoonc-menu-icon">{subItem.icon}</span>}
                  <span>{subItem.label}</span>
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
    normalizedActivePath,
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
