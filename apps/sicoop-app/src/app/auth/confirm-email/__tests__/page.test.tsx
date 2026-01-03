import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ConfirmEmailPage from '../page';

// Mock do Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

describe('ConfirmEmailPage', () => {
  it('deve renderizar loading inicial', () => {
    render(<ConfirmEmailPage />);

    expect(screen.getByText('Confirmação de Email')).toBeInTheDocument();
    expect(screen.getByText('Sicoop - Sistema da Goalmoon')).toBeInTheDocument();
    expect(screen.getByText('Confirmando seu email...')).toBeInTheDocument();
  });

  it('deve exibir sucesso após confirmação', async () => {
    render(<ConfirmEmailPage />);

    await waitFor(() => {
      expect(screen.getByText(/Seu email foi confirmado com sucesso/)).toBeInTheDocument();
      expect(screen.getByText(/Sua conta está agora ativa/)).toBeInTheDocument();
      expect(screen.getByText('Ir para Login')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('deve exibir logo do Sicoop', () => {
    render(<ConfirmEmailPage />);

    expect(screen.getByAltText('Logo Goalmoon - Sicoop')).toBeInTheDocument();
  });

  it('deve exibir spinner de loading', () => {
    render(<ConfirmEmailPage />);

    expect(screen.getByText('Confirmando seu email...')).toBeInTheDocument();
  });
});
