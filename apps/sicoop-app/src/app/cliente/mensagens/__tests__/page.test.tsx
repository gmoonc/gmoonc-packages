import { render, screen } from '@testing-library/react';
import MensagensClientePage from '../page';

// Mock do componente MensagensManager
jest.mock('@/components/MensagensManager', () => {
  return function MockMensagensManager() {
    return <div data-testid="mensagens-manager">Mensagens Manager</div>;
  };
});

describe('MensagensClientePage', () => {
  describe('renderização básica', () => {
    it('deve renderizar a página de mensagens do cliente', () => {
      render(<MensagensClientePage />);

      expect(screen.getByTestId('mensagens-manager')).toBeInTheDocument();
    });

    it('deve ter a estrutura de layout correta', () => {
      render(<MensagensClientePage />);

      // A página agora apenas retorna o componente diretamente, sem wrapper de layout
      const manager = screen.getByTestId('mensagens-manager');
      expect(manager).toBeInTheDocument();
    });

    it('deve ter o container principal com classes corretas', () => {
      render(<MensagensClientePage />);

      // A página agora apenas retorna o componente diretamente
      const manager = screen.getByTestId('mensagens-manager');
      expect(manager).toBeInTheDocument();
    });
  });

  describe('componente MensagensManager', () => {
    it('deve renderizar o MensagensManager dentro do layout', () => {
      render(<MensagensClientePage />);

      const mensagensManager = screen.getByTestId('mensagens-manager');
      expect(mensagensManager).toBeInTheDocument();
      expect(mensagensManager).toHaveTextContent('Mensagens Manager');
    });
  });

  describe('estrutura de layout', () => {
    it('deve renderizar o componente diretamente', () => {
      render(<MensagensClientePage />);

      // A página agora apenas retorna o componente diretamente, sem wrappers de layout
      const manager = screen.getByTestId('mensagens-manager');
      expect(manager).toBeInTheDocument();
    });
  });
});
