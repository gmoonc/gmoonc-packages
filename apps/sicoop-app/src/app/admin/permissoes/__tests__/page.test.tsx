import { render, screen } from '@testing-library/react';
import PermissoesPage from '../page';

// Mock dos componentes
jest.mock('@/components/PermissionsManager', () => {
  return function MockPermissionsManager() {
    return <div data-testid="permissions-manager">Permissions Manager</div>;
  };
});

jest.mock('@/components/ProtectedRoute', () => {
  return function MockProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole: string }) {
    return (
      <div data-testid="protected-route" data-required-role={requiredRole}>
        {children}
      </div>
    );
  };
});

describe('PermissoesPage', () => {
  describe('renderização básica', () => {
    it('deve renderizar a página de permissões', () => {
      render(<PermissoesPage />);

      expect(screen.getByTestId('permissions-manager')).toBeInTheDocument();
    });

    it('deve ter ProtectedRoute com role de administrador', () => {
      render(<PermissoesPage />);

      const protectedRoute = screen.getByTestId('protected-route');
      expect(protectedRoute).toHaveAttribute('data-required-role', 'administrador');
    });

    it('deve ter a estrutura de layout correta', () => {
      render(<PermissoesPage />);

      const container = screen.getByTestId('permissions-manager').closest('.min-h-screen');
      expect(container).toHaveClass('min-h-screen', 'bg-gray-50');
    });

    it('deve ter o container principal com classes corretas', () => {
      render(<PermissoesPage />);

      const mainContainer = screen.getByTestId('permissions-manager').closest('.container');
      expect(mainContainer).toHaveClass('container', 'mx-auto', 'py-8');
    });
  });

  describe('componente PermissionsManager', () => {
    it('deve renderizar o PermissionsManager dentro do layout', () => {
      render(<PermissoesPage />);

      const permissionsManager = screen.getByTestId('permissions-manager');
      expect(permissionsManager).toBeInTheDocument();
      expect(permissionsManager).toHaveTextContent('Permissions Manager');
    });
  });

  describe('proteção de rota', () => {
    it('deve estar protegida com role de administrador', () => {
      render(<PermissoesPage />);

      const protectedRoute = screen.getByTestId('protected-route');
      expect(protectedRoute).toHaveAttribute('data-required-role', 'administrador');
    });

    it('deve ter ProtectedRoute como wrapper do conteúdo', () => {
      render(<PermissoesPage />);

      const protectedRoute = screen.getByTestId('protected-route');
      const permissionsManager = screen.getByTestId('permissions-manager');
      
      expect(protectedRoute).toContainElement(permissionsManager);
    });
  });

  describe('estrutura de layout', () => {
    it('deve ter estrutura de divs aninhadas correta', () => {
      render(<PermissoesPage />);

      const protectedRoute = screen.getByTestId('protected-route');
      const outerDiv = screen.getByTestId('permissions-manager').closest('.min-h-screen');
      const innerDiv = screen.getByTestId('permissions-manager').closest('.container');
      
      expect(protectedRoute).toContainElement(outerDiv);
      expect(outerDiv).toContainElement(innerDiv);
      expect(innerDiv).toContainElement(screen.getByTestId('permissions-manager'));
    });
  });
});
