// Configuração global para testes
import '@testing-library/jest-dom'

// Mock do Supabase
export const mockSupabase = {
  auth: {
    getUser: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
  rpc: jest.fn(),
}

// Mock do contexto de autenticação
export const mockAuthContext = {
  user: null,
  loading: false,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
}

// Dados de teste mockados
export const mockData = {
  profiles: [
    {
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Usuário Teste',
      role: 'cliente',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
  ],
  mensagens: [
    {
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
    },
  ],
  analises: [
    {
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
    },
  ],
}
