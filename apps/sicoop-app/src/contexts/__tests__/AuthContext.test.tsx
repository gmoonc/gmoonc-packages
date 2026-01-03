import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Configurar variáveis de ambiente ANTES de importar qualquer módulo
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Mock do módulo supabase para garantir que hasSupabaseEnv retorne true
jest.mock('@/lib/supabase', () => {
  const actual = jest.requireActual('@/lib/supabase');
  return {
    ...actual,
    hasSupabaseEnv: true,
    supabase: global.mockSupabase || actual.supabase,
  };
});

// Mock do Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Importar após configurar mocks
import { AuthProvider, useAuth } from '../AuthContext';

// Componente de teste para usar o contexto
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="user">{auth.user ? auth.user.name : 'null'}</div>
      <div data-testid="loading">{auth.isLoading ? 'true' : 'false'}</div>
      <div data-testid="authenticated">{auth.isAuthenticated ? 'true' : 'false'}</div>
      <div data-testid="error">{auth.error || 'null'}</div>
      <button onClick={() => auth.login('test@test.com', 'password')}>Login</button>
      <button onClick={() => auth.logout()}>Logout</button>
      <button onClick={() => auth.register({ name: 'Test', email: 'test@test.com', password: 'password', confirmPassword: 'password' })}>Register</button>
      <button onClick={() => auth.resendConfirmationEmail('test@test.com')}>Resend Email</button>
      <button onClick={() => auth.emergencyReset()}>Emergency Reset</button>
      <button onClick={() => auth.clearError()}>Clear Error</button>
    </div>
  );
};

// Componente que testa o erro quando usado fora do provider
const TestComponentWithoutProvider = () => {
  useAuth();
  return <div>Should not render</div>;
};

describe('AuthContext', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configurar variáveis de ambiente para hasSupabaseEnv retornar true
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
    
    // Mock do window para garantir que typeof window !== 'undefined'
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
    
    // Mock do Supabase
    if (global.mockSupabase) {
      global.mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      });
      
      global.mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: null
      });
      
      global.mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: null
      });
      
      global.mockSupabase.auth.signOut.mockResolvedValue({
        error: null
      });
      
      global.mockSupabase.auth.resend.mockResolvedValue({
        error: null
      });
      
      global.mockSupabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } }
      });
      
      global.mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null
        }),
      });
    }
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Provider e Hook', () => {
    it('deve renderizar o provider sem erros', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      expect(screen.getByTestId('user')).toBeInTheDocument();
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByTestId('authenticated')).toBeInTheDocument();
      expect(screen.getByTestId('error')).toBeInTheDocument();
    });

    it('deve lançar erro quando useAuth é usado fora do provider', () => {
      // Suprimir console.error para este teste específico
      const originalError = console.error;
      console.error = jest.fn();
      
      expect(() => {
        render(<TestComponentWithoutProvider />);
      }).toThrow('useAuth must be used within an AuthProvider');
      
      console.error = originalError;
    });
  });

  describe('Estado Inicial', () => {
    it('deve ter estado inicial correto', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      // Verificar estado inicial imediato
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('loading')).toHaveTextContent('true');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('error')).toHaveTextContent('null');
      
      // Aguardar o useEffect executar (tem setTimeout de 1000ms)
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      }, { timeout: 2000 });
    });
  });

  describe('Funções do Contexto', () => {
    it('deve ter função login disponível', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('deve chamar login quando botão é clicado', async () => {
      const user = userEvent.setup();
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      // Aguardar o componente inicializar
      await waitFor(() => {
        expect(screen.getByText('Login')).toBeInTheDocument();
      });
      
      const loginButton = screen.getByText('Login');
      await user.click(loginButton);
      
      // Aguardar a função ser chamada
      await waitFor(() => {
        expect(global.mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@test.com',
          password: 'password'
        });
      });
    });

    it('deve ter função logout disponível', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('deve chamar logout quando botão é clicado', async () => {
      const user = userEvent.setup();
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      // Aguardar o componente inicializar
      await waitFor(() => {
        expect(screen.getByText('Logout')).toBeInTheDocument();
      });
      
      const logoutButton = screen.getByText('Logout');
      await user.click(logoutButton);
      
      // Aguardar a função ser chamada
      await waitFor(() => {
        expect(global.mockSupabase.auth.signOut).toHaveBeenCalled();
      });
    });

    it('deve ter função register disponível', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      expect(screen.getByText('Register')).toBeInTheDocument();
    });

    it('deve chamar register quando botão é clicado', async () => {
      const user = userEvent.setup();
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      // Aguardar o componente inicializar
      await waitFor(() => {
        expect(screen.getByText('Register')).toBeInTheDocument();
      });
      
      const registerButton = screen.getByText('Register');
      await user.click(registerButton);
      
      // Aguardar a função ser chamada
      await waitFor(() => {
        expect(global.mockSupabase.auth.signUp).toHaveBeenCalledWith({
          email: 'test@test.com',
          password: 'password',
          options: {
            data: {
              name: 'Test',
              role: 'cliente',
            }
          }
        });
      });
    });

    it('deve ter função resendConfirmationEmail disponível', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      expect(screen.getByText('Resend Email')).toBeInTheDocument();
    });

    it('deve chamar resendConfirmationEmail quando botão é clicado', async () => {
      const user = userEvent.setup();
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      // Aguardar o componente inicializar
      await waitFor(() => {
        expect(screen.getByText('Resend Email')).toBeInTheDocument();
      });
      
      const resendButton = screen.getByText('Resend Email');
      await user.click(resendButton);
      
      // Aguardar a função ser chamada
      await waitFor(() => {
        expect(global.mockSupabase.auth.resend).toHaveBeenCalledWith({
          type: 'signup',
          email: 'test@test.com',
          options: {
            emailRedirectTo: expect.stringContaining('/auth/confirm-email'),
          },
        });
      });
    });

    it('deve ter função emergencyReset disponível', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      expect(screen.getByText('Emergency Reset')).toBeInTheDocument();
    });

    it('deve chamar emergencyReset quando botão é clicado', async () => {
      const user = userEvent.setup();
      
      // Mock do window.location.href
      delete (window as unknown as { location: unknown }).location;
      window.location = { href: '' } as Location;
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      const emergencyButton = screen.getByText('Emergency Reset');
      await user.click(emergencyButton);
      
      expect(window.location.href).toBe('/auth/login');
    });

    it('deve ter função clearError disponível', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      expect(screen.getByText('Clear Error')).toBeInTheDocument();
    });

    it('deve chamar clearError quando botão é clicado', async () => {
      const user = userEvent.setup();
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      const clearErrorButton = screen.getByText('Clear Error');
      await user.click(clearErrorButton);
      
      // Verificar se o erro foi limpo (não há erro visível)
      expect(screen.getByTestId('error')).toHaveTextContent('null');
    });
  });
});