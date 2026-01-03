import React from 'react';
import { render, screen, act } from '@testing-library/react';
import SicoopDashboard from '../SicoopDashboard';

// Mock do contexto de autenticação
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Usuário Teste',
      role: 'cliente',
    },
    loading: false,
    logout: jest.fn(),
  }),
}));

// Mock do hook usePermissions
jest.mock('../../hooks/usePermissions', () => ({
  usePermissions: () => ({
    hasPermission: jest.fn(() => true),
    checkPermission: jest.fn(),
    userPermissions: [],
    loading: false,
  }),
}));

describe('SicoopDashboard', () => {
  beforeEach(() => {
    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
    
    // Mock do Supabase para retornar dados válidos
    if (global.mockSupabase) {
      global.mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: [],
          error: null
        }),
      });
    }
  });

  it('deve renderizar o dashboard corretamente', async () => {
    await act(async () => {
      render(<SicoopDashboard />);
    });
    
    expect(screen.getByText('Sistema de Controle de Operações')).toBeInTheDocument();
    expect(screen.getByText('Bem-vindo ao Sicoop')).toBeInTheDocument();
  });

  it('deve exibir informações do usuário logado', async () => {
    await act(async () => {
      render(<SicoopDashboard />);
    });
    
    // Verificar se o texto contém "Usuário Teste" em qualquer lugar
    expect(screen.getByText(/Usuário Teste/)).toBeInTheDocument();
    expect(screen.getByText('cliente')).toBeInTheDocument();
  });
});
