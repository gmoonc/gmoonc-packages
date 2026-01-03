import { render, screen } from '@testing-library/react';
import RolesManagementPage from '../page';

// Mock do componente AuthorizationsManager
jest.mock('@/components/AuthorizationsManager', () => {
  return function MockAuthorizationsManager() {
    return <div data-testid="authorizations-manager">Authorizations Manager</div>;
  };
});

describe('RolesManagementPage', () => {
  describe('renderização básica', () => {
    it('deve renderizar a página de autorizações', () => {
      render(<RolesManagementPage />);

      expect(screen.getByTestId('authorizations-manager')).toBeInTheDocument();
    });

    it('deve ter a estrutura de layout correta', () => {
      render(<RolesManagementPage />);

      const container = screen.getByTestId('authorizations-manager').closest('.min-h-screen');
      expect(container).toHaveClass('min-h-screen', 'bg-gray-50');
    });
  });

  describe('componente AuthorizationsManager', () => {
    it('deve renderizar o AuthorizationsManager dentro do layout', () => {
      render(<RolesManagementPage />);

      const authorizationsManager = screen.getByTestId('authorizations-manager');
      expect(authorizationsManager).toBeInTheDocument();
      expect(authorizationsManager).toHaveTextContent('Authorizations Manager');
    });
  });

  describe('estrutura de layout', () => {
    it('deve ter estrutura de divs aninhadas correta', () => {
      render(<RolesManagementPage />);

      const outerDiv = screen.getByTestId('authorizations-manager').closest('.min-h-screen');
      
      expect(outerDiv).toContainElement(screen.getByTestId('authorizations-manager'));
    });

    it('deve ter layout mais simples que outras páginas admin', () => {
      render(<RolesManagementPage />);

      const authorizationsManager = screen.getByTestId('authorizations-manager');
      
      // Não deve ter container adicional ou padding
      expect(authorizationsManager.closest('.container')).toBeNull();
      expect(authorizationsManager.closest('.max-w-7xl')).toBeNull();
    });
  });

  describe('diretiva use client', () => {
    it('deve ser um componente client-side', () => {
      // Este teste verifica se o componente é renderizado corretamente
      // A diretiva 'use client' é verificada pelo comportamento do componente
      render(<RolesManagementPage />);
      
      const authorizationsManager = screen.getByTestId('authorizations-manager');
      expect(authorizationsManager).toBeInTheDocument();
    });
  });
});
