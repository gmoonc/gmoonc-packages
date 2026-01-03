import { renderHook } from '@testing-library/react';
import { useAnalisesTecnicas } from '../useAnalisesTecnicas';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

// Mock do useAuth
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

// Mock do Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('useAnalisesTecnicas', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      emergencyReset: jest.fn()
    });

    // Mock do Supabase para evitar erros no useEffect
    const mockQuery = {
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      })
    };

    mockSupabase.from.mockReturnValue(mockQuery as jest.Mocked<typeof mockQuery>);
  });

  it('deve retornar estado inicial correto', () => {
    const { result } = renderHook(() => useAnalisesTecnicas());

    expect(result.current.analises).toEqual([]);
    expect(result.current.users).toEqual([]);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.fetchAnalises).toBe('function');
    expect(typeof result.current.fetchUsers).toBe('function');
    expect(typeof result.current.assignAnalise).toBe('function');
    expect(typeof result.current.updateAnaliseStatus).toBe('function');
    expect(typeof result.current.deleteAnalise).toBe('function');
    expect(typeof result.current.updateAnalise).toBe('function');
    expect(typeof result.current.createAnalise).toBe('function');
  });

  it('deve retornar false quando usuário não está logado', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      emergencyReset: jest.fn()
    });

    const { result } = renderHook(() => useAnalisesTecnicas());

    const createResult = await result.current.createAnalise({
      nome: 'Test',
      email: 'test@test.com',
      telefone: '11999999999',
      nome_fazenda: 'Test',
      area_fazenda_ha: '100',
      latitude: '-23.5505',
      longitude: '-46.6333',
      observacoes: 'Test',
      user_id: null,
      status: 'pendente'
    });

    expect(createResult).toBe(null);
  });
});
