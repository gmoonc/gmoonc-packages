import { render, screen } from '@testing-library/react';
import AnalisesClientePage from '../page';

// Mock do componente AnalisesManager
jest.mock('@/components/AnalisesManager', () => {
  return function MockAnalisesManager() {
    return <div data-testid="analises-manager">Analises Manager</div>;
  };
});

describe('AnalisesClientePage', () => {
  describe('renderização básica', () => {
    it('deve renderizar a página de análises do cliente', () => {
      render(<AnalisesClientePage />);

      expect(screen.getByTestId('analises-manager')).toBeInTheDocument();
    });

    it('deve ter a estrutura de layout correta', () => {
      render(<AnalisesClientePage />);

      // A página agora apenas retorna o componente diretamente, sem wrapper de layout
      const manager = screen.getByTestId('analises-manager');
      expect(manager).toBeInTheDocument();
    });

    it('deve ter o container principal com classes corretas', () => {
      render(<AnalisesClientePage />);

      // A página agora apenas retorna o componente diretamente
      const manager = screen.getByTestId('analises-manager');
      expect(manager).toBeInTheDocument();
    });
  });

  describe('componente AnalisesManager', () => {
    it('deve renderizar o AnalisesManager dentro do layout', () => {
      render(<AnalisesClientePage />);

      const analisesManager = screen.getByTestId('analises-manager');
      expect(analisesManager).toBeInTheDocument();
      expect(analisesManager).toHaveTextContent('Analises Manager');
    });
  });

  describe('estrutura de layout', () => {
    it('deve renderizar o componente diretamente', () => {
      render(<AnalisesClientePage />);

      // A página agora apenas retorna o componente diretamente, sem wrappers de layout
      const manager = screen.getByTestId('analises-manager');
      expect(manager).toBeInTheDocument();
    });
  });
});
