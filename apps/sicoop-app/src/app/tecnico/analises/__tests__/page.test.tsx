import { render, screen } from '@testing-library/react';
import AnalisesTecnicasPage from '../page';

// Mock do componente AnalisesTecnicasManager
jest.mock('@/components/AnalisesTecnicasManager', () => {
  return function MockAnalisesTecnicasManager() {
    return <div data-testid="analises-tecnicas-manager">Analises Tecnicas Manager</div>;
  };
});

describe('AnalisesTecnicasPage', () => {
  describe('renderização básica', () => {
    it('deve renderizar a página de análises técnicas', () => {
      render(<AnalisesTecnicasPage />);

      expect(screen.getByTestId('analises-tecnicas-manager')).toBeInTheDocument();
    });

    it('deve exibir o título da página', () => {
      render(<AnalisesTecnicasPage />);

      expect(screen.getByText('🔧 Gerenciamento Técnico de Análises')).toBeInTheDocument();
    });

    it('deve ter a estrutura de layout correta', () => {
      render(<AnalisesTecnicasPage />);

      const container = screen.getByTestId('analises-tecnicas-manager').closest('.min-h-screen');
      expect(container).toHaveClass('min-h-screen', 'bg-gray-50');
    });

    it('deve ter o container principal com classes corretas', () => {
      render(<AnalisesTecnicasPage />);

      const mainContainer = screen.getByTestId('analises-tecnicas-manager').closest('.max-w-7xl');
      expect(mainContainer).toHaveClass('max-w-7xl', 'mx-auto', 'py-6', 'px-4', 'sm:px-6', 'lg:px-8');
    });
  });

  describe('título da página', () => {
    it('deve ter o título com classes corretas', () => {
      render(<AnalisesTecnicasPage />);

      const title = screen.getByText('🔧 Gerenciamento Técnico de Análises');
      expect(title).toHaveClass('text-3xl', 'font-bold', 'text-gray-900', 'flex', 'items-center');
    });

    it('deve estar dentro de um container com margin bottom', () => {
      render(<AnalisesTecnicasPage />);

      const titleContainer = screen.getByText('🔧 Gerenciamento Técnico de Análises').closest('.mb-6');
      expect(titleContainer).toHaveClass('mb-6');
    });
  });

  describe('componente AnalisesTecnicasManager', () => {
    it('deve renderizar o AnalisesTecnicasManager dentro do layout', () => {
      render(<AnalisesTecnicasPage />);

      const analisesManager = screen.getByTestId('analises-tecnicas-manager');
      expect(analisesManager).toBeInTheDocument();
      expect(analisesManager).toHaveTextContent('Analises Tecnicas Manager');
    });
  });

  describe('estrutura de layout', () => {
    it('deve ter estrutura de divs aninhadas correta', () => {
      render(<AnalisesTecnicasPage />);

      const outerDiv = screen.getByTestId('analises-tecnicas-manager').closest('.min-h-screen');
      const innerDiv = screen.getByTestId('analises-tecnicas-manager').closest('.max-w-7xl');
      
      expect(outerDiv).toContainElement(innerDiv);
      expect(innerDiv).toContainElement(screen.getByTestId('analises-tecnicas-manager'));
    });

    it('deve ter o título antes do componente manager', () => {
      render(<AnalisesTecnicasPage />);

      const title = screen.getByText('🔧 Gerenciamento Técnico de Análises');
      const manager = screen.getByTestId('analises-tecnicas-manager');
      
      expect(title).toBeInTheDocument();
      expect(manager).toBeInTheDocument();
    });
  });
});
