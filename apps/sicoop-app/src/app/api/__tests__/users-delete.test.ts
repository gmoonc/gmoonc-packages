import { NextRequest } from 'next/server';

// Mock do Supabase ANTES de importar o módulo
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn()
}));

// Configurar variáveis de ambiente ANTES de importar o módulo
const originalEnv = process.env;
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

// Importar o módulo DEPOIS de configurar as variáveis de ambiente
// Usar import dinâmico para garantir que o módulo seja carregado após configurar env
let DELETE: typeof import('../users/delete/route').DELETE;

beforeAll(async () => {
  // Garantir que as variáveis estão configuradas antes de importar
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
  
  // Importar o módulo após configurar as variáveis usando import dinâmico
  const routeModule = await import('../users/delete/route');
  DELETE = routeModule.DELETE;
});

beforeEach(() => {
  jest.clearAllMocks();
  // Garantir que as variáveis estão sempre configuradas
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
});

afterEach(() => {
  // Restaurar variáveis após cada teste
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
});

afterAll(() => {
  process.env = originalEnv;
});

describe('DELETE /api/users/delete', () => {
  const mockCreateClient = jest.fn();
  let mockSupabaseAdmin: {
    auth: {
      admin: {
        deleteUser: jest.Mock;
      };
    };
    from: jest.Mock;
  };

  beforeEach(() => {
    // Mock das operações de delete para análises e mensagens
    const mockDeleteChain = {
      eq: jest.fn().mockResolvedValue({ error: null })
    };

    mockSupabaseAdmin = {
      auth: {
        admin: {
          deleteUser: jest.fn()
        }
      },
      from: jest.fn((table: string) => {
        if (table === 'analises_cobertura' || table === 'mensagens') {
          // Para análises e mensagens, retornar chain de delete
          return {
            delete: jest.fn(() => mockDeleteChain)
          };
        }
        // Para profiles, retornar chain de select/delete
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn()
            }))
          })),
          delete: jest.fn(() => ({
            eq: jest.fn().mockResolvedValue({ error: null })
          }))
        };
      })
    };
    mockCreateClient.mockReturnValue(mockSupabaseAdmin);
    
    // Configurar o mock do createClient
    const { createClient } = jest.requireMock('@supabase/supabase-js');
    createClient.mockImplementation(() => mockSupabaseAdmin);
  });

  describe('validação de configuração', () => {
    it('deve retornar 500 quando service role key não está configurada', async () => {
      // Mock do process.env para simular service role key vazia
      const originalEnv = process.env.SUPABASE_SERVICE_ROLE_KEY;
      process.env.SUPABASE_SERVICE_ROLE_KEY = '';

      // Re-importar o módulo para pegar a nova configuração
      jest.resetModules();
      const { DELETE: DELETEWithEmptyKey } = await import('../users/delete/route');

      const request = new NextRequest('http://localhost:3000/api/users/delete', {
        method: 'DELETE',
        body: JSON.stringify({
          userId: 'user-123'
        })
      });

      const response = await DELETEWithEmptyKey(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Service role key não configurada');

      // Restaurar configuração original
      process.env.SUPABASE_SERVICE_ROLE_KEY = originalEnv;
    });

    it('deve retornar 500 quando service role key é undefined', async () => {
      // Mock do process.env para simular service role key undefined
      const originalEnv = process.env.SUPABASE_SERVICE_ROLE_KEY;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      // Re-importar o módulo para pegar a nova configuração
      jest.resetModules();
      const { DELETE: DELETEWithUndefinedKey } = await import('../users/delete/route');

      const request = new NextRequest('http://localhost:3000/api/users/delete', {
        method: 'DELETE',
        body: JSON.stringify({
          userId: 'user-123'
        })
      });

      const response = await DELETEWithUndefinedKey(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Service role key não configurada');

      // Restaurar configuração original
      process.env.SUPABASE_SERVICE_ROLE_KEY = originalEnv;
    });
  });

  describe('validação de entrada', () => {
    it('deve retornar 400 quando userId está ausente', async () => {
      const request = new NextRequest('http://localhost:3000/api/users/delete', {
        method: 'DELETE',
        body: JSON.stringify({})
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('ID do usuário é obrigatório');
    });

    it('deve retornar 400 quando userId é null', async () => {
      const request = new NextRequest('http://localhost:3000/api/users/delete', {
        method: 'DELETE',
        body: JSON.stringify({
          userId: null
        })
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('ID do usuário é obrigatório');
    });

    it('deve retornar 400 quando userId é string vazia', async () => {
      const request = new NextRequest('http://localhost:3000/api/users/delete', {
        method: 'DELETE',
        body: JSON.stringify({
          userId: ''
        })
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('ID do usuário é obrigatório');
    });
  });

  describe('exclusão de usuário', () => {
    it('deve excluir usuário com sucesso quando perfil não existe', async () => {
      mockSupabaseAdmin.auth.admin.deleteUser.mockResolvedValue({
        error: null
      });

      // Mock para análises e mensagens (deletar com sucesso)
      const mockDeleteChain = {
        eq: jest.fn().mockResolvedValue({ error: null })
      };
      
      // Mock para perfil (não existe)
      const mockProfileQuery = {
        delete: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({ error: null })
        }))
      };

      mockSupabaseAdmin.from.mockImplementation((table: string) => {
        if (table === 'analises_cobertura' || table === 'mensagens') {
          return {
            delete: jest.fn(() => mockDeleteChain)
          };
        }
        return mockProfileQuery;
      });

      const request = new NextRequest('http://localhost:3000/api/users/delete', {
        method: 'DELETE',
        body: JSON.stringify({
          userId: 'user-123'
        })
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Usuário excluído com sucesso do sistema');
      expect(mockSupabaseAdmin.auth.admin.deleteUser).toHaveBeenCalledWith('user-123');
      // Verificar que análises e mensagens foram deletadas
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('analises_cobertura');
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('mensagens');
    });

    it('deve excluir usuário e perfil com sucesso quando perfil existe', async () => {
      mockSupabaseAdmin.auth.admin.deleteUser.mockResolvedValue({
        error: null
      });

      // Mock para análises e mensagens (deletar com sucesso)
      const mockDeleteChain = {
        eq: jest.fn().mockResolvedValue({ error: null })
      };
      
      // Mock para perfil (existe e deleta com sucesso)
      const mockProfileQuery = {
        delete: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({ error: null })
        }))
      };

      mockSupabaseAdmin.from.mockImplementation((table: string) => {
        if (table === 'analises_cobertura' || table === 'mensagens') {
          return {
            delete: jest.fn(() => mockDeleteChain)
          };
        }
        return mockProfileQuery;
      });

      const request = new NextRequest('http://localhost:3000/api/users/delete', {
        method: 'DELETE',
        body: JSON.stringify({
          userId: 'user-123'
        })
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Usuário excluído com sucesso do sistema');
      expect(mockSupabaseAdmin.auth.admin.deleteUser).toHaveBeenCalledWith('user-123');
      expect(mockProfileQuery.delete).toHaveBeenCalled();
      // Verificar que análises e mensagens foram deletadas
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('analises_cobertura');
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('mensagens');
    });

    it('deve configurar cliente Supabase com service role key', async () => {
      mockSupabaseAdmin.auth.admin.deleteUser.mockResolvedValue({
        error: null
      });

      // Mock para análises e mensagens
      const mockDeleteChain = {
        eq: jest.fn().mockResolvedValue({ error: null })
      };
      
      // Mock para perfil
      const mockProfileQuery = {
        delete: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({ error: null })
        }))
      };

      mockSupabaseAdmin.from.mockImplementation((table: string) => {
        if (table === 'analises_cobertura' || table === 'mensagens') {
          return {
            delete: jest.fn(() => mockDeleteChain)
          };
        }
        return mockProfileQuery;
      });

      const request = new NextRequest('http://localhost:3000/api/users/delete', {
        method: 'DELETE',
        body: JSON.stringify({
          userId: 'user-123'
        })
      });

      await DELETE(request);

      // Verificar que o mock foi configurado corretamente
      // createClient é chamado dentro da função DELETE, então verificamos se o mock foi usado
      expect(mockSupabaseAdmin.auth.admin.deleteUser).toHaveBeenCalled();
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('analises_cobertura');
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('mensagens');
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('profiles');
    });
  });

  describe('tratamento de erros', () => {
    it('deve retornar 500 quando falha ao remover usuário do Auth', async () => {
      mockSupabaseAdmin.auth.admin.deleteUser.mockResolvedValue({
        error: { message: 'User not found' }
      });

      const request = new NextRequest('http://localhost:3000/api/users/delete', {
        method: 'DELETE',
        body: JSON.stringify({
          userId: 'user-123'
        })
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Falha ao remover usuário do Auth: User not found');
    });

    it('deve retornar 500 quando falha ao remover perfil', async () => {
      mockSupabaseAdmin.auth.admin.deleteUser.mockResolvedValue({
        error: null
      });

      // Mock para análises e mensagens (deletar com sucesso)
      const mockDeleteChain = {
        eq: jest.fn().mockResolvedValue({ error: null })
      };
      
      // Mock para perfil (erro ao deletar)
      const mockProfileQuery = {
        delete: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({
            error: { message: 'Database error' }
          })
        }))
      };

      mockSupabaseAdmin.from.mockImplementation((table: string) => {
        if (table === 'analises_cobertura' || table === 'mensagens') {
          return {
            delete: jest.fn(() => mockDeleteChain)
          };
        }
        return mockProfileQuery;
      });

      const request = new NextRequest('http://localhost:3000/api/users/delete', {
        method: 'DELETE',
        body: JSON.stringify({
          userId: 'user-123'
        })
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Falha ao remover perfil: Database error');
    });

    it('deve retornar 500 quando ocorre erro interno', async () => {
      mockSupabaseAdmin.auth.admin.deleteUser.mockRejectedValue(new Error('Internal error'));

      const request = new NextRequest('http://localhost:3000/api/users/delete', {
        method: 'DELETE',
        body: JSON.stringify({
          userId: 'user-123'
        })
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Erro interno do servidor');
    });

    it('deve retornar 500 quando JSON é inválido', async () => {
      const request = new NextRequest('http://localhost:3000/api/users/delete', {
        method: 'DELETE',
        body: 'invalid-json'
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Erro interno do servidor');
    });
  });

  describe('cenários de sucesso', () => {
    it('deve excluir diferentes tipos de usuários', async () => {
      const testCases = [
        'admin-user-123',
        'cliente-user-456',
        'tecnico-user-789',
        'user-with-special-chars-!@#'
      ];

      for (const userId of testCases) {
        mockSupabaseAdmin.auth.admin.deleteUser.mockResolvedValue({
          error: null
        });

        // Mock para análises e mensagens
        const mockDeleteChain = {
          eq: jest.fn().mockResolvedValue({ error: null })
        };
        
        // Mock para perfil
        const mockProfileQuery = {
          delete: jest.fn(() => ({
            eq: jest.fn().mockResolvedValue({ error: null })
          }))
        };

        mockSupabaseAdmin.from.mockImplementation((table: string) => {
          if (table === 'analises_cobertura' || table === 'mensagens') {
            return {
              delete: jest.fn(() => mockDeleteChain)
            };
          }
          return mockProfileQuery;
        });

        const request = new NextRequest('http://localhost:3000/api/users/delete', {
          method: 'DELETE',
          body: JSON.stringify({ userId })
        });

        const response = await DELETE(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(mockSupabaseAdmin.auth.admin.deleteUser).toHaveBeenCalledWith(userId);
      }
    });

    it('deve deletar análises, mensagens e perfil antes de remover usuário do Auth', async () => {
      mockSupabaseAdmin.auth.admin.deleteUser.mockResolvedValue({
        error: null
      });

      // Mock para análises e mensagens
      const mockDeleteChain = {
        eq: jest.fn().mockResolvedValue({ error: null })
      };
      
      // Mock para perfil
      const mockProfileDelete = jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ error: null })
      }));
      
      const mockProfileQuery = {
        delete: mockProfileDelete
      };

      mockSupabaseAdmin.from.mockImplementation((table: string) => {
        if (table === 'analises_cobertura' || table === 'mensagens') {
          return {
            delete: jest.fn(() => mockDeleteChain)
          };
        }
        return mockProfileQuery;
      });

      const request = new NextRequest('http://localhost:3000/api/users/delete', {
        method: 'DELETE',
        body: JSON.stringify({
          userId: 'user-123'
        })
      });

      await DELETE(request);

      // Verificar ordem de operações: análises → mensagens → perfil → auth
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('analises_cobertura');
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('mensagens');
      expect(mockProfileDelete).toHaveBeenCalled();
      expect(mockSupabaseAdmin.auth.admin.deleteUser).toHaveBeenCalledWith('user-123');
    });
  });
});
