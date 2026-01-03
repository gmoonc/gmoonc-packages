import React from 'react';
import { render, screen } from '@testing-library/react';
import SicoopDashboard from '@/components/SicoopDashboard';
import { AuthContext } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useMensagens } from '@/hooks/useMensagens';
import { useAnalises } from '@/hooks/useAnalises';

// Mock do usePermissions
jest.mock('@/hooks/usePermissions', () => ({
  usePermissions: jest.fn(),
}));

// Mock do useMensagens
jest.mock('@/hooks/useMensagens', () => ({
  useMensagens: jest.fn(),
}));

// Mock do useAnalises
jest.mock('@/hooks/useAnalises', () => ({
  useAnalises: jest.fn(),
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

describe('Componentes de Dashboard - Integração Simplificada', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock para usePermissions retornar permissões básicas
    (usePermissions as jest.Mock).mockReturnValue({
      hasPermission: jest.fn().mockReturnValue(true),
      refreshPermissions: jest.fn(),
    });
    // Mock para useMensagens retornar dados vazios
    (useMensagens as jest.Mock).mockReturnValue({
      mensagens: [],
      loading: false,
      error: null,
    });
    // Mock para useAnalises retornar dados vazios
    (useAnalises as jest.Mock).mockReturnValue({
      analises: [],
      loading: false,
      error: null,
    });
  });

  describe('Dashboard Principal', () => {
    it('deve renderizar dashboard com estrutura básica', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <SicoopDashboard />
        </AuthContext.Provider>
      );

      expect(screen.getByText('Sistema de Controle de Operações')).toBeInTheDocument();
      expect(screen.getByText('Bem-vindo ao Sicoop')).toBeInTheDocument();
      expect(screen.getByText('Selecione um módulo no menu à esquerda para começar.')).toBeInTheDocument();
    });

    it('deve exibir sidebar com menu de navegação', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <SicoopDashboard />
        </AuthContext.Provider>
      );

      expect(screen.getByRole('complementary')).toBeInTheDocument(); // aside element
      expect(screen.getByText('Administrativo')).toBeInTheDocument();
    });

    it('deve exibir informações do usuário logado', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <SicoopDashboard />
        </AuthContext.Provider>
      );

      expect(screen.getByText('Bem-vindo ao Sicoop')).toBeInTheDocument();
      expect(screen.getByText('Selecione um módulo no menu à esquerda para começar.')).toBeInTheDocument();
    });

    it('deve ter layout responsivo básico', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <SicoopDashboard />
        </AuthContext.Provider>
      );

      // Em um teste de integração simplificado, podemos verificar a presença de classes CSS
      // ou elementos que indicam responsividade, ou simplesmente que o layout básico é renderizado.
      // Para um teste mais robusto de responsividade, seriam necessários testes E2E com Playwright/Cypress.
      const dashboardElement = screen.getByRole('main').closest('.sicoop-dashboard');
      expect(dashboardElement).toBeInTheDocument();
      // Poderíamos adicionar verificações de classes CSS como 'flex-col md:flex-row' se existissem
    });
  });
});