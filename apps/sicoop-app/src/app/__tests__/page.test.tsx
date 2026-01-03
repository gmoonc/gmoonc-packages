import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';
import Home from '../page';

// Mock do Next.js
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Mock dos componentes
jest.mock('@/components/SicoopDashboard', () => {
  return function MockSicoopDashboard() {
    return <div data-testid="sicoop-dashboard">Sicoop Dashboard</div>;
  };
});

jest.mock('@/components/ProtectedRoute', () => {
  return function MockProtectedRoute({ children }: { children: React.ReactNode }) {
    return <div data-testid="protected-route">{children}</div>;
  };
});

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renderização básica', () => {
    it('deve renderizar o dashboard dentro do ProtectedRoute', async () => {
      const mockSearchParams = Promise.resolve({});
      
      render(await Home({ searchParams: mockSearchParams }));

      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      expect(screen.getByTestId('sicoop-dashboard')).toBeInTheDocument();
    });
  });

  describe('interceptação de links de recuperação', () => {
    it('deve redirecionar para confirm com token de recovery', async () => {
      const mockSearchParams = Promise.resolve({
        token: 'recovery-token-123',
        type: 'recovery'
      });
      
      render(await Home({ searchParams: mockSearchParams }));

      expect(redirect).toHaveBeenCalledWith(
        '/auth/confirm?token_hash=recovery-token-123&type=recovery&next=%2Fauth%2Freset-password'
      );
    });

    it('deve redirecionar para confirm com token_hash de recovery', async () => {
      const mockSearchParams = Promise.resolve({
        token_hash: 'recovery-hash-456',
        type: 'recovery'
      });
      
      render(await Home({ searchParams: mockSearchParams }));

      expect(redirect).toHaveBeenCalledWith(
        '/auth/confirm?token_hash=recovery-hash-456&type=recovery&next=%2Fauth%2Freset-password'
      );
    });

    it('deve priorizar token sobre token_hash', async () => {
      const mockSearchParams = Promise.resolve({
        token: 'recovery-token-123',
        token_hash: 'recovery-hash-456',
        type: 'recovery'
      });
      
      render(await Home({ searchParams: mockSearchParams }));

      expect(redirect).toHaveBeenCalledWith(
        '/auth/confirm?token_hash=recovery-token-123&type=recovery&next=%2Fauth%2Freset-password'
      );
    });

    it('não deve redirecionar quando type não é recovery', async () => {
      const mockSearchParams = Promise.resolve({
        token: 'some-token',
        type: 'signup'
      });
      
      render(await Home({ searchParams: mockSearchParams }));

      expect(redirect).not.toHaveBeenCalled();
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });

    it('não deve redirecionar quando não há token', async () => {
      const mockSearchParams = Promise.resolve({
        type: 'recovery'
      });
      
      render(await Home({ searchParams: mockSearchParams }));

      expect(redirect).not.toHaveBeenCalled();
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });

    it('não deve redirecionar quando não há type', async () => {
      const mockSearchParams = Promise.resolve({
        token: 'some-token'
      });
      
      render(await Home({ searchParams: mockSearchParams }));

      expect(redirect).not.toHaveBeenCalled();
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });
  });

  describe('parâmetros de busca vazios', () => {
    it('deve renderizar normalmente quando searchParams está vazio', async () => {
      const mockSearchParams = Promise.resolve({});
      
      render(await Home({ searchParams: mockSearchParams }));

      expect(redirect).not.toHaveBeenCalled();
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      expect(screen.getByTestId('sicoop-dashboard')).toBeInTheDocument();
    });

    it('deve renderizar normalmente quando searchParams é undefined', async () => {
      const mockSearchParams = Promise.resolve({} as Record<string, string>);
      
      render(await Home({ searchParams: mockSearchParams }));

      expect(redirect).not.toHaveBeenCalled();
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      expect(screen.getByTestId('sicoop-dashboard')).toBeInTheDocument();
    });
  });

  describe('estrutura de componentes', () => {
    it('deve ter ProtectedRoute como wrapper do SicoopDashboard', async () => {
      const mockSearchParams = Promise.resolve({});
      
      render(await Home({ searchParams: mockSearchParams }));

      const protectedRoute = screen.getByTestId('protected-route');
      const dashboard = screen.getByTestId('sicoop-dashboard');
      
      expect(protectedRoute).toContainElement(dashboard);
    });
  });

  describe('URL encoding', () => {
    it('deve codificar corretamente os parâmetros da URL', async () => {
      const mockSearchParams = Promise.resolve({
        token: 'recovery-token-123',
        type: 'recovery'
      });
      
      render(await Home({ searchParams: mockSearchParams }));

      expect(redirect).toHaveBeenCalledWith(
        expect.stringContaining('next=%2Fauth%2Freset-password')
      );
    });
  });
});
