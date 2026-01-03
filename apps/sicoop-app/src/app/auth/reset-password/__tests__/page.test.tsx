import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import ResetPasswordPage from '../page';
import { supabase } from '@/lib/supabase';

// Mock do Next.js
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock do Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock do Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      updateUser: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

describe('ResetPasswordPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    });
  });

  it('deve renderizar loading quando não autenticado', () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null }
    });

    render(<ResetPasswordPage />);

    expect(screen.getByText('Verificando...')).toBeInTheDocument();
    expect(screen.getByText('Aguarde enquanto verificamos sua sessão')).toBeInTheDocument();
  });

  it('deve redirecionar para login quando não autenticado', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null }
    });

    render(<ResetPasswordPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/login');
    });
  });

  it('deve renderizar formulário quando autenticado', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: '123' } } }
    });

    render(<ResetPasswordPage />);

    await waitFor(() => {
      expect(screen.getByText('Redefinir Senha')).toBeInTheDocument();
      expect(screen.getByText('Digite sua nova senha')).toBeInTheDocument();
      expect(screen.getByLabelText('Nova Senha')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirmar Nova Senha')).toBeInTheDocument();
    });
  });

  it('deve exibir logo do Sicoop', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: '123' } } }
    });

    render(<ResetPasswordPage />);

    await waitFor(() => {
      expect(screen.getByAltText('Logo Goalmoon - Sicoop')).toBeInTheDocument();
    });
  });

  it('deve permitir digitar senhas', async () => {
    const user = userEvent.setup();
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: '123' } } }
    });

    render(<ResetPasswordPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Nova Senha')).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText('Nova Senha');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Nova Senha');

    await user.type(passwordInput, 'newpassword123');
    await user.type(confirmPasswordInput, 'newpassword123');

    expect(passwordInput).toHaveValue('newpassword123');
    expect(confirmPasswordInput).toHaveValue('newpassword123');
  });

  it('deve validar senha mínima de 6 caracteres', async () => {
    const user = userEvent.setup();
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: '123' } } }
    });

    render(<ResetPasswordPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Nova Senha')).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText('Nova Senha');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Nova Senha');
    const submitButton = screen.getByRole('button', { name: 'Atualizar Senha' });

    await user.type(passwordInput, '123');
    await user.type(confirmPasswordInput, '123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('A senha deve ter pelo menos 6 caracteres.')).toBeInTheDocument();
    });
  });

  it('deve validar se senhas coincidem', async () => {
    const user = userEvent.setup();
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: '123' } } }
    });

    render(<ResetPasswordPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Nova Senha')).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText('Nova Senha');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Nova Senha');
    const submitButton = screen.getByRole('button', { name: 'Atualizar Senha' });

    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'different123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('As senhas não coincidem.')).toBeInTheDocument();
    });
  });

  it('deve atualizar senha com sucesso', async () => {
    const user = userEvent.setup();
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: '123' } } }
    });
    (supabase.auth.updateUser as jest.Mock).mockResolvedValue({
      error: null
    });

    render(<ResetPasswordPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Nova Senha')).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText('Nova Senha');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Nova Senha');
    const submitButton = screen.getByRole('button', { name: 'Atualizar Senha' });

    await user.type(passwordInput, 'newpassword123');
    await user.type(confirmPasswordInput, 'newpassword123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'newpassword123'
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Senha Atualizada!')).toBeInTheDocument();
      expect(screen.getByText('Redirecionando para o login...')).toBeInTheDocument();
    });
  });

  it('deve exibir erro quando atualização falha', async () => {
    const user = userEvent.setup();
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: '123' } } }
    });
    (supabase.auth.updateUser as jest.Mock).mockResolvedValue({
      error: { message: 'Update failed' }
    });

    render(<ResetPasswordPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Nova Senha')).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText('Nova Senha');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Nova Senha');
    const submitButton = screen.getByRole('button', { name: 'Atualizar Senha' });

    await user.type(passwordInput, 'newpassword123');
    await user.type(confirmPasswordInput, 'newpassword123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Erro ao atualizar senha. Tente novamente.')).toBeInTheDocument();
    });
  });

  it('deve exibir estado de loading durante atualização', async () => {
    const user = userEvent.setup();
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: '123' } } }
    });
    (supabase.auth.updateUser as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    );

    render(<ResetPasswordPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Nova Senha')).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText('Nova Senha');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Nova Senha');
    const submitButton = screen.getByRole('button', { name: 'Atualizar Senha' });

    await user.type(passwordInput, 'newpassword123');
    await user.type(confirmPasswordInput, 'newpassword123');
    await user.click(submitButton);

    expect(screen.getByText('Atualizando...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('deve desabilitar campos durante loading', async () => {
    const user = userEvent.setup();
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: '123' } } }
    });
    (supabase.auth.updateUser as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    );

    render(<ResetPasswordPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Nova Senha')).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText('Nova Senha');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Nova Senha');
    const submitButton = screen.getByRole('button', { name: 'Atualizar Senha' });

    await user.type(passwordInput, 'newpassword123');
    await user.type(confirmPasswordInput, 'newpassword123');
    await user.click(submitButton);

    expect(passwordInput).toBeDisabled();
    expect(confirmPasswordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('deve exibir links de navegação', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: '123' } } }
    });

    render(<ResetPasswordPage />);

    await waitFor(() => {
      const loginLink = screen.getByText('Voltar para o login');
      expect(loginLink).toHaveAttribute('href', '/auth/login');
    });
  });

  it('deve exibir link de login na tela de sucesso', async () => {
    const user = userEvent.setup();
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: '123' } } }
    });
    (supabase.auth.updateUser as jest.Mock).mockResolvedValue({
      error: null
    });

    render(<ResetPasswordPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Nova Senha')).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText('Nova Senha');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Nova Senha');
    const submitButton = screen.getByRole('button', { name: 'Atualizar Senha' });

    await user.type(passwordInput, 'newpassword123');
    await user.type(confirmPasswordInput, 'newpassword123');
    await user.click(submitButton);

    await waitFor(() => {
      const loginLink = screen.getByText('Ir para o login agora');
      expect(loginLink).toHaveAttribute('href', '/auth/login');
    });
  });

  it('deve validar campos obrigatórios', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: '123' } } }
    });

    render(<ResetPasswordPage />);

    await waitFor(() => {
      const passwordInput = screen.getByLabelText('Nova Senha');
      const confirmPasswordInput = screen.getByLabelText('Confirmar Nova Senha');
      
      expect(passwordInput).toBeRequired();
      expect(confirmPasswordInput).toBeRequired();
    });
  });

  it('deve exibir placeholders corretos', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: '123' } } }
    });

    render(<ResetPasswordPage />);

    await waitFor(() => {
      const passwordInput = screen.getByLabelText('Nova Senha');
      const confirmPasswordInput = screen.getByLabelText('Confirmar Nova Senha');
      
      expect(passwordInput).toHaveAttribute('placeholder', 'Digite sua nova senha');
      expect(confirmPasswordInput).toHaveAttribute('placeholder', 'Confirme sua nova senha');
    });
  });
});
