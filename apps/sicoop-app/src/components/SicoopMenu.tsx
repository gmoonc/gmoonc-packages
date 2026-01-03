'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';

interface MenuItem {
  id: string;
  label: string;
  href?: string;
  target?: string;
  submenu?: MenuItem[];
  module?: string; // Novo: módulo específico necessário
  permissionType?: 'access' | 'create' | 'read' | 'update' | 'delete'; // Novo: tipo de permissão
}

interface SicoopMenuProps {
  onMenuItemClick?: (item: MenuItem) => void;
  onLogoutRequest?: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
  onLogoClick?: () => void;
}

export default function SicoopMenu({ onMenuItemClick, onLogoutRequest, isOpen = true, onToggle, onLogoClick }: SicoopMenuProps) {
  // onLogoutRequest está na interface mas não é usado neste componente
  // Mantido para compatibilidade com componentes que podem passar esta prop
  void onLogoutRequest;
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isOverlayMode, setIsOverlayMode] = useState(false);
  const [activeSubItemPath, setActiveSubItemPath] = useState<string>('');
  const [lastManualSubmenuSelection, setLastManualSubmenuSelection] = useState<string | null>(null);
  const [wasManuallyClosed, setWasManuallyClosed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();

  const normalizePath = useCallback((path?: string | null) => {
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
  }, []);

  const normalizedPathname = useMemo(() => normalizePath(pathname), [pathname, normalizePath]);

  useEffect(() => {
    setWasManuallyClosed(false);
  }, [normalizedPathname]);

  // Encontrar qual submenu contém a rota ativa
  const findActiveSubmenu = useCallback((items: MenuItem[], targetPath: string): string | null => {
    if (!targetPath) {
      return null;
    }

    for (const item of items) {
      if (item.submenu) {
        for (const subItem of item.submenu) {
          if (normalizePath(subItem.href) === targetPath) {
            return item.id;
          }
        }
      }
    }
    return null;
  }, [normalizePath]);

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

    window.addEventListener('resize', updateOverlayMode);

    return () => {
      window.removeEventListener('resize', updateOverlayMode);
    };
  }, [isClient]);

  useEffect(() => {
    if (!isClient || !isOverlayMode) {
      return;
    }

    if (isOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isClient, isOverlayMode, isOpen]);

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

    router.push('/');
  }, [isOpen, onLogoClick, onToggle, router]);

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

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleCloseMenu, isClient, isOverlayMode, isOpen]);

  // Fechar menu ao clicar em item no mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1366 && onToggle && !isOpen) {
        onToggle();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, onToggle]);

  // Função para verificar se o usuário tem acesso a um item do menu
  const hasAccess = useCallback((item: MenuItem): boolean => {
    // Se não há restrição de módulo, todos podem acessar
    if (!item.module) {
      return true;
    }

    // Se não há usuário logado, negar acesso
    if (!user) {
      return false;
    }

    // Verificar permissão específica do módulo
    return hasPermission({
      moduleName: item.module,
      permissionType: item.permissionType || 'access'
    });
  }, [user, hasPermission]);

  // Função para filtrar itens do menu baseado nas permissões do usuário
  const filterMenuItems = useCallback((items: MenuItem[]): MenuItem[] => {
    return items
      .filter(item => hasAccess(item))
      .map(item => {
        if (item.submenu) {
          const filteredSubmenu = filterMenuItems(item.submenu);
          // Só incluir o item se tiver submenu visível
          if (filteredSubmenu.length > 0) {
            return { ...item, submenu: filteredSubmenu };
          }
          return null;
        }
        return item;
      })
      .filter((item): item is MenuItem => item !== null);
  }, [hasAccess]);

  // Memoizar o menu data para evitar re-criação a cada render
  const menuData: MenuItem[] = useMemo(() => [
    {
      id: 'administrativo',
      label: 'Administrativo',
      module: 'administrativo',
      permissionType: 'access',
      submenu: [
        { id: 'usuarios', label: 'Usuários', href: '/admin/usuarios', module: 'administrativo', permissionType: 'read' },
        { id: 'permissoes', label: 'Permissões', href: '/admin/permissoes', module: 'administrativo', permissionType: 'read' },
        { id: 'autorizacoes', label: 'Gerenciamento de Autorizações', href: '/admin/autorizacoes', module: 'administrativo', permissionType: 'read' },
        { id: 'notificacoes', label: 'Gerenciamento de Notificações', href: '/admin/notificacoes', module: 'administrativo', permissionType: 'read' }
      ]
    },
    {
      id: 'financeiro',
      label: 'Financeiro',
      module: 'financeiro',
      permissionType: 'access',
      submenu: [
        { id: 'cambios', label: 'Câmbios', href: '/financeiro/cambios', module: 'financeiro', permissionType: 'read' },
        { id: 'clientes', label: 'Clientes', href: '/financeiro/clientes', module: 'financeiro', permissionType: 'read' },
        { id: 'contas', label: 'Contas', href: '/financeiro/contas', module: 'financeiro', permissionType: 'read' },
        { id: 'localidades', label: 'Localidades', href: '/financeiro/localidades', module: 'financeiro', permissionType: 'read' },
        { id: 'moedas', label: 'Moedas', href: '/financeiro/moedas', module: 'financeiro', permissionType: 'read' },
        { id: 'pessoas', label: 'Pessoas', href: '/financeiro/pessoas', module: 'financeiro', permissionType: 'read' },
        { id: 'telefones', label: 'Telefones', href: '/financeiro/telefones', module: 'financeiro', permissionType: 'read' }
      ]
    },
    {
      id: 'helpdesk',
      label: 'Help-Desk',
      module: 'helpdesk',
      permissionType: 'access',
      submenu: [
        { id: 'ocorrencias', label: 'Ocorrências', href: '/helpdesk/ocorrencias', module: 'helpdesk', permissionType: 'read' },
        { id: 'problemas', label: 'Problemas', href: '/helpdesk/problemas', module: 'helpdesk', permissionType: 'read' }
      ]
    },
    {
      id: 'secretaria',
      label: 'Secretaria',
      module: 'secretaria',
      permissionType: 'access',
      submenu: [
        { id: 'localidades-sec', label: 'Localidades', href: '/secretaria/localidades', module: 'secretaria', permissionType: 'read' },
        { id: 'pessoas-sec', label: 'Pessoas', href: '/secretaria/pessoas', module: 'secretaria', permissionType: 'read' },
        { id: 'telefones-sec', label: 'Telefones', href: '/secretaria/telefones', module: 'secretaria', permissionType: 'read' },
        { id: 'emails', label: 'E-mails', href: '/secretaria/emails', module: 'secretaria', permissionType: 'read' },
        { id: 'clientes-sec', label: 'Clientes', href: '/secretaria/clientes', module: 'secretaria', permissionType: 'read' },
        { id: 'contas-sec', label: 'Contas', href: '/secretaria/contas', module: 'secretaria', permissionType: 'read' },
        { id: 'notificacoes', label: 'Notificações', href: '/secretaria/notificacoes', module: 'secretaria', permissionType: 'read' }
      ]
    },
    {
      id: 'tecnico',
      label: 'Técnico',
      module: 'tecnico',
      permissionType: 'access',
      submenu: [
        { id: 'analises-tecnicas', label: 'Análises', href: '/tecnico/analises', module: 'tecnico', permissionType: 'read' },
        { id: 'mensagens-tecnicas', label: 'Mensagens', href: '/tecnico/mensagens', module: 'tecnico', permissionType: 'read' },
        { id: 'equipamentos', label: 'Equipamentos', href: '/tecnico/equipamentos', module: 'tecnico', permissionType: 'read' }
      ]
    },
    {
      id: 'vendas',
      label: 'Vendas',
      module: 'vendas',
      permissionType: 'access',
      submenu: [
        { id: 'propostas', label: 'Propostas', href: '/vendas/propostas', module: 'vendas', permissionType: 'read' },
        { id: 'contratos', label: 'Contratos', href: '/vendas/contratos', module: 'vendas', permissionType: 'read' },
        { id: 'clientes-vendas', label: 'Clientes', href: '/vendas/clientes', module: 'vendas', permissionType: 'read' }
      ]
    },
    {
      id: 'cliente',
      label: 'Cliente',
      module: 'cliente',
      permissionType: 'access',
      submenu: [
        { id: 'analises-cliente', label: 'Análises', href: '/cliente/analises', module: 'cliente', permissionType: 'read' },
        { id: 'mensagens', label: 'Mensagens', href: '/cliente/mensagens', module: 'cliente', permissionType: 'read' }
      ]
    }
  ], []);

  // Filtrar menu baseado nas permissões do usuário
  const filteredMenuData = useMemo(() => {
    return filterMenuItems(menuData);
  }, [menuData, filterMenuItems]);

  const subItems = useMemo(() => {
    return filteredMenuData.flatMap(item => item.submenu?.filter(subItem => !!subItem.href) ?? []);
  }, [filteredMenuData]);

  useEffect(() => {
    if (!normalizedPathname) {
      return;
    }

    const hasMatch = subItems.some(subItem => normalizePath(subItem.href) === normalizedPathname);

    if (hasMatch) {
      setActiveSubItemPath(normalizedPathname);
    }
  }, [normalizedPathname, normalizePath, subItems]);

  useEffect(() => {
    if (!activeSubItemPath) {
      return;
    }

    const stillExists = subItems.some(subItem => normalizePath(subItem.href) === activeSubItemPath);

    if (!stillExists) {
      setActiveSubItemPath('');
    }
  }, [activeSubItemPath, normalizePath, subItems]);

  // Abrir automaticamente o submenu que contém a rota ativa
  useEffect(() => {
    const referencePath = activeSubItemPath || normalizedPathname;
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
    normalizedPathname,
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
    } else if (onMenuItemClick) {
      onMenuItemClick(item);
      // Fechar menu em mobile após clicar
      if (window.innerWidth <= 1366 && onToggle && isOpen) {
        onToggle();
      }
    }
  }, [activeSubmenu, onMenuItemClick, onToggle, isOpen]);

  const isSubItemActive = useCallback((subItem: MenuItem) => {
    if (!subItem.href) {
      return false;
    }

    const normalizedHref = normalizePath(subItem.href);

    if (!normalizedHref) {
      return false;
    }

    return activeSubItemPath === normalizedHref;
  }, [activeSubItemPath, normalizePath]);

  const renderMenuItem = useCallback((item: MenuItem) => (
    <li key={item.id} className="menu-item">
      <div
        className={`menu-link ${item.submenu ? 'has-submenu' : ''} ${
          activeSubmenu === item.id ? 'active' : ''
        }`}
        onClick={() => handleMenuItemClick(item)}
      >
        {item.label}
        {item.submenu && (
          <span className="submenu-arrow">
            {activeSubmenu === item.id ? (
              <ChevronDown size={16} strokeWidth={2.5} />
            ) : (
              <ChevronRight size={16} strokeWidth={2.5} />
            )}
          </span>
        )}
      </div>
      {item.submenu && activeSubmenu === item.id && (
        <ul className="submenu">
          {item.submenu.map((subItem) => (
            <li key={subItem.id} className="submenu-item">
              <a
                href={subItem.href}
                target={subItem.target || '_self'}
                className={`submenu-link ${isSubItemActive(subItem) ? 'active' : ''}`.trim()}
                onClick={(e) => {
                  const normalizedHref = normalizePath(subItem.href);
                  const isAlreadyActive = subItem.href ? isSubItemActive(subItem) : false;

                  if (onMenuItemClick) {
                    e.preventDefault();
                    onMenuItemClick(subItem);
                  }

                  if (isAlreadyActive) {
                    setActiveSubItemPath('');
                    setActiveSubmenu(null);
                    setWasManuallyClosed(true);
                  } else if (normalizedHref) {
                    setActiveSubItemPath(normalizedHref);
                    setWasManuallyClosed(false);
                  }

                  if (onToggle && typeof window !== 'undefined' && window.innerWidth <= 1366 && isOpen) {
                    onToggle();
                  }
                }}
              >
                {subItem.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  ), [
    activeSubmenu,
    handleMenuItemClick,
    isOpen,
    isSubItemActive,
    normalizePath,
    onMenuItemClick,
    onToggle
  ]);

  const menuContent = (
    <div className={`sicoop-menu ${isOpen ? 'menu-open' : 'menu-closed'}`}>
      <div className="menu-header">
        <div className="menu-logo-container">
          <Link href="/" prefetch={false} onClick={handleLogoClick} className="menu-logo-link">
            <img
              src="/logo.png"
              alt="Logo Goalmoon - Sicoop"
              width={180}
              height={51}
              className="menu-logo"
            />
          </Link>
        </div>
      </div>
      <ul className="menu-list">
        {filteredMenuData.map(renderMenuItem)}
      </ul>
    </div>
  );

  if (!isClient) {
    return menuContent;
  }

  if (isOverlayMode) {
    const menuStructure = (
      <>
        <div
          className={`menu-backdrop ${isOpen ? 'active' : ''}`}
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
