'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import SicoopMenu from './SicoopMenu';
import UserProfile from './UserProfile';
import UserManagement from './UserManagement';
import UserEdit from './UserEdit';
import SicoopAbout from './SicoopAbout';
import PermissionsManager from './PermissionsManager';
import AuthorizationsManager from './AuthorizationsManager';
import NotificationsManager from './NotificationsManager';
import AnalisesManager from './AnalisesManager';
import AnalisesTecnicasManager from './AnalisesTecnicasManager';
import MensagensTecnicasManager from './MensagensTecnicasManager';
import MensagensManager from './MensagensManager';
import { useAuth } from '@/contexts/AuthContext';

interface MenuItem {
  id: string;
  label: string;
  href?: string;
  target?: string;
  submenu?: MenuItem[];
}

interface ContentConfig {
  title: string;
  component: React.ReactNode;
}

export default function SicoopDashboard() {
  const [currentContent, setCurrentContent] = useState<ContentConfig | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // Inicia fechado
  const { user, logout } = useAuth();

  // Ajustar estado do menu baseado no tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1366) {
        setMenuOpen(true); // Desktop: menu sempre aberto
      } else {
        setMenuOpen(false); // Mobile/Tablet: menu fechado
      }
    };
    
    handleResize(); // Executar ao montar
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Memoizar a função de callback para evitar re-renderizações desnecessárias
  const handleMenuItemClick = useCallback((item: MenuItem) => {
    if (item.id === 'usuarios') {
      setCurrentContent({
        title: 'Gerenciamento de Usuários',
        component: <UserManagement />
      });
    } else if (item.id === 'analises-tecnicas') {
      setCurrentContent({
        title: '🔧 Gerenciamento Técnico de Análises',
        component: <AnalisesTecnicasManager />
      });
    } else if (item.id === 'mensagens-tecnicas') {
      setCurrentContent({
        title: '🔧 Gerenciamento Técnico de Mensagens',
        component: <MensagensTecnicasManager />
      });
    } else if (item.id === 'analises-cliente') {
      setCurrentContent({
        title: 'Análises de Cobertura',
        component: <AnalisesManager />
      });
    } else if (item.id === 'mensagens') {
      setCurrentContent({
        title: 'Mensagens',
        component: <MensagensManager />
      });
    } else if (item.id === 'permissoes') {
      setCurrentContent({
        title: 'Gerenciamento de Permissões',
        component: <PermissionsManager />
      });
    } else if (item.id === 'autorizacoes') {
      setCurrentContent({
        title: 'Gerenciamento de Autorizações',
        component: <AuthorizationsManager />
      });
    } else if (item.id === 'notificacoes') {
      setCurrentContent({
        title: 'Gerenciamento de Notificações',
        component: <NotificationsManager />
      });
    } else if (item.id === 'perfil-usuario') {
      setCurrentContent({
        title: 'Meu Perfil',
        component: <UserProfile />
      });
    } else if (item.id === 'gerenciar-conta') {
      if (user) {
        setCurrentContent({
          title: 'Gerenciar Minha Conta',
          component: (
            <UserEdit 
              user={user} 
              onBack={() => setCurrentContent(null)}
              onUserUpdated={() => {
                setCurrentContent(null);
                // Recarregar dados do usuário se necessário
              }}
            />
          )
        });
      }
    } else if (item.id === 'sobre') {
      setCurrentContent({
        title: 'Sobre o Sicoop',
        component: <SicoopAbout />
      });
    } else if (item.href && (item.target === 'direito' || !item.submenu)) {
      // Lógica unificada para itens que renderizam no painel direito
      setCurrentContent({
        title: item.label,
        component: (
          <div className="content-panel">
            <h2>{item.label}</h2>
            <p>Conteúdo do módulo {item.label} será carregado aqui.</p>
            <p>Esta é uma implementação do sistema Sicoop da Goalmoon.</p>
          </div>
        )
      });
    }
  }, [user]);

  const handleLogoutRequest = useCallback(() => {
    setShowLogoutConfirm(true);
  }, []);

  const handleLogoutConfirm = useCallback(async () => {
    try {
      setShowLogoutConfirm(false);
      console.log('🔍 SicoopDashboard: Iniciando logout...');
      
      // Fallback robusto: sempre redirecionar após 2 segundos
      const fallbackTimeout = setTimeout(() => {
        console.log('🔍 SicoopDashboard: Fallback ativado - redirecionando...');
        window.location.href = '/auth/login';
      }, 2000);
      
      // Tentar usar a função do contexto
      if (typeof logout === 'function') {
        try {
          console.log('🔍 SicoopDashboard: Tentando logout do contexto...');
          await logout();
          clearTimeout(fallbackTimeout);
          console.log('🔍 SicoopDashboard: Logout do contexto executado com sucesso');
        } catch (logoutError) {
          clearTimeout(fallbackTimeout);
          console.error('❌ SicoopDashboard: Erro no logout do contexto:', logoutError);
          // Fallback imediato em caso de erro
          window.location.href = '/auth/login';
        }
      } else {
        clearTimeout(fallbackTimeout);
        console.error('❌ SicoopDashboard: Função logout não disponível');
        // Fallback imediato
        window.location.href = '/auth/login';
      }
    } catch (error) {
      console.error('❌ SicoopDashboard: Erro geral:', error);
      // Fallback imediato
      window.location.href = '/auth/login';
    }
  }, [logout]);

  const handleCancelLogout = useCallback(() => {
    setShowLogoutConfirm(false);
  }, []);

  const openAccount = useCallback(() => {
    if (!user) {
      return;
    }

    setCurrentContent({
      title: 'Gerenciar Minha Conta',
      component: (
        <UserEdit
          user={user}
          onBack={() => setCurrentContent(null)}
          onUserUpdated={() => {
            setCurrentContent(null);
          }}
        />
      )
    });
  }, [user]);

  const openAbout = useCallback(() => {
    setCurrentContent({
      title: 'Sobre o Sicoop',
      component: <SicoopAbout />
    });
  }, []);

  // Memoizar o conteúdo de boas-vindas para evitar re-criação
  const welcomeContent = useMemo(() => (
    <div className="welcome-content">
      <h2>Bem-vindo ao Sicoop</h2>
      <p>Selecione um módulo no menu à esquerda para começar.</p>
      
      {/* Mostrar informações do usuário */}
      {user && (
        <div className="role-info bg-blue-50 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            👤 Usuário: {user.name}
          </h3>
          <p className="text-blue-700">
            Você está logado como <strong>{user.role}</strong>.
          </p>
        </div>
      )}
    </div>
  ), [user]);

  return (
    <>
      <div className="sicoop-dashboard">
        {/* Botão hambúrguer flutuante - visível apenas em mobile/tablet */}
        <button
          className={`menu-hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        {/* Header - escondido em mobile, visível em tablet/desktop */}
        <div className="dashboard-header">
          <h1>
            <span className="title-full">Sistema de Controle de Operações</span>
            <span className="title-mobile">SICOOP</span>
          </h1>

          <div className="header-right">
            <UserProfile
              onAccount={openAccount}
              onAbout={openAbout}
              onLogoutRequest={handleLogoutRequest}
            />
          </div>
        </div>
        
        <div className="dashboard-content">
          <aside className="sidebar">
            <SicoopMenu
              onMenuItemClick={handleMenuItemClick}
              onLogoutRequest={handleLogoutRequest}
              isOpen={menuOpen}
              onToggle={() => setMenuOpen(!menuOpen)}
              onLogoClick={() => setCurrentContent(null)}
            />
          </aside>
          
          <main className="main-content">
            {currentContent ? (
              <div className="content-wrapper">
                <div className="content-header">
                  <h2>{currentContent.title}</h2>
                </div>
                <div className="content-body">
                  {currentContent.component}
                </div>
              </div>
            ) : (
              welcomeContent
            )}
          </main>
        </div>
      </div>

      {/* Modal de Confirmação de Logout - Agora no nível do dashboard */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowLogoutConfirm(false);
          }
        }}>
          <div className="logout-confirm-modal">
            <div className="modal-header">
              <h3>Confirmar Saída</h3>
            </div>
            <div className="modal-body">
              <div className="logout-icon">🚪</div>
              <p>Tem certeza que deseja sair do sistema?</p>
              <p>Você será desconectado e redirecionado para a tela de login.</p>
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-button" 
                onClick={() => {
                  handleCancelLogout();
                }}
              >
                Cancelar
              </button>
              <button 
                className="logout-confirm-button" 
                onClick={handleLogoutConfirm}
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
