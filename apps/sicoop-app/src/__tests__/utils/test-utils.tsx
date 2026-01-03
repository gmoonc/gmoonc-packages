import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AuthProvider } from '@/contexts/AuthContext'
import { mockAuthContext } from '../setup'

// Mock do contexto de autenticação para testes
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider value={mockAuthContext}>
      {children}
    </AuthProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: MockAuthProvider, ...options })

// Função para criar dados de teste
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-1',
  email: 'test@example.com',
  name: 'Usuário Teste',
  role: 'cliente',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  ...overrides,
})

export const createMockMensagem = (overrides = {}) => ({
  id: 'test-message-1',
  user_id: 'test-user-1',
  nome: 'Cliente Teste',
  email: 'cliente@example.com',
  telefone: '11999999999',
  empresa_fazenda: 'Fazenda Teste',
  mensagem: 'Mensagem de teste',
  status: 'enviada',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  ...overrides,
})

export const createMockAnalise = (overrides = {}) => ({
  id: 'test-analise-1',
  user_id: 'test-user-1',
  nome: 'Análise Teste',
  email: 'cliente@example.com',
  telefone: '11999999999',
  empresa_fazenda: 'Fazenda Teste',
  tipo_analise: 'cobertura',
  status: 'pendente',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  ...overrides,
})

// Função para simular delay em operações assíncronas
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Função para simular erro de API
export const mockApiError = (message = 'Erro interno do servidor') => ({
  error: {
    message,
    details: null,
    hint: null,
    code: 'INTERNAL_ERROR',
  },
  data: null,
  status: 500,
  statusText: 'Internal Server Error',
})

// Função para simular sucesso de API
export const mockApiSuccess = (data: unknown) => ({
  data,
  error: null,
  status: 200,
  statusText: 'OK',
})

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }
