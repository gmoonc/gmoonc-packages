import { renderHook } from '@testing-library/react';
import { useAnalises } from '../useAnalises';

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

describe('useAnalises', () => {
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

  it('deve carregar análises inicialmente', () => {
    const { result } = renderHook(() => useAnalises());

    // Verificar se o hook retorna as propriedades esperadas
    expect(result.current.analises).toBeDefined();
    expect(Array.isArray(result.current.analises)).toBe(true);
    expect(result.current.loading).toBeDefined();
    expect(result.current.error).toBeDefined();
  });

  it('deve ter função createAnalise', () => {
    const { result } = renderHook(() => useAnalises());

    expect(typeof result.current.createAnalise).toBe('function');
  });

  it('deve ter função updateAnalise', () => {
    const { result } = renderHook(() => useAnalises());

    expect(typeof result.current.updateAnalise).toBe('function');
  });

  it('deve ter função deleteAnalise', () => {
    const { result } = renderHook(() => useAnalises());

    expect(typeof result.current.deleteAnalise).toBe('function');
  });

  it('deve ter função fetchAnalises', () => {
    const { result } = renderHook(() => useAnalises());

    expect(typeof result.current.fetchAnalises).toBe('function');
  });

});
