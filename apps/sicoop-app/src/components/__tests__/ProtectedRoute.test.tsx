import React from 'react';
import { render, screen, act } from '@testing-library/react';
import ProtectedRoute from '../ProtectedRoute';

// Mock do contexto de autenticação
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Usuário Teste',
      role: 'cliente',
    },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

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

// Componente de teste para renderizar dentro do ProtectedRoute
const TestComponent = () => <div>Conteúdo Protegido</div>;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o componente quando usuário está autenticado', async () => {
    await act(async () => {
      render(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );
    });
    
    expect(screen.getByText('Conteúdo Protegido')).toBeInTheDocument();
  });

  it('deve renderizar children quando usuário está autenticado', async () => {
    await act(async () => {
      render(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );
    });
    
    expect(screen.getByText('Conteúdo Protegido')).toBeInTheDocument();
  });
});
