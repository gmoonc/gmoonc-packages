import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthorizationsManager from '../AuthorizationsManager';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

// Mock do AuthContext
jest.mock('@/contexts/AuthContext');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock do Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn()
  }
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('AuthorizationsManager', () => {
  const mockUser = {
    id: 'user-123',
    email: 'admin@test.com',
    name: 'Admin User'
  };

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      clearError: jest.fn(),
      emergencyReset: jest.fn()
    });

    // Mock das queries do Supabase
    const mockFrom = jest.fn();
    const mockSelect = jest.fn();
    const mockOrder = jest.fn();

    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: [], error: null });
    mockFrom.mockReturnValue({ select: mockSelect });

    mockSupabase.from.mockImplementation(mockFrom);
    mockSupabase.rpc.mockResolvedValue({ data: null, error: null });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o componente corretamente', async () => {
    render(<AuthorizationsManager />);

    await waitFor(() => {
      expect(screen.getByText(/Gerencie os papéis.*dos usuários do sistema/)).toBeInTheDocument();
    });
    
    expect(screen.getByPlaceholderText('Buscar usuários por nome, email ou autorização...')).toBeInTheDocument();
  });

  it('deve exibir estado de loading inicial', () => {
    // Mock para simular loading
    const mockFrom = jest.fn();
    const mockSelect = jest.fn();
    const mockOrder = jest.fn();

    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockImplementation(() => new Promise(() => {})); // Nunca resolve
    mockFrom.mockReturnValue({ select: mockSelect });

    mockSupabase.from.mockImplementation(mockFrom);

    render(<AuthorizationsManager />);

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('deve exibir barra de busca', async () => {
    render(<AuthorizationsManager />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Buscar usuários por nome, email ou autorização...')).toBeInTheDocument();
    });
  });

  it('deve exibir informações sobre o sistema', async () => {
    render(<AuthorizationsManager />);

    await waitFor(() => {
      expect(screen.getByText('Sobre o Sistema de Autorizações')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Autorizações do Sistema:/)).toBeInTheDocument();
    expect(screen.getByText(/Autorizações Customizadas:/)).toBeInTheDocument();
    expect(screen.getByText(/Sincronização Automática:/)).toBeInTheDocument();
  });

  it('deve exibir cabeçalhos da tabela', async () => {
    render(<AuthorizationsManager />);

    await waitFor(() => {
      expect(screen.getByText('Usuário')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Autorização Atual')).toBeInTheDocument();
      expect(screen.getByText('Nova Autorização')).toBeInTheDocument();
      expect(screen.getByText('Ações')).toBeInTheDocument();
    });
  });

  it('deve exibir estatísticas vazias quando não há usuários', async () => {
    render(<AuthorizationsManager />);

    await waitFor(() => {
      expect(screen.getByText('Total de Usuários')).toBeInTheDocument();
      expect(screen.getByText('Administradores')).toBeInTheDocument();
      expect(screen.getByText('Clientes')).toBeInTheDocument();
      expect(screen.getByText('Outras Autorizações')).toBeInTheDocument();
    });
  });

  it('deve permitir digitar na barra de busca', async () => {
    const user = userEvent.setup();
    render(<AuthorizationsManager />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Buscar usuários por nome, email ou autorização...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar usuários por nome, email ou autorização...');
    await user.type(searchInput, 'teste');

    expect(searchInput).toHaveValue('teste');
  });

  it('deve exibir erro quando falha ao carregar dados', async () => {
    const mockFrom = jest.fn();
    const mockSelect = jest.fn();
    const mockOrder = jest.fn();

    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockRejectedValue(new Error('Database error'));
    mockFrom.mockReturnValue({ select: mockSelect });

    mockSupabase.from.mockImplementation(mockFrom);

    render(<AuthorizationsManager />);

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar dados. Tente novamente.')).toBeInTheDocument();
    });
  });
});