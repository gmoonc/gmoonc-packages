/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotifications } from '../useNotifications';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// Mock do contexto de autenticação
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

// Mock do Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn()
  }
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('useNotifications', () => {
  const mockUser = {
    id: 'test-user-1',
    email: 'test@example.com',
    name: 'Usuário Teste',
    role: 'administrador'
  };

  // Helper para criar mock de query inicial (para useEffect)
  const createMockInitialQuery = () => ({
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue({
      data: [],
      error: null
    }),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis()
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock do useAuth
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      emergencyReset: jest.fn()
    } as any);

    // Mock básico do Supabase para useEffect inicial
    const mockInitialQuery = createMockInitialQuery();
    mockSupabase.from.mockReturnValue(mockInitialQuery as any);
    mockSupabase.rpc = jest.fn().mockResolvedValue({
      data: [],
      error: null
    });
  });

  describe('Estado Inicial', () => {
    it('deve retornar estado inicial correto', async () => {
      // Mock completo para evitar erros no useEffect
      const mockCategoriesQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      };

      const mockSettingsQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      };

      const mockLogsQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      };

      const mockUsersQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      };

      mockSupabase.from
        .mockReturnValueOnce(mockCategoriesQuery as any) // fetchCategories
        .mockReturnValueOnce(mockSettingsQuery as any) // fetchSettings
        .mockReturnValueOnce(mockLogsQuery as any) // fetchLogs
        .mockReturnValueOnce(mockUsersQuery as any); // fetchAdminUsers

      mockSupabase.rpc = jest.fn().mockResolvedValue({
        data: [],
        error: null
      });

      const { result } = renderHook(() => useNotifications());

      // Aguardar o useEffect executar
      await waitFor(() => {
        expect(result.current.loadingCategories).toBe(false);
        expect(result.current.loadingSettings).toBe(false);
        expect(result.current.loadingLogs).toBe(false);
        expect(result.current.loadingUsers).toBe(false);
      });

      expect(result.current.categories).toEqual([]);
      expect(result.current.settings).toEqual([]);
      expect(result.current.logs).toEqual([]);
      expect(result.current.adminUsers).toEqual([]);
      expect(result.current.errorCategories).toBe(null);
      expect(result.current.errorSettings).toBe(null);
      expect(result.current.errorLogs).toBe(null);
    });

    it('deve ter todas as funções disponíveis', () => {
      const { result } = renderHook(() => useNotifications());

      expect(typeof result.current.fetchCategories).toBe('function');
      expect(typeof result.current.fetchSettings).toBe('function');
      expect(typeof result.current.fetchLogs).toBe('function');
      expect(typeof result.current.fetchAdminUsers).toBe('function');
      expect(typeof result.current.createCategory).toBe('function');
      expect(typeof result.current.updateCategory).toBe('function');
      expect(typeof result.current.deleteCategory).toBe('function');
      expect(typeof result.current.createSetting).toBe('function');
      expect(typeof result.current.updateSetting).toBe('function');
      expect(typeof result.current.deleteSetting).toBe('function');
      expect(typeof result.current.processPendingNotifications).toBe('function');
    });
  });

  describe('fetchCategories', () => {
    it('deve buscar categorias com sucesso', async () => {
      const mockCategories = [
        {
          id: '1',
          name: 'nova_mensagem',
          display_name: 'Nova Mensagem',
          description: 'Teste',
          is_active: true,
          email_template_subject: 'Assunto',
          email_template_body: 'Corpo',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockCategories,
          error: null
        })
      };

      // Configurar mocks para useEffect inicial + fetchCategories
      const mockInitialQuery = createMockInitialQuery();
      mockSupabase.from
        .mockReturnValueOnce(mockInitialQuery as any) // fetchCategories no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchSettings no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchLogs no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchAdminUsers no useEffect
        .mockReturnValueOnce(mockQuery as any); // fetchCategories manual

      const { result } = renderHook(() => useNotifications());

      // Aguardar useEffect inicial
      await waitFor(() => {
        expect(result.current.loadingCategories).toBe(false);
      });

      await act(async () => {
        await result.current.fetchCategories();
      });

      await waitFor(() => {
        expect(result.current.loadingCategories).toBe(false);
      });

      expect(result.current.categories).toHaveLength(1);
      expect(result.current.categories[0].display_name).toBe('Nova Mensagem');
      expect(result.current.errorCategories).toBe(null);
    });

    it('deve tratar erro ao buscar categorias', async () => {
      const mockError = { message: 'Erro ao buscar' };
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: mockError
        })
      };

      // Configurar mocks para useEffect inicial + fetchCategories
      const mockInitialQuery = createMockInitialQuery();
      mockSupabase.from
        .mockReturnValueOnce(mockInitialQuery as any) // fetchCategories no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchSettings no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchLogs no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchAdminUsers no useEffect
        .mockReturnValueOnce(mockQuery as any); // fetchCategories manual

      const { result } = renderHook(() => useNotifications());

      // Aguardar useEffect inicial
      await waitFor(() => {
        expect(result.current.loadingCategories).toBe(false);
      });

      await act(async () => {
        await result.current.fetchCategories();
      });

      await waitFor(() => {
        expect(result.current.loadingCategories).toBe(false);
      });

      expect(result.current.errorCategories).toBe('Erro ao buscar categorias');
      expect(result.current.categories).toEqual([]);
    });

    it('deve definir loadingCategories durante busca', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnValue(promise)
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.fetchCategories();
      });

      expect(result.current.loadingCategories).toBe(true);

      await act(async () => {
        resolvePromise!({ data: [], error: null });
        await promise;
      });

      await waitFor(() => {
        expect(result.current.loadingCategories).toBe(false);
      });
    });
  });

  describe('createCategory', () => {
    it('deve criar categoria com sucesso', async () => {
      const categoryData = {
        display_name: 'Nova Categoria',
        description: 'Descrição',
        email_template_subject: 'Assunto',
        email_template_body: 'Corpo',
        is_active: true
      };

      const mockInsert = {
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: null
        })
      };

      const mockFetchQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      };

      // Configurar mocks para evitar erros no useEffect inicial
      const mockInitialQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [],
          error: null
        }),
        eq: jest.fn().mockReturnThis()
      };

      mockSupabase.from
        .mockReturnValueOnce(mockInitialQuery as any) // fetchCategories no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchSettings no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchLogs no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchAdminUsers no useEffect
        .mockReturnValueOnce(mockInsert as any) // createCategory
        .mockReturnValueOnce(mockFetchQuery as any); // fetchCategories após criar

      mockSupabase.rpc = jest.fn().mockResolvedValue({
        data: [],
        error: null
      });

      const { result } = renderHook(() => useNotifications());

      // Aguardar useEffect inicial
      await waitFor(() => {
        expect(result.current.loadingCategories).toBe(false);
      });

      let success = false;
      await act(async () => {
        success = await result.current.createCategory(categoryData);
      });

      expect(success).toBe(true);
      expect(mockInsert.insert).toHaveBeenCalledWith([{
        name: 'nova_categoria',
        display_name: 'Nova Categoria',
        description: 'Descrição',
        email_template_subject: 'Assunto',
        email_template_body: 'Corpo',
        is_active: true
      }]);
    });

    it('deve retornar false quando criação falha', async () => {
      const categoryData = {
        display_name: 'Nova Categoria',
        description: 'Descrição',
        email_template_subject: 'Assunto',
        email_template_body: 'Corpo',
        is_active: true
      };

      const mockInsert = {
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Erro ao criar' }
        })
      };

      mockSupabase.from.mockReturnValue(mockInsert as any);

      const { result } = renderHook(() => useNotifications());

      let success = true;
      await act(async () => {
        success = await result.current.createCategory(categoryData);
      });

      expect(success).toBe(false);
      expect(result.current.errorCategories).toBe('Erro ao criar categoria');
    });

    it('deve converter display_name para name corretamente', async () => {
      const categoryData = {
        display_name: 'Nova Mensagem Importante',
        description: 'Descrição',
        email_template_subject: 'Assunto',
        email_template_body: 'Corpo',
        is_active: true
      };

      const mockInsert = {
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: null
        })
      };

      const mockFetchQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      };

      // Configurar mocks para evitar erros no useEffect inicial
      const mockInitialQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [],
          error: null
        }),
        eq: jest.fn().mockReturnThis()
      };

      mockSupabase.from
        .mockReturnValueOnce(mockInitialQuery as any) // fetchCategories no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchSettings no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchLogs no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchAdminUsers no useEffect
        .mockReturnValueOnce(mockInsert as any) // createCategory
        .mockReturnValueOnce(mockFetchQuery as any); // fetchCategories após criar

      mockSupabase.rpc = jest.fn().mockResolvedValue({
        data: [],
        error: null
      });

      const { result } = renderHook(() => useNotifications());

      // Aguardar useEffect inicial
      await waitFor(() => {
        expect(result.current.loadingCategories).toBe(false);
      });

      await act(async () => {
        await result.current.createCategory(categoryData);
      });

      expect(mockInsert.insert).toHaveBeenCalledWith([{
        name: 'nova_mensagem_importante',
        display_name: 'Nova Mensagem Importante',
        description: 'Descrição',
        email_template_subject: 'Assunto',
        email_template_body: 'Corpo',
        is_active: true
      }]);
    });
  });

  describe('updateCategory', () => {
    it('deve atualizar categoria com sucesso', async () => {
      const updateData = {
        display_name: 'Categoria Atualizada',
        is_active: false
      };

      const mockUpdate = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null
        })
      };

      const mockFetchQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      };

      // Configurar mocks para evitar erros no useEffect inicial
      const mockInitialQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [],
          error: null
        }),
        eq: jest.fn().mockReturnThis()
      };

      mockSupabase.from
        .mockReturnValueOnce(mockInitialQuery as any) // fetchCategories no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchSettings no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchLogs no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchAdminUsers no useEffect
        .mockReturnValueOnce(mockUpdate as any) // updateCategory
        .mockReturnValueOnce(mockFetchQuery as any); // fetchCategories após atualizar

      mockSupabase.rpc = jest.fn().mockResolvedValue({
        data: [],
        error: null
      });

      const { result } = renderHook(() => useNotifications());

      // Aguardar useEffect inicial
      await waitFor(() => {
        expect(result.current.loadingCategories).toBe(false);
      });

      let success = false;
      await act(async () => {
        success = await result.current.updateCategory('cat-1', updateData);
      });

      expect(success).toBe(true);
      expect(mockUpdate.update).toHaveBeenCalledWith({
        display_name: 'Categoria Atualizada',
        name: 'categoria_atualizada',
        is_active: false
      });
      expect(mockUpdate.eq).toHaveBeenCalledWith('id', 'cat-1');
    });

    it('deve retornar false quando atualização falha', async () => {
      const updateData = {
        display_name: 'Categoria Atualizada'
      };

      const mockUpdate = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Erro ao atualizar' }
        })
      };

      mockSupabase.from.mockReturnValue(mockUpdate as any);

      const { result } = renderHook(() => useNotifications());

      let success = true;
      await act(async () => {
        success = await result.current.updateCategory('cat-1', updateData);
      });

      expect(success).toBe(false);
      expect(result.current.errorCategories).toBe('Erro ao atualizar categoria');
    });
  });

  describe('deleteCategory', () => {
    it('deve deletar categoria com sucesso', async () => {
      const mockDelete = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null
        })
      };

      const mockFetchQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      };

      // Configurar mocks para evitar erros no useEffect inicial
      const mockInitialQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [],
          error: null
        }),
        eq: jest.fn().mockReturnThis()
      };

      mockSupabase.from
        .mockReturnValueOnce(mockInitialQuery as any) // fetchCategories no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchSettings no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchLogs no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchAdminUsers no useEffect
        .mockReturnValueOnce(mockDelete as any) // deleteCategory
        .mockReturnValueOnce(mockFetchQuery as any); // fetchCategories após deletar

      mockSupabase.rpc = jest.fn().mockResolvedValue({
        data: [],
        error: null
      });

      const { result } = renderHook(() => useNotifications());

      // Aguardar useEffect inicial
      await waitFor(() => {
        expect(result.current.loadingCategories).toBe(false);
      });

      let success = false;
      await act(async () => {
        success = await result.current.deleteCategory('cat-1');
      });

      expect(success).toBe(true);
      expect(mockDelete.delete).toHaveBeenCalled();
      expect(mockDelete.eq).toHaveBeenCalledWith('id', 'cat-1');
    });

    it('deve retornar false quando exclusão falha', async () => {
      const mockDelete = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Erro ao deletar' }
        })
      };

      mockSupabase.from.mockReturnValue(mockDelete as any);

      const { result } = renderHook(() => useNotifications());

      let success = true;
      await act(async () => {
        success = await result.current.deleteCategory('cat-1');
      });

      expect(success).toBe(false);
      expect(result.current.errorCategories).toBe('Erro ao deletar categoria');
    });
  });

  describe('fetchSettings', () => {
    it('deve buscar configurações com sucesso', async () => {
      const mockSettings = [
        {
          id: '1',
          user_id: 'user-1',
          category_id: 'cat-1',
          is_enabled: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          user: {
            id: 'user-1',
            name: 'Admin',
            email: 'admin@test.com',
            role: 'administrador'
          },
          category: {
            id: 'cat-1',
            name: 'nova_mensagem',
            display_name: 'Nova Mensagem',
            description: null,
            is_active: true,
            email_template_subject: 'Assunto',
            email_template_body: 'Corpo',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockSettings,
          error: null
        })
      };

      // Configurar mocks para useEffect inicial + fetchSettings
      const mockInitialQuery = createMockInitialQuery();
      mockSupabase.from
        .mockReturnValueOnce(mockInitialQuery as any) // fetchCategories no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchSettings no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchLogs no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchAdminUsers no useEffect
        .mockReturnValueOnce(mockQuery as any); // fetchSettings manual

      const { result } = renderHook(() => useNotifications());

      // Aguardar useEffect inicial
      await waitFor(() => {
        expect(result.current.loadingSettings).toBe(false);
      });

      await act(async () => {
        await result.current.fetchSettings();
      });

      await waitFor(() => {
        expect(result.current.loadingSettings).toBe(false);
      });

      expect(result.current.settings).toHaveLength(1);
      expect(result.current.errorSettings).toBe(null);
    });

    it('deve tratar erro ao buscar configurações', async () => {
      const mockError = { message: 'Erro ao buscar' };
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: mockError
        })
      };

      // Configurar mocks para useEffect inicial + fetchSettings
      const mockInitialQuery = createMockInitialQuery();
      mockSupabase.from
        .mockReturnValueOnce(mockInitialQuery as any) // fetchCategories no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchSettings no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchLogs no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchAdminUsers no useEffect
        .mockReturnValueOnce(mockQuery as any); // fetchSettings manual

      const { result } = renderHook(() => useNotifications());

      // Aguardar useEffect inicial
      await waitFor(() => {
        expect(result.current.loadingSettings).toBe(false);
      });

      await act(async () => {
        await result.current.fetchSettings();
      });

      await waitFor(() => {
        expect(result.current.loadingSettings).toBe(false);
      });

      expect(result.current.errorSettings).toBe('Erro ao buscar configurações');
      expect(result.current.settings).toEqual([]);
    });

    it('deve tratar relacionamentos quebrados (user/category null)', async () => {
      const mockSettings = [
        {
          id: '1',
          user_id: 'user-1',
          category_id: 'cat-1',
          is_enabled: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          user: null,
          category: { message: 'Erro de relacionamento' }
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockSettings,
          error: null
        })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.fetchSettings();
      });

      await waitFor(() => {
        expect(result.current.loadingSettings).toBe(false);
      });

      expect(result.current.settings).toHaveLength(1);
      expect(result.current.settings[0].user).toBeUndefined();
      expect(result.current.settings[0].category).toBeUndefined();
    });
  });

  describe('createSetting', () => {
    it('deve criar configuração com sucesso', async () => {
      const settingData = {
        user_id: 'user-1',
        category_id: 'cat-1',
        is_enabled: true
      };

      const mockInsert = {
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: null
        })
      };

      const mockFetchQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      };

      // Configurar mocks para evitar erros no useEffect inicial
      const mockInitialQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [],
          error: null
        }),
        eq: jest.fn().mockReturnThis()
      };

      mockSupabase.from
        .mockReturnValueOnce(mockInitialQuery as any) // fetchCategories no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchSettings no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchLogs no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchAdminUsers no useEffect
        .mockReturnValueOnce(mockInsert as any) // createSetting
        .mockReturnValueOnce(mockFetchQuery as any); // fetchSettings após criar

      mockSupabase.rpc = jest.fn().mockResolvedValue({
        data: [],
        error: null
      });

      const { result } = renderHook(() => useNotifications());

      // Aguardar useEffect inicial
      await waitFor(() => {
        expect(result.current.loadingSettings).toBe(false);
      });

      let success = false;
      await act(async () => {
        success = await result.current.createSetting(settingData);
      });

      expect(success).toBe(true);
      expect(mockInsert.insert).toHaveBeenCalledWith([settingData]);
    });

    it('deve retornar false quando criação falha', async () => {
      const settingData = {
        user_id: 'user-1',
        category_id: 'cat-1',
        is_enabled: true
      };

      const mockInsert = {
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Erro ao criar' }
        })
      };

      mockSupabase.from.mockReturnValue(mockInsert as any);

      const { result } = renderHook(() => useNotifications());

      let success = true;
      await act(async () => {
        success = await result.current.createSetting(settingData);
      });

      expect(success).toBe(false);
      expect(result.current.errorSettings).toBe('Erro ao criar configuração');
    });
  });

  describe('updateSetting', () => {
    it('deve atualizar configuração com sucesso', async () => {
      const updateData = {
        is_enabled: false
      };

      const mockUpdate = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null
        })
      };

      const mockFetchQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      };

      // Configurar mocks para evitar erros no useEffect inicial
      const mockInitialQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [],
          error: null
        }),
        eq: jest.fn().mockReturnThis()
      };

      mockSupabase.from
        .mockReturnValueOnce(mockInitialQuery as any) // fetchCategories no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchSettings no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchLogs no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchAdminUsers no useEffect
        .mockReturnValueOnce(mockUpdate as any) // updateSetting
        .mockReturnValueOnce(mockFetchQuery as any); // fetchSettings após atualizar

      mockSupabase.rpc = jest.fn().mockResolvedValue({
        data: [],
        error: null
      });

      const { result } = renderHook(() => useNotifications());

      // Aguardar useEffect inicial
      await waitFor(() => {
        expect(result.current.loadingSettings).toBe(false);
      });

      let success = false;
      await act(async () => {
        success = await result.current.updateSetting('set-1', updateData);
      });

      expect(success).toBe(true);
      expect(mockUpdate.update).toHaveBeenCalledWith(updateData);
      expect(mockUpdate.eq).toHaveBeenCalledWith('id', 'set-1');
    });

    it('deve retornar false quando atualização falha', async () => {
      const updateData = {
        is_enabled: false
      };

      const mockUpdate = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Erro ao atualizar' }
        })
      };

      mockSupabase.from.mockReturnValue(mockUpdate as any);

      const { result } = renderHook(() => useNotifications());

      let success = true;
      await act(async () => {
        success = await result.current.updateSetting('set-1', updateData);
      });

      expect(success).toBe(false);
      expect(result.current.errorSettings).toBe('Erro ao atualizar configuração');
    });
  });

  describe('deleteSetting', () => {
    it('deve deletar configuração com sucesso', async () => {
      const mockDelete = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null
        })
      };

      const mockFetchQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      };

      // Configurar mocks para evitar erros no useEffect inicial
      const mockInitialQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [],
          error: null
        }),
        eq: jest.fn().mockReturnThis()
      };

      mockSupabase.from
        .mockReturnValueOnce(mockInitialQuery as any) // fetchCategories no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchSettings no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchLogs no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchAdminUsers no useEffect
        .mockReturnValueOnce(mockDelete as any) // deleteSetting
        .mockReturnValueOnce(mockFetchQuery as any); // fetchSettings após deletar

      mockSupabase.rpc = jest.fn().mockResolvedValue({
        data: [],
        error: null
      });

      const { result } = renderHook(() => useNotifications());

      // Aguardar useEffect inicial
      await waitFor(() => {
        expect(result.current.loadingSettings).toBe(false);
      });

      let success = false;
      await act(async () => {
        success = await result.current.deleteSetting('set-1');
      });

      expect(success).toBe(true);
      expect(mockDelete.delete).toHaveBeenCalled();
      expect(mockDelete.eq).toHaveBeenCalledWith('id', 'set-1');
    });

    it('deve retornar false quando exclusão falha', async () => {
      const mockDelete = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Erro ao deletar' }
        })
      };

      mockSupabase.from.mockReturnValue(mockDelete as any);

      const { result } = renderHook(() => useNotifications());

      let success = true;
      await act(async () => {
        success = await result.current.deleteSetting('set-1');
      });

      expect(success).toBe(false);
      expect(result.current.errorSettings).toBe('Erro ao deletar configuração');
    });
  });

  describe('fetchLogs', () => {
    it('deve buscar logs com sucesso', async () => {
      const mockLogs = [
        {
          id: '1',
          category_id: 'cat-1',
          user_id: 'user-1',
          entity_type: 'mensagem',
          entity_id: 'msg-1',
          email_sent: true,
          email_error: null,
          sent_at: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z'
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: mockLogs,
          error: null
        })
      };

      // Configurar mocks para useEffect inicial + fetchLogs
      const mockInitialQuery = createMockInitialQuery();
      mockSupabase.from
        .mockReturnValueOnce(mockInitialQuery as any) // fetchCategories no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchSettings no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchLogs no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchAdminUsers no useEffect
        .mockReturnValueOnce(mockQuery as any); // fetchLogs manual

      const { result } = renderHook(() => useNotifications());

      // Aguardar useEffect inicial
      await waitFor(() => {
        expect(result.current.loadingLogs).toBe(false);
      });

      await act(async () => {
        await result.current.fetchLogs();
      });

      await waitFor(() => {
        expect(result.current.loadingLogs).toBe(false);
      });

      expect(result.current.logs).toHaveLength(1);
      expect(result.current.errorLogs).toBe(null);
    });

    it('deve tratar erro ao buscar logs', async () => {
      const mockError = { message: 'Erro ao buscar' };
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: null,
          error: mockError
        })
      };

      // Configurar mocks para useEffect inicial + fetchLogs
      const mockInitialQuery = createMockInitialQuery();
      mockSupabase.from
        .mockReturnValueOnce(mockInitialQuery as any) // fetchCategories no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchSettings no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchLogs no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchAdminUsers no useEffect
        .mockReturnValueOnce(mockQuery as any); // fetchLogs manual

      const { result } = renderHook(() => useNotifications());

      // Aguardar useEffect inicial
      await waitFor(() => {
        expect(result.current.loadingLogs).toBe(false);
      });

      await act(async () => {
        await result.current.fetchLogs();
      });

      await waitFor(() => {
        expect(result.current.loadingLogs).toBe(false);
      });

      expect(result.current.errorLogs).toBe('Erro ao buscar logs');
      expect(result.current.logs).toEqual([]);
    });
  });

  describe('processPendingNotifications', () => {
    it('deve processar notificações pendentes com sucesso', async () => {
      const mockFetchQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      };

      // Configurar mocks para useEffect inicial + processPendingNotifications
      const mockInitialQuery = createMockInitialQuery();
      mockSupabase.from
        .mockReturnValueOnce(mockInitialQuery as any) // fetchCategories no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchSettings no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchLogs no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchAdminUsers no useEffect
        .mockReturnValueOnce(mockFetchQuery as any); // fetchLogs após processar

      mockSupabase.rpc
        .mockResolvedValueOnce({ data: [], error: null }) // useEffect
        .mockResolvedValueOnce({ data: { processed: 3 }, error: null }); // processPendingNotifications

      const { result } = renderHook(() => useNotifications());

      // Aguardar useEffect inicial
      await waitFor(() => {
        expect(result.current.loadingLogs).toBe(false);
      });

      let success = false;
      await act(async () => {
        success = await result.current.processPendingNotifications();
      });

      expect(success).toBe(true);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('process_pending_notifications');
    });

    it('deve retornar false quando processamento falha', async () => {
      // Configurar mocks para useEffect inicial
      const mockInitialQuery = createMockInitialQuery();

      mockSupabase.from
        .mockReturnValueOnce(mockInitialQuery as any) // fetchCategories no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchSettings no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchLogs no useEffect
        .mockReturnValueOnce(mockInitialQuery as any); // fetchAdminUsers no useEffect

      // O useEffect inicial não chama RPC, então só precisamos mockar a chamada de processPendingNotifications
      mockSupabase.rpc = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Erro ao processar' }
      });

      const { result } = renderHook(() => useNotifications());

      // Aguardar useEffect inicial
      await waitFor(() => {
        expect(result.current.loadingLogs).toBe(false);
      });

      let success = true;
      await act(async () => {
        success = await result.current.processPendingNotifications();
      });

      expect(success).toBe(false);
      expect(result.current.errorLogs).toBe('Erro ao processar notificações');
    });
  });

  describe('fetchAdminUsers', () => {
    it('deve buscar usuários administradores com sucesso', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          name: 'Admin 1',
          email: 'admin1@test.com',
          role: 'administrador'
        },
        {
          id: 'user-2',
          name: 'Admin 2',
          email: 'admin2@test.com',
          role: 'administrador'
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockUsers,
          error: null
        })
      };

      // Configurar mocks para useEffect inicial + fetchAdminUsers
      const mockInitialQuery = createMockInitialQuery();
      mockSupabase.from
        .mockReturnValueOnce(mockInitialQuery as any) // fetchCategories no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchSettings no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchLogs no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchAdminUsers no useEffect
        .mockReturnValueOnce(mockQuery as any); // fetchAdminUsers manual

      const { result } = renderHook(() => useNotifications());

      // Aguardar useEffect inicial
      await waitFor(() => {
        expect(result.current.loadingUsers).toBe(false);
      });

      await act(async () => {
        await result.current.fetchAdminUsers();
      });

      await waitFor(() => {
        expect(result.current.loadingUsers).toBe(false);
      });

      expect(result.current.adminUsers).toHaveLength(2);
      expect(result.current.adminUsers[0].name).toBe('Admin 1');
    });

    it('deve tratar erro ao buscar usuários administradores', async () => {
      const mockError = { message: 'Erro ao buscar' };
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: mockError
        })
      };

      // Configurar mocks para useEffect inicial + fetchAdminUsers
      const mockInitialQuery = createMockInitialQuery();
      mockSupabase.from
        .mockReturnValueOnce(mockInitialQuery as any) // fetchCategories no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchSettings no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchLogs no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchAdminUsers no useEffect
        .mockReturnValueOnce(mockQuery as any); // fetchAdminUsers manual

      const { result } = renderHook(() => useNotifications());

      // Aguardar useEffect inicial
      await waitFor(() => {
        expect(result.current.loadingUsers).toBe(false);
      });

      await act(async () => {
        await result.current.fetchAdminUsers();
      });

      await waitFor(() => {
        expect(result.current.loadingUsers).toBe(false);
      });

      // fetchAdminUsers não define errorAdminUsers, apenas loga o erro
      expect(result.current.adminUsers).toEqual([]);
    });

    it('deve tratar role null (deve defaultar para user)', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          name: 'Admin 1',
          email: 'admin1@test.com',
          role: null
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockUsers,
          error: null
        })
      };

      // Configurar mocks para useEffect inicial + fetchAdminUsers
      const mockInitialQuery = createMockInitialQuery();
      mockSupabase.from
        .mockReturnValueOnce(mockInitialQuery as any) // fetchCategories no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchSettings no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchLogs no useEffect
        .mockReturnValueOnce(mockInitialQuery as any) // fetchAdminUsers no useEffect
        .mockReturnValueOnce(mockQuery as any); // fetchAdminUsers manual

      const { result } = renderHook(() => useNotifications());

      // Aguardar useEffect inicial
      await waitFor(() => {
        expect(result.current.loadingUsers).toBe(false);
      });

      await act(async () => {
        await result.current.fetchAdminUsers();
      });

      await waitFor(() => {
        expect(result.current.loadingUsers).toBe(false);
      });

      expect(result.current.adminUsers[0].role).toBe('user');
    });
  });

  describe('Comportamento com usuário autenticado/não autenticado', () => {
    it('deve carregar dados iniciais quando usuário está autenticado', async () => {
      const mockCategoriesQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      };

      const mockSettingsQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      };

      const mockLogsQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      };

      const mockUsersQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      };

      mockSupabase.from
        .mockReturnValueOnce(mockCategoriesQuery as any)
        .mockReturnValueOnce(mockSettingsQuery as any)
        .mockReturnValueOnce(mockLogsQuery as any)
        .mockReturnValueOnce(mockUsersQuery as any);

      mockSupabase.rpc = jest.fn().mockResolvedValue({
        data: [],
        error: null
      });

      renderHook(() => useNotifications());

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('notification_categories');
        expect(mockSupabase.from).toHaveBeenCalledWith('notification_settings');
        expect(mockSupabase.from).toHaveBeenCalledWith('notification_logs');
        expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
      });
    });

    it('não deve carregar dados quando usuário não está autenticado', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        login: jest.fn(),
        logout: jest.fn(),
        emergencyReset: jest.fn()
      } as any);

      renderHook(() => useNotifications());

      // Aguardar um pouco para garantir que useEffect não executou
      await new Promise(resolve => setTimeout(resolve, 100));

      // Não deve chamar fetchCategories, fetchSettings, etc. quando user é null
      // O useEffect verifica se user existe antes de chamar as funções
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });
  });
});
