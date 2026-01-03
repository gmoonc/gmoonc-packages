import { render, screen } from '@testing-library/react';
import NotificacoesPage from '../page';

// Mock dos componentes
jest.mock('@/components/NotificationsManager', () => {
  return function MockNotificationsManager() {
    return <div data-testid="notifications-manager">Notifications Manager</div>;
  };
});

jest.mock('@/components/ProtectedRoute', () => {
  return function MockProtectedRoute({ 
    children, 
    requiredRole, 
    requiredModule 
  }: { 
    children: React.ReactNode; 
    requiredRole: string; 
    requiredModule: string; 
  }) {
    return (
      <div 
        data-testid="protected-route" 
        data-required-role={requiredRole}
        data-required-module={requiredModule}
      >
        {children}
      </div>
    );
  };
});

describe('NotificacoesPage', () => {
  describe('renderização básica', () => {
    it('deve renderizar a página de notificações', () => {
      render(<NotificacoesPage />);

      expect(screen.getByTestId('notifications-manager')).toBeInTheDocument();
    });

    it('deve ter ProtectedRoute com role de administrador', () => {
      render(<NotificacoesPage />);

      const protectedRoute = screen.getByTestId('protected-route');
      expect(protectedRoute).toHaveAttribute('data-required-role', 'administrador');
    });

    it('deve ter ProtectedRoute com módulo de notificações', () => {
      render(<NotificacoesPage />);

      const protectedRoute = screen.getByTestId('protected-route');
      expect(protectedRoute).toHaveAttribute('data-required-module', 'notificacoes');
    });
  });

  describe('componente NotificationsManager', () => {
    it('deve renderizar o NotificationsManager dentro do ProtectedRoute', () => {
      render(<NotificacoesPage />);

      const notificationsManager = screen.getByTestId('notifications-manager');
      expect(notificationsManager).toBeInTheDocument();
      expect(notificationsManager).toHaveTextContent('Notifications Manager');
    });
  });

  describe('proteção de rota', () => {
    it('deve estar protegida com role de administrador', () => {
      render(<NotificacoesPage />);

      const protectedRoute = screen.getByTestId('protected-route');
      expect(protectedRoute).toHaveAttribute('data-required-role', 'administrador');
    });

    it('deve estar protegida com módulo de notificações', () => {
      render(<NotificacoesPage />);

      const protectedRoute = screen.getByTestId('protected-route');
      expect(protectedRoute).toHaveAttribute('data-required-module', 'notificacoes');
    });

    it('deve ter ProtectedRoute como wrapper direto do NotificationsManager', () => {
      render(<NotificacoesPage />);

      const protectedRoute = screen.getByTestId('protected-route');
      const notificationsManager = screen.getByTestId('notifications-manager');
      
      expect(protectedRoute).toContainElement(notificationsManager);
    });
  });

  describe('estrutura simplificada', () => {
    it('deve ter estrutura mais simples que outras páginas admin', () => {
      render(<NotificacoesPage />);

      const protectedRoute = screen.getByTestId('protected-route');
      const notificationsManager = screen.getByTestId('notifications-manager');
      
      // Não deve ter divs de layout adicionais
      expect(protectedRoute).toContainElement(notificationsManager);
      expect(notificationsManager.closest('.min-h-screen')).toBeNull();
      expect(notificationsManager.closest('.container')).toBeNull();
    });
  });
});
