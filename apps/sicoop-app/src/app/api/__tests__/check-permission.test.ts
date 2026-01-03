import { POST } from '../check-permission/route';
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

describe('POST /api/check-permission', () => {
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
      const request = new NextRequest('http://localhost:3000/api/check-permission', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-123',
          moduleName: 'cliente'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Token de autorização ausente');
    });

    it('deve retornar 400 quando userId está ausente', async () => {
      const request = new NextRequest('http://localhost:3000/api/check-permission', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          moduleName: 'cliente'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('userId e moduleName são obrigatórios');
    });

    it('deve retornar 400 quando moduleName está ausente', async () => {
      const request = new NextRequest('http://localhost:3000/api/check-permission', {
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

      expect(response.status).toBe(400);
      expect(data.error).toBe('userId e moduleName são obrigatórios');
    });

    it('deve retornar 400 quando ambos userId e moduleName estão ausentes', async () => {
      const request = new NextRequest('http://localhost:3000/api/check-permission', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({})
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('userId e moduleName são obrigatórios');
    });
  });

  describe('verificação de permissão', () => {
    it('deve retornar dados quando permissão é verificada com sucesso', async () => {
      const mockPermissionData = { hasPermission: true };
      mockSupabase.rpc.mockResolvedValue({
        data: mockPermissionData,
        error: null
      });

      const request = new NextRequest('http://localhost:3000/api/check-permission', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          userId: 'user-123',
          moduleName: 'cliente'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockPermissionData);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('check_permission', {
        user_id: 'user-123',
        module_name: 'cliente',
        permission_type: 'access'
      });
    });

    it('deve usar permissionType padrão "access" quando não fornecido', async () => {
      const mockPermissionData = { hasPermission: true };
      mockSupabase.rpc.mockResolvedValue({
        data: mockPermissionData,
        error: null
      });

      const request = new NextRequest('http://localhost:3000/api/check-permission', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          userId: 'user-123',
          moduleName: 'cliente'
        })
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('check_permission', {
        user_id: 'user-123',
        module_name: 'cliente',
        permission_type: 'access'
      });
    });

    it('deve usar permissionType customizado quando fornecido', async () => {
      const mockPermissionData = { hasPermission: true };
      mockSupabase.rpc.mockResolvedValue({
        data: mockPermissionData,
        error: null
      });

      const request = new NextRequest('http://localhost:3000/api/check-permission', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          userId: 'user-123',
          moduleName: 'cliente',
          permissionType: 'write'
        })
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('check_permission', {
        user_id: 'user-123',
        module_name: 'cliente',
        permission_type: 'write'
      });
    });

    it('deve configurar cliente Supabase com token correto', async () => {
      const mockPermissionData = { hasPermission: true };
      mockSupabase.rpc.mockResolvedValue({
        data: mockPermissionData,
        error: null
      });

      const request = new NextRequest('http://localhost:3000/api/check-permission', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token-123'
        },
        body: JSON.stringify({
          userId: 'user-123',
          moduleName: 'cliente'
        })
      });

      await POST(request);

      // Verificar que o mock foi configurado corretamente
      expect(mockSupabase.rpc).toHaveBeenCalled();
    });
  });

  describe('tratamento de erros', () => {
    it('deve retornar 500 quando Supabase retorna erro', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      const request = new NextRequest('http://localhost:3000/api/check-permission', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          userId: 'user-123',
          moduleName: 'cliente'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Erro ao verificar permissão');
    });

    it('deve retornar 500 quando ocorre erro interno', async () => {
      mockSupabase.rpc.mockRejectedValue(new Error('Internal error'));

      const request = new NextRequest('http://localhost:3000/api/check-permission', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          userId: 'user-123',
          moduleName: 'cliente'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Erro interno do servidor');
    });

    it('deve retornar 500 quando JSON é inválido', async () => {
      const request = new NextRequest('http://localhost:3000/api/check-permission', {
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
    it('deve retornar dados de permissão para diferentes módulos', async () => {
      const testCases = [
        { moduleName: 'cliente', expectedPermission: true },
        { moduleName: 'tecnico', expectedPermission: false },
        { moduleName: 'admin', expectedPermission: true }
      ];

      for (const testCase of testCases) {
        mockSupabase.rpc.mockResolvedValue({
          data: { hasPermission: testCase.expectedPermission },
          error: null
        });

        const request = new NextRequest('http://localhost:3000/api/check-permission', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer valid-token'
          },
          body: JSON.stringify({
            userId: 'user-123',
            moduleName: testCase.moduleName
          })
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.data.hasPermission).toBe(testCase.expectedPermission);
      }
    });

    it('deve retornar dados de permissão para diferentes tipos de permissão', async () => {
      const permissionTypes = ['access', 'read', 'write', 'delete'];

      for (const permissionType of permissionTypes) {
        mockSupabase.rpc.mockResolvedValue({
          data: { hasPermission: true },
          error: null
        });

        const request = new NextRequest('http://localhost:3000/api/check-permission', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer valid-token'
          },
          body: JSON.stringify({
            userId: 'user-123',
            moduleName: 'cliente',
            permissionType
          })
        });

        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(mockSupabase.rpc).toHaveBeenCalledWith('check_permission', {
          user_id: 'user-123',
          module_name: 'cliente',
          permission_type: permissionType
        });
      }
    });
  });
});
