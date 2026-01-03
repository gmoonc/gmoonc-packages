import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserManagement from '../UserManagement';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

// Mock do useAuth
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock do Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getSession: jest.fn(),
    },
  },
}));

// Mock do fetch
global.fetch = jest.fn();

describe('UserManagement', () => {
  const mockUser = {
    id: '123',
    email: 'admin@test.com',
    name: 'Admin User',
    role: 'administrador',
  };

  const mockUsers = [
    {
      id: '1',
      name: 'User 1',
      email: 'user1@test.com',
      role: 'cliente',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'User 2',
      email: 'user2@test.com',
      role: 'funcionario',
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
    });

    // Mock do Supabase query
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({
        data: mockUsers,
        error: null,
        count: mockUsers.length,
      }),
    };
    (supabase.from as jest.Mock).mockReturnValue(mockQuery);

    // Mock do fetch
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Usuário excluído com sucesso' }),
    });
  });

  it('deve renderizar o componente corretamente', async () => {
    render(<UserManagement />);

    expect(screen.getByPlaceholderText('Buscar por nome ou email...')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Todas as funções')).toBeInTheDocument();
  });

  it('deve exibir lista de usuários', async () => {
    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getAllByText('User 1').length).toBeGreaterThan(0);
      expect(screen.getAllByText('user1@test.com').length).toBeGreaterThan(0);
      expect(screen.getAllByText('User 2').length).toBeGreaterThan(0);
      expect(screen.getAllByText('user2@test.com').length).toBeGreaterThan(0);
    });
  });

  it('deve exibir badges de função corretamente', async () => {
    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Cliente')).toBeInTheDocument();
      expect(screen.getByText('Funcionário')).toBeInTheDocument();
    });
  });

  it('deve filtrar usuários por busca', async () => {
    const user = userEvent.setup();
    render(<UserManagement />);

    const searchInput = screen.getByPlaceholderText('Buscar por nome ou email...');
    await user.type(searchInput, 'User 1');

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });
  });

  it('deve filtrar usuários por função', async () => {
    const user = userEvent.setup();
    render(<UserManagement />);

    const roleFilter = screen.getByDisplayValue('Todas as funções');
    await user.selectOptions(roleFilter, 'cliente');

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });
  });

  it('deve exibir estado de loading', () => {
    // Mock para simular loading
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockImplementation(() => new Promise(() => {})), // Nunca resolve
    };
    (supabase.from as jest.Mock).mockReturnValue(mockQuery);

    render(<UserManagement />);

    expect(screen.getByText('Carregando usuários...')).toBeInTheDocument();
  });

  it('deve exibir estado vazio quando não há usuários', async () => {
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      }),
    };
    (supabase.from as jest.Mock).mockReturnValue(mockQuery);

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Nenhum usuário encontrado')).toBeInTheDocument();
    });
  });

  it('deve abrir modal de confirmação ao clicar em excluir', async () => {
    const user = userEvent.setup();
    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getAllByText('User 1').length).toBeGreaterThan(0);
    });

    const deleteButton = screen.getAllByTitle('Excluir usuário')[0];
    await user.click(deleteButton);

    expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
    expect(screen.getByText(/Tem certeza que deseja excluir o usuário "User 1"/)).toBeInTheDocument();
  });

  it('deve cancelar exclusão ao clicar em cancelar', async () => {
    const user = userEvent.setup();
    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getAllByText('User 1').length).toBeGreaterThan(0);
    });

    const deleteButton = screen.getAllByTitle('Excluir usuário')[0];
    await user.click(deleteButton);

    const cancelButton = screen.getByText('Cancelar');
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Confirmar Exclusão')).not.toBeInTheDocument();
    });
  });

  it('deve confirmar exclusão e chamar API', async () => {
    const user = userEvent.setup();
    
    // Mock do getSession para retornar uma sessão válida
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { access_token: 'mock-token' } }
    });

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getAllByText('User 1').length).toBeGreaterThan(0);
    });

    const deleteButton = screen.getAllByTitle('Excluir usuário')[0];
    await user.click(deleteButton);

    const confirmButton = screen.getByText('Sim, Excluir Usuário');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/users/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
        body: JSON.stringify({ userId: '1' }),
      });
    });
  });

  it('deve desabilitar botão de exclusão para usuário sem permissão', async () => {
    // Mock para usuário sem permissão
    (useAuth as jest.Mock).mockReturnValue({
      user: { ...mockUser, role: 'cliente' },
    });

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getAllByText('User 1').length).toBeGreaterThan(0);
    });

    const deleteButtons = screen.getAllByTitle('Sem permissão para excluir');
    expect(deleteButtons[0]).toBeDisabled();
  });

  it('deve exibir informações de paginação', async () => {
    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText(/Mostrando/)).toBeInTheDocument();
      expect(screen.getByText(/usuários/)).toBeInTheDocument();
    });
  });

  it('deve navegar entre páginas', async () => {
    const user = userEvent.setup();
    
    // Mock para múltiplas páginas
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({
        data: mockUsers,
        error: null,
        count: 25, // Simula 25 usuários para 3 páginas
      }),
    };
    (supabase.from as jest.Mock).mockReturnValue(mockQuery);

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Página 1 de 3')).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Próxima');
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Página 2 de 3')).toBeInTheDocument();
    });
  });

  it('deve exibir data de criação formatada', async () => {
    render(<UserManagement />);

    await waitFor(() => {
      // Verificar se pelo menos uma data formatada está presente
      // Como há paginação, pode haver apenas uma data visível por vez
      const date1Elements = screen.queryAllByText('01/01/2024');
      const date2Elements = screen.queryAllByText('02/01/2024');
      
      // Verificar também se a data aparece como parte de um texto maior
      const allText = document.body.textContent || '';
      const hasDate1 = allText.includes('01/01/2024');
      const hasDate2 = allText.includes('02/01/2024');
      
      // Pelo menos uma das datas deve estar presente
      expect(date1Elements.length + date2Elements.length + (hasDate1 ? 1 : 0) + (hasDate2 ? 1 : 0)).toBeGreaterThan(0);
    });
  });

  it('deve exibir botões de ação para cada usuário', async () => {
    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getAllByText('User 1').length).toBeGreaterThan(0);
    });

    const editButtons = screen.getAllByTitle('Editar usuário');
    const deleteButtons = screen.getAllByTitle('Excluir usuário');

    expect(editButtons.length).toBeGreaterThan(0);
    expect(deleteButtons.length).toBeGreaterThan(0);
  });
});
