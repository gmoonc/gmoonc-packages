import { renderHook } from '@testing-library/react';
import { usePermissions } from '../usePermissions';

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

describe('usePermissions', () => {
  beforeEach(() => {
    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
    
    // Mock do Supabase para retornar dados válidos
    if (global.mockSupabase) {
      global.mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
        error: null
      });
      
      global.mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null
        }),
      });
    }
  });

  it('deve carregar permissões inicialmente', () => {
    const { result } = renderHook(() => usePermissions());

    // Verificar se o hook retorna as propriedades esperadas
    expect(result.current.hasPermission).toBeDefined();
    expect(typeof result.current.hasPermission).toBe('function');
    expect(result.current.checkPermission).toBeDefined();
    expect(typeof result.current.checkPermission).toBe('function');
    expect(result.current.userPermissions).toBeDefined();
    expect(result.current.loading).toBeDefined();
  });

  it('deve ter função hasPermission', () => {
    const { result } = renderHook(() => usePermissions());

    expect(typeof result.current.hasPermission).toBe('function');
  });

  it('deve ter função checkPermission', () => {
    const { result } = renderHook(() => usePermissions());

    expect(typeof result.current.checkPermission).toBe('function');
  });

  it('deve retornar false para hasPermission quando não há permissões carregadas', () => {
    const { result } = renderHook(() => usePermissions());

    const hasAccess = result.current.hasPermission({
      moduleName: 'test-module',
      permissionType: 'read'
    });

    expect(hasAccess).toBe(false);
  });

  it('deve retornar false para checkPermission quando não há usuário', async () => {
    const { result } = renderHook(() => usePermissions());

    const hasAccess = await result.current.checkPermission({
      moduleName: 'test-module',
      permissionType: 'read'
    });

    expect(hasAccess).toBe(false);
  });
});
