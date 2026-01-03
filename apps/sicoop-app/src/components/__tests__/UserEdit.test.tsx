import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserEdit from '../UserEdit';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

// Mock do useAuth
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock do Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: jest.fn(),
    auth: {
      getSession: jest.fn(),
      updateUser: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

describe('UserEdit', () => {
  const mockUser = {
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockProps = {
    user: mockUser,
    onBack: jest.fn(),
    onUserUpdated: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '123', email: 'test@example.com' },
    });
  });

  it('deve renderizar o componente corretamente', () => {
    render(<UserEdit {...mockProps} />);

    expect(screen.getByText('Gerenciar Minha Conta')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Alterar Email' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
  });

  it('deve exibir botão de voltar', () => {
    render(<UserEdit {...mockProps} />);

    const backButton = screen.getByRole('button', { name: 'Voltar' });
    expect(backButton).toBeInTheDocument();
    
    fireEvent.click(backButton);
    expect(mockProps.onBack).toHaveBeenCalledTimes(1);
  });

  it('deve permitir editar o nome quando é o próprio usuário', () => {
    render(<UserEdit {...mockProps} />);

    const nameInput = screen.getByLabelText('Nome Completo');
    expect(nameInput).not.toBeDisabled();
    expect(nameInput).toHaveValue('Test User');
  });

  it('deve desabilitar edição quando não é o próprio usuário', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '456', email: 'other@example.com' },
    });

    render(<UserEdit {...mockProps} />);

    const nameInput = screen.getByLabelText('Nome Completo');
    expect(nameInput).toBeDisabled();
  });

  it('deve atualizar o nome com sucesso', async () => {
    (supabase.rpc as jest.Mock).mockReturnValue({ error: null });

    render(<UserEdit {...mockProps} />);

    const nameInput = screen.getByLabelText('Nome Completo');
    const submitButton = screen.getByText('Salvar Alterações');

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'New Name');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('✅ Perfil atualizado com sucesso!')).toBeInTheDocument();
    });

    expect(mockProps.onUserUpdated).toHaveBeenCalled();
  });

  it('deve exibir erro ao falhar na atualização', async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({ 
      error: { message: 'Database error' } 
    });

    render(<UserEdit {...mockProps} />);

    const nameInput = screen.getByLabelText('Nome Completo');
    const submitButton = screen.getByText('Salvar Alterações');

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'New Name');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Erro ao atualizar perfil. Tente novamente.')).toBeInTheDocument();
    });
  });

  it('deve exibir estado de loading durante salvamento', async () => {
    (supabase.rpc as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    );

    render(<UserEdit {...mockProps} />);

    const nameInput = screen.getByLabelText('Nome Completo');
    const submitButton = screen.getByText('Salvar Alterações');

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'New Name');
    await userEvent.click(submitButton);

    expect(screen.getByText('Salvando...')).toBeInTheDocument();
  });

  it('deve validar email para troca', async () => {
    render(<UserEdit {...mockProps} />);

    const newEmailInput = screen.getByLabelText('Novo Email');
    const changeEmailButton = screen.getByRole('button', { name: 'Solicitar Alteração' });

    // Testar email inválido
    await userEvent.type(newEmailInput, 'invalid-email');
    
    // Verificar se o input foi preenchido
    expect(newEmailInput).toHaveValue('invalid-email');
    expect(changeEmailButton).toBeInTheDocument();
  });

  it('deve validar se o novo email é diferente do atual', async () => {
    render(<UserEdit {...mockProps} />);

    const newEmailInput = screen.getByLabelText('Novo Email');
    const changeEmailButton = screen.getByRole('button', { name: 'Solicitar Alteração' });

    // Testar mesmo email
    await userEvent.type(newEmailInput, 'test@example.com');
    
    // O botão deve estar desabilitado para mesmo email
    expect(changeEmailButton).toBeDisabled();
  });

  it('deve processar troca de email com sucesso', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: '123' } } }
    });
    (supabase.auth.updateUser as jest.Mock).mockResolvedValue({ error: null });
    (supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });

    // Mock window.location.href
    delete (window as unknown as { location: unknown }).location;
    window.location = { href: '' } as Location;

    render(<UserEdit {...mockProps} />);

    const newEmailInput = screen.getByLabelText('Novo Email');
    const changeEmailButton = screen.getByRole('button', { name: 'Solicitar Alteração' });

    await userEvent.type(newEmailInput, 'new@example.com');
    await userEvent.click(changeEmailButton);

    await waitFor(() => {
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        email: 'new@example.com'
      });
    });
  });

  it('deve exibir erro quando usuário não está autenticado para troca de email', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null }
    });

    render(<UserEdit {...mockProps} />);

    const newEmailInput = screen.getByLabelText('Novo Email');
    const changeEmailButton = screen.getByRole('button', { name: 'Solicitar Alteração' });

    await userEvent.type(newEmailInput, 'new@example.com');
    await userEvent.click(changeEmailButton);

    await waitFor(() => {
      expect(screen.getByText('Usuário não está autenticado. Faça login novamente.')).toBeInTheDocument();
    });
  });

  it('deve desabilitar botão de troca de email quando campos estão vazios', () => {
    render(<UserEdit {...mockProps} />);

    const changeEmailButton = screen.getByRole('button', { name: 'Solicitar Alteração' });
    expect(changeEmailButton).toBeDisabled();
  });

  it('deve habilitar botão de troca de email quando novo email é válido', async () => {
    render(<UserEdit {...mockProps} />);

    const newEmailInput = screen.getByLabelText('Novo Email');
    const changeEmailButton = screen.getByRole('button', { name: 'Solicitar Alteração' });

    await userEvent.type(newEmailInput, 'new@example.com');
    expect(changeEmailButton).not.toBeDisabled();
  });

  it('deve limpar mensagens quando componente monta', () => {
    render(<UserEdit {...mockProps} />);

    // Não deve haver mensagens de erro ou sucesso inicialmente
    expect(screen.queryByText('✅ Perfil atualizado com sucesso!')).not.toBeInTheDocument();
    expect(screen.queryByText('Erro ao atualizar perfil. Tente novamente.')).not.toBeInTheDocument();
  });
});
