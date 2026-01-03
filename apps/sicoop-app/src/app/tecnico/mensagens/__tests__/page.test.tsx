import { render, screen } from '@testing-library/react';
import MensagensTecnicasPage from '../page';

// Mock do componente MensagensTecnicasManager
jest.mock('@/components/MensagensTecnicasManager', () => {
  return function MockMensagensTecnicasManager() {
    return <div data-testid="mensagens-tecnicas-manager">Mensagens Tecnicas Manager</div>;
  };
});

describe('MensagensTecnicasPage', () => {
  describe('renderização básica', () => {
    it('deve renderizar a página de mensagens técnicas', () => {
      render(<MensagensTecnicasPage />);

      expect(screen.getByTestId('mensagens-tecnicas-manager')).toBeInTheDocument();
    });

    it('deve exibir o título da página', () => {
      render(<MensagensTecnicasPage />);

      expect(screen.getByText('🔧 Gerenciamento Técnico de Mensagens')).toBeInTheDocument();
    });

    it('deve ter a estrutura de layout correta', () => {
      render(<MensagensTecnicasPage />);

      const container = screen.getByTestId('mensagens-tecnicas-manager').closest('.min-h-screen');
      expect(container).toHaveClass('min-h-screen', 'bg-gray-50');
    });

    it('deve ter o container principal com classes corretas', () => {
      render(<MensagensTecnicasPage />);

      const mainContainer = screen.getByTestId('mensagens-tecnicas-manager').closest('.max-w-7xl');
      expect(mainContainer).toHaveClass('max-w-7xl', 'mx-auto', 'py-6', 'px-4', 'sm:px-6', 'lg:px-8');
    });
  });

  describe('título da página', () => {
    it('deve ter o título com classes corretas', () => {
      render(<MensagensTecnicasPage />);

      const title = screen.getByText('🔧 Gerenciamento Técnico de Mensagens');
      expect(title).toHaveClass('text-3xl', 'font-bold', 'text-gray-900', 'flex', 'items-center');
    });

    it('deve estar dentro de um container com margin bottom', () => {
      render(<MensagensTecnicasPage />);

      const titleContainer = screen.getByText('🔧 Gerenciamento Técnico de Mensagens').closest('.mb-6');
      expect(titleContainer).toHaveClass('mb-6');
    });
  });

  describe('componente MensagensTecnicasManager', () => {
    it('deve renderizar o MensagensTecnicasManager dentro do layout', () => {
      render(<MensagensTecnicasPage />);

      const mensagensManager = screen.getByTestId('mensagens-tecnicas-manager');
      expect(mensagensManager).toBeInTheDocument();
      expect(mensagensManager).toHaveTextContent('Mensagens Tecnicas Manager');
    });
  });

  describe('estrutura de layout', () => {
    it('deve ter estrutura de divs aninhadas correta', () => {
      render(<MensagensTecnicasPage />);

      const outerDiv = screen.getByTestId('mensagens-tecnicas-manager').closest('.min-h-screen');
      const innerDiv = screen.getByTestId('mensagens-tecnicas-manager').closest('.max-w-7xl');
      
      expect(outerDiv).toContainElement(innerDiv);
      expect(innerDiv).toContainElement(screen.getByTestId('mensagens-tecnicas-manager'));
    });

    it('deve ter o título antes do componente manager', () => {
      render(<MensagensTecnicasPage />);

      const title = screen.getByText('🔧 Gerenciamento Técnico de Mensagens');
      const manager = screen.getByTestId('mensagens-tecnicas-manager');
      
      expect(title).toBeInTheDocument();
      expect(manager).toBeInTheDocument();
    });
  });
});
