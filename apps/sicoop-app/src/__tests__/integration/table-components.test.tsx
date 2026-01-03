import React from 'react';
import { render, screen } from '@testing-library/react';
import MensagensManager from '@/components/MensagensManager';
import AnalisesManager from '@/components/AnalisesManager';
import { AuthContext } from '@/contexts/AuthContext';
import { useMensagens } from '@/hooks/useMensagens';
import { useAnalises } from '@/hooks/useAnalises';
import { usePermissions } from '@/hooks/usePermissions';

// Mock do useMensagens
jest.mock('@/hooks/useMensagens', () => ({
  useMensagens: jest.fn(),
}));

// Mock do useAnalises
jest.mock('@/hooks/useAnalises', () => ({
  useAnalises: jest.fn(),
}));

// Mock do usePermissions
jest.mock('@/hooks/usePermissions', () => ({
  usePermissions: jest.fn(),
}));

// Mock do AuthContext
const mockAuthContext = {
  user: { id: '123', email: 'test@example.com' },
  isLoading: false,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  logout: jest.fn(),
};

describe('Componentes de Gerenciamento - Integração Simplificada', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Configurar mock do useMensagens
    (useMensagens as jest.Mock).mockReturnValue({
      mensagens: [],
      loading: false,
      error: null,
      createMensagem: jest.fn(),
      updateMensagem: jest.fn(),
      deleteMensagem: jest.fn(),
    });

    // Configurar mock do useAnalises
    (useAnalises as jest.Mock).mockReturnValue({
      analises: [],
      loading: false,
      error: null,
      createAnalise: jest.fn(),
      updateAnalise: jest.fn(),
      deleteAnalise: jest.fn(),
    });

    // Configurar mock do usePermissions
    (usePermissions as jest.Mock).mockReturnValue({
      hasPermission: jest.fn().mockReturnValue(true),
      refreshPermissions: jest.fn(),
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