import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthContext } from '@/contexts/AuthContext';
import LoginPage from '@/app/auth/login/page';
import RegisterPage from '@/app/auth/register/page';

// Mock do Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      signOut: jest.fn(),
    },
  })),
}));

// Mock do useAuth
jest.mock('@/contexts/AuthContext', () => ({
  AuthContext: React.createContext({}),
  useAuth: jest.fn(),
}));

describe('Fluxos de Autenticação - Integração Simplificada', () => {
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
  });

  describe('LoginPage', () => {
    it('deve renderizar página de login', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <LoginPage />
        </AuthContext.Provider>
      );

      // Verificar se elementos básicos estão presentes
      expect(screen.getByText('Sicoop')).toBeInTheDocument();
      expect(screen.getByText('Sistema de Controle de Operações da Goalmoon')).toBeInTheDocument();
      expect(screen.getByText('Entrar')).toBeInTheDocument();
    });

    it('deve exibir campos de email e senha', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <LoginPage />
        </AuthContext.Provider>
      );

      // Verificar se campos estão presentes
      expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Sua senha')).toBeInTheDocument();
    });

    it('deve exibir links de navegação', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <LoginPage />
        </AuthContext.Provider>
      );

      // Verificar se links estão presentes
      expect(screen.getByText('Esqueceu sua senha?')).toBeInTheDocument();
      expect(screen.getByText('Criar conta')).toBeInTheDocument();
    });
  });

  describe('RegisterPage', () => {
    it('deve renderizar página de registro', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <RegisterPage />
        </AuthContext.Provider>
      );

      // Verificar se elementos básicos estão presentes
      expect(screen.getByRole('heading', { name: 'Criar Conta' })).toBeInTheDocument();
      expect(screen.getByText('Sicoop - Sistema da Goalmoon')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Criar Conta' })).toBeInTheDocument();
    });

    it('deve exibir campos de formulário', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <RegisterPage />
        </AuthContext.Provider>
      );

      // Verificar se campos estão presentes
      expect(screen.getByPlaceholderText('Seu nome completo')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Mínimo 6 caracteres')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirme sua senha')).toBeInTheDocument();
    });

    it('deve exibir link de login', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <RegisterPage />
        </AuthContext.Provider>
      );

      // Verificar se link está presente
      expect(screen.getByText('Já tem uma conta? Faça login')).toBeInTheDocument();
    });
  });
});