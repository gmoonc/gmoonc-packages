import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PermissionsManager from '../PermissionsManager';

// Mock do AuthContext
const mockUseAuth = jest.fn();
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock do Supabase
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      order: jest.fn().mockResolvedValue({ data: [], error: null })
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn().mockResolvedValue({ data: null, error: null })
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn().mockResolvedValue({ data: null, error: null })
    })),
    delete: jest.fn(() => ({
      eq: jest.fn().mockResolvedValue({ data: null, error: null })
    })),
    upsert: jest.fn().mockResolvedValue({ data: null, error: null })
  })),
  rpc: jest.fn().mockResolvedValue({ data: 0, error: null })
};

// Mock do createClient
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase)
}));

// Mock do window.confirm
Object.defineProperty(window, 'confirm', {
  value: jest.fn(() => true),
  writable: true
});

describe('PermissionsManager', () => {
  const mockRoles = [
    {
      id: '1',
      name: 'admin',
      description: 'Administrador do sistema',
      is_system_role: true
    },
    {
      id: '2',
      name: 'user',
      description: 'Usuário comum',
      is_system_role: false
    }
  ];

  const mockModules = [
    {
      id: '1',
      name: 'users',
      display_name: 'Usuários'
    },
    {
      id: '2',
      name: 'messages',
      display_name: 'Mensagens'
    }
  ];

  const mockPermissions = {
    '1': {
      '1': {
        id: '1',
        role_id: '1',
        module_id: '1',
        can_access: true,
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: true
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock do useAuth
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user-id' },
      isLoading: false,
      signOut: jest.fn()
    });
    
    // Mock das consultas do Supabase
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'roles') {
        return {
          select: jest.fn(() => ({
            order: jest.fn().mockResolvedValue({ data: mockRoles, error: null })
          }))
        };
      }
      if (table === 'modules') {
        return {
          select: jest.fn(() => ({
            order: jest.fn().mockResolvedValue({ data: mockModules, error: null })
          }))
        };
      }
      if (table === 'permissions') {
        return {
          select: jest.fn(() => ({
            order: jest.fn().mockResolvedValue({ data: Object.values(mockPermissions).flat(), error: null })
          })),
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: { id: 'new-role' }, error: null })
            }))
          })),
          update: jest.fn(() => ({
            eq: jest.fn().mockResolvedValue({ data: null, error: null })
          })),
          delete: jest.fn(() => ({
            eq: jest.fn().mockResolvedValue({ data: null, error: null })
          })),
          upsert: jest.fn().mockResolvedValue({ data: null, error: null })
        };
      }
      return {
        select: jest.fn(() => ({
          order: jest.fn().mockResolvedValue({ data: [], error: null })
        }))
      };
    });
  });

  it('deve renderizar o componente corretamente', async () => {
    render(<PermissionsManager />);
    
    await waitFor(() => {
      expect(screen.getByText('Autorizações / Módulos')).toBeInTheDocument();
    });
  });

  it('deve exibir estado de loading inicialmente', () => {
    render(<PermissionsManager />);
    
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('deve exibir a tabela de permissões após carregar', async () => {
    render(<PermissionsManager />);
    
    await waitFor(() => {
      expect(screen.getByText('Autorizações / Módulos')).toBeInTheDocument();
      expect(screen.getByText('Ações')).toBeInTheDocument();
    });
  });

  it('deve exibir botão para nova autorização', async () => {
    render(<PermissionsManager />);
    
    await waitFor(() => {
      expect(screen.getByText('+ Nova Autorização')).toBeInTheDocument();
    });
  });

  it('deve abrir modal para nova autorização', async () => {
    render(<PermissionsManager />);
    
    await waitFor(() => {
      expect(screen.getByText('+ Nova Autorização')).toBeInTheDocument();
    });
    
    const newRoleButton = screen.getByText('+ Nova Autorização');
    await userEvent.click(newRoleButton);
    
    expect(screen.getByText('Criar Nova Autorização')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ex: gerente, supervisor')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Descrição da função desta autorização')).toBeInTheDocument();
  });

  it('deve fechar modal de nova autorização', async () => {
    render(<PermissionsManager />);
    
    await waitFor(() => {
      expect(screen.getByText('+ Nova Autorização')).toBeInTheDocument();
    });
    
    const newRoleButton = screen.getByText('+ Nova Autorização');
    await userEvent.click(newRoleButton);
    
    expect(screen.getByText('Criar Nova Autorização')).toBeInTheDocument();
    
    const cancelButton = screen.getByText('Cancelar');
    await userEvent.click(cancelButton);
    
    expect(screen.queryByText('Criar Nova Autorização')).not.toBeInTheDocument();
  });

  it('deve criar nova autorização', async () => {
    render(<PermissionsManager />);
    
    await waitFor(() => {
      expect(screen.getByText('+ Nova Autorização')).toBeInTheDocument();
    });
    
    const newRoleButton = screen.getByText('+ Nova Autorização');
    await userEvent.click(newRoleButton);
    
    const nameInput = screen.getByPlaceholderText('Ex: gerente, supervisor');
    const descriptionInput = screen.getByPlaceholderText('Descrição da função desta autorização');
    
    await userEvent.type(nameInput, 'nova-role');
    await userEvent.type(descriptionInput, 'Nova role de teste');
    
    const createButton = screen.getByText('Criar');
    await userEvent.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByText(/criada com sucesso/i)).toBeInTheDocument();
    });
  });

  it('deve exibir erro ao criar autorização sem nome', async () => {
    render(<PermissionsManager />);
    
    await waitFor(() => {
      expect(screen.getByText('+ Nova Autorização')).toBeInTheDocument();
    });
    
    const newRoleButton = screen.getByText('+ Nova Autorização');
    await userEvent.click(newRoleButton);
    
    const createButton = screen.getByText('Criar');
    await userEvent.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByText(/obrigatório/i)).toBeInTheDocument();
    });
  });

  it('deve exibir botão de salvar permissões', async () => {
    render(<PermissionsManager />);
    
    await waitFor(() => {
      expect(screen.getByText('Salvar Permissões')).toBeInTheDocument();
    });
  });

  it('deve exibir botão de salvar permissões', async () => {
    render(<PermissionsManager />);
    
    await waitFor(() => {
      expect(screen.getByText('Salvar Permissões')).toBeInTheDocument();
    });
  });
});
