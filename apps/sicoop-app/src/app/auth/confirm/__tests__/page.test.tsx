import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import ConfirmPage from '../page';

// Mock do Next.js
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock do Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      exchangeCodeForSession: jest.fn(),
      verifyOtp: jest.fn(),
    },
  },
}));

describe('ConfirmPage', () => {
  const mockPush = jest.fn();
  const mockSearchParams = new URLSearchParams();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
  });

  it('deve renderizar loading inicial ou erro', async () => {
    render(<ConfirmPage />);

    // A página pode renderizar loading ou erro dependendo dos parâmetros
    // Como não temos parâmetros válidos, renderiza erro
    await waitFor(() => {
      const loading = screen.queryByText('Verificando Link...');
      const error = screen.queryByText('Link Inválido');
      // Aceitar qualquer um dos dois
      expect(loading || error).toBeTruthy();
    });
  });

  it('deve exibir erro quando não há parâmetros válidos', async () => {
    render(<ConfirmPage />);

    await waitFor(() => {
      expect(screen.getByText('Link Inválido')).toBeInTheDocument();
      expect(screen.getByText('Não foi possível processar seu link de recuperação')).toBeInTheDocument();
    });
  });

  it('deve exibir links de navegação em caso de erro', async () => {
    render(<ConfirmPage />);

    await waitFor(() => {
      expect(screen.getByText('Solicitar novo link de recuperação')).toBeInTheDocument();
      expect(screen.getByText('Voltar para o login')).toBeInTheDocument();
    });
  });

  it('deve exibir logo do Sicoop', () => {
    render(<ConfirmPage />);

    expect(screen.getByAltText('Logo Goalmoon - Sicoop')).toBeInTheDocument();
  });
});
