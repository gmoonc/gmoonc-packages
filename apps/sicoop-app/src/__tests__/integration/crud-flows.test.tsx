import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthContext } from '@/contexts/AuthContext';
import MensagensManager from '@/components/MensagensManager';
import AnalisesManager from '@/components/AnalisesManager';

// Mock do Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
    rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
}));

// Mock do useAuth
jest.mock('@/contexts/AuthContext', () => ({
  AuthContext: React.createContext({}),
  useAuth: jest.fn(),
}));

// Mock do usePermissions
jest.mock('@/hooks/usePermissions', () => ({
  usePermissions: jest.fn(),
}));

// Mock dos hooks customizados
jest.mock('@/hooks/useMensagens', () => ({
  useMensagens: jest.fn(),
}));

jest.mock('@/hooks/useAnalises', () => ({
  useAnalises: jest.fn(),
}));

describe('Fluxos de CRUD - Integração Simplificada', () => {
  const mockUser = {
    id: '1',
    email: 'test@test.com',
    name: 'Test User',
    user_metadata: { full_name: 'Test User' },
  };

  const mockAuthContext = {
    user: mockUser,
    isLoading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configurar mock do useAuth
    const { useAuth } = jest.requireMock('@/contexts/AuthContext');
    const mockUseAuth = jest.mocked(useAuth);
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      logout: jest.fn(),
    });

    // Configurar mock do usePermissions
    const { usePermissions } = jest.requireMock('@/hooks/usePermissions');
    const mockUsePermissions = jest.mocked(usePermissions);
    mockUsePermissions.mockReturnValue({
      hasPermission: jest.fn().mockReturnValue(true),
      refreshPermissions: jest.fn(),
    });

    // Configurar mock do useMensagens
    const { useMensagens } = jest.requireMock('@/hooks/useMensagens');
    const mockUseMensagens = jest.mocked(useMensagens);
    mockUseMensagens.mockReturnValue({
      mensagens: [],
      loading: false,
      error: null,
      createMensagem: jest.fn(),
      updateMensagem: jest.fn(),
      deleteMensagem: jest.fn(),
    });

    // Configurar mock do useAnalises
    const { useAnalises } = jest.requireMock('@/hooks/useAnalises');
    const mockUseAnalises = jest.mocked(useAnalises);
    mockUseAnalises.mockReturnValue({
      analises: [],
      loading: false,
      error: null,
      createAnalise: jest.fn(),
      updateAnalise: jest.fn(),
      deleteAnalise: jest.fn(),
    });
  });

  describe('MensagensManager', () => {
    it('deve renderizar componente de gerenciamento de mensagens', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <MensagensManager />
        </AuthContext.Provider>
      );

      // Verificar se elementos básicos estão presentes
      expect(screen.getByText('Gerencie suas mensagens para o Sicoop')).toBeInTheDocument();
      expect(screen.getByText('Nova Mensagem')).toBeInTheDocument();
    });

    it('deve exibir botão de nova mensagem', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <MensagensManager />
        </AuthContext.Provider>
      );

      // Verificar se botão está presente
      const novaMensagemBtn = screen.getByText('Nova Mensagem');
      expect(novaMensagemBtn).toBeInTheDocument();
    });

    it('deve ter botão de nova mensagem', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <MensagensManager />
        </AuthContext.Provider>
      );

      // Verificar se botão está presente (texto está dividido em spans)
      const novaMensagemBtn = screen.getByRole('button', { name: /Nova Mensagem/i });
      expect(novaMensagemBtn).toBeInTheDocument();
      expect(novaMensagemBtn.tagName).toBe('BUTTON');
    });
  });

  describe('AnalisesManager', () => {
    it('deve renderizar componente de gerenciamento de análises', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <AnalisesManager />
        </AuthContext.Provider>
      );

      // Verificar se elementos básicos estão presentes
      expect(screen.getByText('Gerencie suas análises de cobertura de sinal')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Nova Análise/i })).toBeInTheDocument();
    });

    it('deve exibir botão de nova análise', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <AnalisesManager />
        </AuthContext.Provider>
      );

      // Verificar se botão está presente (texto está dividido em spans)
      const novaAnaliseBtn = screen.getByRole('button', { name: /Nova Análise/i });
      expect(novaAnaliseBtn).toBeInTheDocument();
    });

    it('deve ter botão de nova análise', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <AnalisesManager />
        </AuthContext.Provider>
      );

      // Verificar se botão está presente (texto está dividido em spans)
      const novaAnaliseBtn = screen.getByRole('button', { name: /Nova Análise/i });
      expect(novaAnaliseBtn).toBeInTheDocument();
      expect(novaAnaliseBtn.tagName).toBe('BUTTON');
    });
  });
});
