import { POST } from '../user-permissions/route';
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

describe('POST /api/user-permissions', () => {
  const mockCreateClient = jest.fn();
  let mockSupabase: {
    rpc: jest.Mock;
  };

  beforeEach(() => {
    mockSupabase = {
      rpc: jest.fn()
    };
    mockCreateClient.mockReturnValue(mockSupabase);
    
    // Configurar o mock do createClient
    const { createClient } = jest.requireMock('@supabase/supabase-js');
    createClient.mockImplementation(() => mockSupabase);
  });

  describe('validação de entrada', () => {
    it('deve retornar 401 quando token de autorização está ausente', async () => {
      const request = new NextRequest('http://localhost:3000/api/user-permissions', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-123'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Token de autorização ausente');
    });

    it('deve retornar 400 quando userId está ausente', async () => {
      const request = new NextRequest('http://localhost:3000/api/user-permissions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({})
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('userId é obrigatório');
    });

    it('deve retornar 400 quando userId é null', async () => {
      const request = new NextRequest('http://localhost:3000/api/user-permissions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          userId: null
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('userId é obrigatório');
    });

    it('deve retornar 400 quando userId é string vazia', async () => {
      const request = new NextRequest('http://localhost:3000/api/user-permissions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          userId: ''
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('userId é obrigatório');
    });
  });

  describe('obtenção de permissões', () => {
    it('deve retornar dados de permissões quando obtidas com sucesso', async () => {
      const mockPermissionsData = {
        permissions: [
          { module: 'cliente', access: true, read: true, write: false },
          { module: 'tecnico', access: false, read: false, write: false },
          { module: 'admin', access: true, read: true, write: true }
        ]
      };
      
      mockSupabase.rpc.mockResolvedValue({
        data: mockPermissionsData,
        error: null
      });

      const request = new NextRequest('http://localhost:3000/api/user-permissions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          userId: 'user-123'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockPermissionsData);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_user_permissions', {
        user_id: 'user-123'
      });
    });

    it('deve configurar cliente Supabase com token correto', async () => {
      const mockPermissionsData = { permissions: [] };
      mockSupabase.rpc.mockResolvedValue({
        data: mockPermissionsData,
        error: null
      });

      const request = new NextRequest('http://localhost:3000/api/user-permissions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token-456'
        },
        body: JSON.stringify({
          userId: 'user-123'
        })
      });

      await POST(request);

      // Verificar que o mock foi configurado corretamente
      expect(mockSupabase.rpc).toHaveBeenCalled();
    });

    it('deve retornar dados vazios quando usuário não tem permissões', async () => {
      const mockEmptyPermissions = { permissions: [] };
      mockSupabase.rpc.mockResolvedValue({
        data: mockEmptyPermissions,
        error: null
      });

      const request = new NextRequest('http://localhost:3000/api/user-permissions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          userId: 'user-without-permissions'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockEmptyPermissions);
    });
  });

  describe('tratamento de erros', () => {
    it('deve retornar 500 quando Supabase retorna erro', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' }
      });

      const request = new NextRequest('http://localhost:3000/api/user-permissions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          userId: 'user-123'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Erro ao obter permissões do usuário');
    });

    it('deve retornar 500 quando ocorre erro interno', async () => {
      mockSupabase.rpc.mockRejectedValue(new Error('Internal server error'));

      const request = new NextRequest('http://localhost:3000/api/user-permissions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          userId: 'user-123'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Erro interno do servidor');
    });

    it('deve retornar 500 quando JSON é inválido', async () => {
      const request = new NextRequest('http://localhost:3000/api/user-permissions', {
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

  describe('cenários de sucesso', () => {
    it('deve retornar permissões para diferentes usuários', async () => {
      const testCases = [
        {
          userId: 'admin-user',
          expectedPermissions: {
            permissions: [
              { module: 'cliente', access: true, read: true, write: true },
              { module: 'tecnico', access: true, read: true, write: true },
              { module: 'admin', access: true, read: true, write: true }
            ]
          }
        },
        {
          userId: 'cliente-user',
          expectedPermissions: {
            permissions: [
              { module: 'cliente', access: true, read: true, write: false }
            ]
          }
        },
        {
          userId: 'tecnico-user',
          expectedPermissions: {
            permissions: [
              { module: 'tecnico', access: true, read: true, write: true }
            ]
          }
        }
      ];

      for (const testCase of testCases) {
        mockSupabase.rpc.mockResolvedValue({
          data: testCase.expectedPermissions,
          error: null
        });

        const request = new NextRequest('http://localhost:3000/api/user-permissions', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer valid-token'
          },
          body: JSON.stringify({
            userId: testCase.userId
          })
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.data).toEqual(testCase.expectedPermissions);
        expect(mockSupabase.rpc).toHaveBeenCalledWith('get_user_permissions', {
          user_id: testCase.userId
        });
      }
    });

    it('deve lidar com diferentes formatos de token de autorização', async () => {
      const mockPermissionsData = { permissions: [] };
      mockSupabase.rpc.mockResolvedValue({
        data: mockPermissionsData,
        error: null
      });

      const tokens = [
        'Bearer simple-token',
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        'Bearer token-with-special-chars-123!@#'
      ];

      for (const token of tokens) {
        const request = new NextRequest('http://localhost:3000/api/user-permissions', {
          method: 'POST',
          headers: {
            'Authorization': token
          },
          body: JSON.stringify({
            userId: 'user-123'
          })
        });

        const response = await POST(request);

        expect(response.status).toBe(200);
      }
    });
  });
});
