import React from 'react';
import { render, screen } from '@testing-library/react';
import EmailChangeInstructions from '../page';

// Mock do Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock do window.location
const mockLocation = {
  search: '?email=test@example.com',
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Mock do window.open
const mockOpen = jest.fn();
Object.defineProperty(window, 'open', {
  value: mockOpen,
  writable: true,
});

describe('EmailChangeInstructions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o componente corretamente', () => {
    render(<EmailChangeInstructions />);

    expect(screen.getByText(/Troca de Email Solicitada/)).toBeInTheDocument();
    expect(screen.getByText('Processo de segurança ativado')).toBeInTheDocument();
  });

  it('deve exibir email solicitado quando presente na URL', () => {
    render(<EmailChangeInstructions />);

    expect(screen.getByText('Email solicitado:')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('deve exibir instruções importantes', () => {
    render(<EmailChangeInstructions />);

    expect(screen.getByText(/ATENÇÃO: NÃO TENTE FAZER LOGIN/)).toBeInTheDocument();
    expect(screen.getByText('Você receberá 2 emails')).toBeInTheDocument();
    expect(screen.getByText('Clique no link de confirmação em AMBOS os emails')).toBeInTheDocument();
  });

  it('deve exibir seção de suporte', () => {
    render(<EmailChangeInstructions />);

    expect(screen.getByText('Precisa de Ajuda?')).toBeInTheDocument();
    expect(screen.getByText('suporte@goalmoon.com')).toBeInTheDocument();
    expect(screen.getByText('Entre em contato:')).toBeInTheDocument();
    expect(screen.getByText('Abra um chamado no sistema de suporte')).toBeInTheDocument();
  });

  it('deve exibir botões de ação', () => {
    render(<EmailChangeInstructions />);

    expect(screen.getAllByText(/Contatar Suporte/)).toHaveLength(2);
    expect(screen.getAllByText(/Ir para Login/)).toHaveLength(2);
  });

  it('deve abrir email de suporte ao clicar no botão', () => {
    render(<EmailChangeInstructions />);

    const supportButtons = screen.getAllByText(/Contatar Suporte/);
    supportButtons[0].click();

    expect(mockOpen).toHaveBeenCalledWith(
      'mailto:suporte@goalmoon.com?subject=Problema na Troca de Email',
      '_blank'
    );
  });

  it('deve ter links de navegação corretos', () => {
    render(<EmailChangeInstructions />);

    const loginLinks = screen.getAllByText(/Ir para Login/);
    expect(loginLinks[0]).toHaveAttribute('href', '/auth/login');
  });

  it('deve exibir spinner de loading', () => {
    render(<EmailChangeInstructions />);

    expect(screen.getByText('Aguardando Confirmação dos Emails')).toBeInTheDocument();
  });

  it('deve funcionar sem email na URL', () => {
    // Mock sem email na URL
    Object.defineProperty(window, 'location', {
      value: { search: '' },
      writable: true,
    });

    render(<EmailChangeInstructions />);

    expect(screen.getByText(/Troca de Email Solicitada/)).toBeInTheDocument();
    expect(screen.queryByText('Email solicitado:')).not.toBeInTheDocument();
  });
});
