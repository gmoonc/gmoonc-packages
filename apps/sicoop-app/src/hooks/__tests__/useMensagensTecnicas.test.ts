import { renderHook } from '@testing-library/react';
import { useMensagensTecnicas } from '../useMensagensTecnicas';
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

describe('useMensagensTecnicas', () => {
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
    const { result } = renderHook(() => useMensagensTecnicas());

    expect(result.current.mensagens).toEqual([]);
    expect(result.current.users).toEqual([]);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.fetchMensagens).toBe('function');
    expect(typeof result.current.fetchUsers).toBe('function');
    expect(typeof result.current.assignMensagem).toBe('function');
    expect(typeof result.current.updateMensagemStatus).toBe('function');
    expect(typeof result.current.deleteMensagem).toBe('function');
    expect(typeof result.current.updateMensagem).toBe('function');
    expect(typeof result.current.createMensagem).toBe('function');
  });

  it('deve retornar false quando usuário não está logado', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      emergencyReset: jest.fn()
    });

    const { result } = renderHook(() => useMensagensTecnicas());

    const createResult = await result.current.createMensagem({
      nome: 'Test',
      email: 'test@test.com',
      telefone: '11999999999',
      empresa_fazenda: 'Test',
      mensagem: 'Test',
      user_id: null,
      status: 'pendente'
    });

    expect(createResult).toBe(false);
  });
});
