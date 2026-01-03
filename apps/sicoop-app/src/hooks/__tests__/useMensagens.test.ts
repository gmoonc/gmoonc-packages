import { renderHook } from '@testing-library/react';
import { useMensagens } from '../useMensagens';

// Mock do contexto de autenticação
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Usuário Teste',
      role: 'cliente',
    },
    loading: false,
  }),
}));

describe('useMensagens', () => {
  beforeEach(() => {
    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
    
    // Mock do Supabase para retornar dados válidos
    if (global.mockSupabase) {
      global.mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: '1', nome: 'Teste', email: 'test@test.com' },
          error: null
        }),
      });
    }
  });

  it('deve carregar mensagens inicialmente', () => {
    const { result } = renderHook(() => useMensagens());

    // Verificar se o hook retorna as propriedades esperadas
    expect(result.current.mensagens).toBeDefined();
    expect(Array.isArray(result.current.mensagens)).toBe(true);
    expect(result.current.loading).toBeDefined();
    expect(result.current.error).toBeDefined();
  });

  it('deve ter função createMensagem', () => {
    const { result } = renderHook(() => useMensagens());

    expect(typeof result.current.createMensagem).toBe('function');
  });

  it('deve ter função updateMensagem', () => {
    const { result } = renderHook(() => useMensagens());

    expect(typeof result.current.updateMensagem).toBe('function');
  });

  it('deve ter função deleteMensagem', () => {
    const { result } = renderHook(() => useMensagens());

    expect(typeof result.current.deleteMensagem).toBe('function');
  });

  it('deve ter função fetchMensagens', () => {
    const { result } = renderHook(() => useMensagens());

    expect(typeof result.current.fetchMensagens).toBe('function');
  });
});
