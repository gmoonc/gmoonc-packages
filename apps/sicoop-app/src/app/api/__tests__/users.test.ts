import { GET, POST, PUT } from '../users/route';
import { NextRequest } from 'next/server';

// Mock do Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn()
}));

// Mock das variáveis de ambiente
const originalEnv = process.env;

beforeEach(() => {
  jest.clearAllMocks();
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key'
  };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('API /api/users', () => {
  const mockCreateClient = jest.fn();
  let mockSupabase: {
    from: jest.Mock;
    rpc: jest.Mock;
  };

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          or: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                range: jest.fn()
              }))
            }))
          })),
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              range: jest.fn()
            }))
          })),
          order: jest.fn(() => ({
            range: jest.fn()
          })),
          single: jest.fn(),
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn()
              }))
            }))
          }))
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn()
          }))
        }))
      })),
      rpc: jest.fn()
    };
    mockCreateClient.mockReturnValue(mockSupabase);
    
    // Configurar o mock do createClient
    const { createClient } = jest.requireMock('@supabase/supabase-js');
    createClient.mockImplementation(() => mockSupabase);
  });

  describe('GET /api/users - Listar usuários', () => {
    it('deve retornar 401 quando token de autorização está ausente', async () => {
      const request = new NextRequest('http://localhost:3000/api/users');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Token de autorização ausente');
    });

    it('deve retornar lista de usuários com sucesso', async () => {
      const mockUsers = [
        { id: 'user-1', name: 'João Silva', email: 'joao@test.com', role: 'cliente' },
        { id: 'user-2', name: 'Maria Santos', email: 'maria@test.com', role: 'funcionario' }
      ];

      const mockQuery = {
        select: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn().mockResolvedValue({
              data: mockUsers,
              error: null,
              count: 2
            })
          }))
        }))
      };
      mockSupabase.from.mockReturnValue(mockQuery);

      const request = new NextRequest('http://localhost:3000/api/users?page=1&limit=10', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockUsers);
      expect(data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1
      });
    });

    it('deve aplicar filtros de busca e role', async () => {
      const mockUsers = [{ id: 'user-1', name: 'João Silva', email: 'joao@test.com', role: 'cliente' }];

      const mockOr = jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn().mockResolvedValue({
              data: mockUsers,
              error: null,
              count: 1
            })
          }))
        }))
      }));

      const mockSelect = jest.fn(() => ({
        or: mockOr
      }));

      const mockQuery = {
        select: mockSelect
      };
      mockSupabase.from.mockReturnValue(mockQuery);

      const request = new NextRequest('http://localhost:3000/api/users?search=joao&role=cliente', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      });

      const response = await GET(request);

      expect(response.status).toBe(200);
      // Verificar que os filtros foram aplicados
      expect(mockOr).toHaveBeenCalled();
      expect(mockSelect).toHaveBeenCalled();
    });

    it('deve retornar 500 quando Supabase retorna erro', async () => {
      const mockQuery = {
        select: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
              count: 0
            })
          }))
        }))
      };
      mockSupabase.from.mockReturnValue(mockQuery);

      const request = new NextRequest('http://localhost:3000/api/users', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Erro ao buscar usuários');
    });
  });

  describe('POST /api/users - Criar usuário', () => {
    it('deve retornar 401 quando token de autorização está ausente', async () => {
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify({
          name: 'João Silva',
          email: 'joao@test.com'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Token de autorização ausente');
    });

    it('deve retornar 400 quando dados obrigatórios estão ausentes', async () => {
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          name: 'João Silva'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Nome e email são obrigatórios');
    });

    it('deve criar usuário com sucesso', async () => {
      const mockUser = { id: 'user-1', name: 'João Silva', email: 'joao@test.com', role: 'cliente' };

      // Mock para verificar email existente
      const mockEmailCheck = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' } // Not found
            })
          }))
        }))
      };

      // Mock para criar usuário
      mockSupabase.rpc.mockResolvedValue({
        data: mockUser,
        error: null
      });

      mockSupabase.from.mockReturnValue(mockEmailCheck);

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          name: 'João Silva',
          email: 'joao@test.com',
          role: 'cliente'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockUser);
      expect(data.message).toBe('Usuário criado com sucesso');
    });

    it('deve retornar 409 quando email já existe', async () => {
      const mockEmailCheck = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { id: 'existing-user' },
              error: null
            })
          }))
        }))
      };

      mockSupabase.from.mockReturnValue(mockEmailCheck);

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          name: 'João Silva',
          email: 'existing@test.com'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('Email já está em uso');
    });

    it('deve usar role padrão quando não fornecido', async () => {
      const mockUser = { id: 'user-1', name: 'João Silva', email: 'joao@test.com', role: 'cliente' };

      const mockEmailCheck = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }
            })
          }))
        }))
      };

      mockSupabase.rpc.mockResolvedValue({
        data: mockUser,
        error: null
      });

      mockSupabase.from.mockReturnValue(mockEmailCheck);

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          name: 'João Silva',
          email: 'joao@test.com'
        })
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('create_user_profile', {
        p_name: 'João Silva',
        p_email: 'joao@test.com',
        p_role: 'cliente'
      });
    });
  });

  describe('PUT /api/users - Atualizar usuário', () => {
    it('deve retornar 401 quando token de autorização está ausente', async () => {
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'PUT',
        body: JSON.stringify({
          id: 'user-1',
          name: 'João Silva Atualizado'
        })
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Token de autorização ausente');
    });

    it('deve retornar 400 quando ID está ausente', async () => {
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          name: 'João Silva Atualizado'
        })
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('ID do usuário é obrigatório');
    });

    it('deve atualizar usuário com sucesso', async () => {
      const mockUpdatedUser = { id: 'user-1', name: 'João Silva Atualizado', email: 'joao@test.com', role: 'cliente' };

      // Mock para verificar usuário existente
      const mockUserCheck = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { id: 'user-1', email: 'joao@test.com' },
              error: null
            })
          }))
        }))
      };

      // Mock para atualizar usuário
      const mockUpdate = {
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({
                data: mockUpdatedUser,
                error: null
              })
            }))
          }))
        }))
      };

      mockSupabase.from
        .mockReturnValueOnce(mockUserCheck) // Para verificar usuário existente
        .mockReturnValueOnce(mockUpdate); // Para atualizar usuário

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          id: 'user-1',
          name: 'João Silva Atualizado'
        })
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockUpdatedUser);
      expect(data.message).toBe('Usuário atualizado com sucesso');
    });

    it('deve retornar 404 quando usuário não existe', async () => {
      const mockUserCheck = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }
            })
          }))
        }))
      };

      mockSupabase.from.mockReturnValue(mockUserCheck);

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          id: 'non-existent-user',
          name: 'João Silva Atualizado'
        })
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Usuário não encontrado');
    });

    it('deve retornar 409 quando email já está em uso por outro usuário', async () => {
      const mockUserCheck = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { id: 'user-1', email: 'joao@test.com' },
              error: null
            })
          }))
        }))
      };

      const mockEmailCheck = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            neq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({
                data: { id: 'other-user' },
                error: null
              })
            }))
          }))
        }))
      };

      mockSupabase.from
        .mockReturnValueOnce(mockUserCheck) // Para verificar usuário existente
        .mockReturnValueOnce(mockEmailCheck); // Para verificar email

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          id: 'user-1',
          email: 'existing@test.com'
        })
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('Email já está em uso por outro usuário');
    });
  });

  describe('tratamento de erros', () => {
    it('deve retornar 500 quando ocorre erro interno', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Internal error');
      });

      const request = new NextRequest('http://localhost:3000/api/users', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Erro interno do servidor');
    });

    it('deve retornar 500 quando JSON é inválido', async () => {
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: 'invalid-json'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Erro interno do servidor');
    });
  });
});
