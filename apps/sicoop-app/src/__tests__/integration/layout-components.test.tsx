import React from 'react';
import { render, screen } from '@testing-library/react';
import SicoopMenu from '@/components/SicoopMenu';
import SicoopDashboard from '@/components/SicoopDashboard';
import { AuthContext } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';

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

describe('Componentes de Layout - Integração Simplificada', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock para usePermissions retornar permissões básicas
    (usePermissions as jest.Mock).mockReturnValue({
      hasPermission: jest.fn().mockReturnValue(true),
      refreshPermissions: jest.fn(),
    });
  });

  describe('SicoopMenu', () => {
    it('deve renderizar menu com itens principais', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <SicoopMenu />
        </AuthContext.Provider>
      );

      // Verificar se itens principais do menu estão presentes
      expect(screen.getByText('Administrativo')).toBeInTheDocument();
      expect(screen.getByText('Administrativo')).toBeInTheDocument();
      expect(screen.getByText('Técnico')).toBeInTheDocument();
      expect(screen.queryByText('Sobre')).not.toBeInTheDocument();
      expect(screen.queryByText('Sair')).not.toBeInTheDocument();
    });

    it('deve exibir logo do Sicoop', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <SicoopMenu />
        </AuthContext.Provider>
      );
      expect(screen.getByAltText('Logo Goalmoon - Sicoop')).toBeInTheDocument();
    });

    it('deve permitir clicar em item de menu', async () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <SicoopMenu />
        </AuthContext.Provider>
      );

      // Clicar em um item de menu (ex: "Administrativo")
      const administrativoMenuItem = screen.getByText('Administrativo');
      expect(administrativoMenuItem).toBeInTheDocument();
    });
  });

  describe('SicoopDashboard', () => {
    it('deve renderizar dashboard com header', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <SicoopDashboard />
        </AuthContext.Provider>
      );

      expect(screen.getByText('Sistema de Controle de Operações')).toBeInTheDocument();
    });

    it('deve exibir mensagem de boas-vindas', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <SicoopDashboard />
        </AuthContext.Provider>
      );

      // Verificar se mensagem de boas-vindas está presente
      expect(screen.getByText('Bem-vindo ao Sicoop')).toBeInTheDocument();
      expect(screen.getByText('Selecione um módulo no menu à esquerda para começar.')).toBeInTheDocument();
    });

    it('deve exibir informações do usuário quando logado', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <SicoopDashboard />
        </AuthContext.Provider>
      );

      // Verificar se informações do usuário estão presentes
      expect(screen.getByText('Bem-vindo ao Sicoop')).toBeInTheDocument();
    });

    it('deve renderizar sidebar com menu', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <SicoopDashboard />
        </AuthContext.Provider>
      );

      expect(screen.getByRole('complementary')).toBeInTheDocument(); // aside element
      expect(screen.getByText('Administrativo')).toBeInTheDocument();
    });
  });
});