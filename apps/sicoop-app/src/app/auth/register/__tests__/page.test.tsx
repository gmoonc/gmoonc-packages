import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import RegisterPage from '../page';

// Mock do Next.js
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock do AuthContext
const mockRegister = jest.fn();
const mockUseAuth = jest.fn();

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('RegisterPage', () => {
  const mockPush = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    
    // Configurar mock padrão do useAuth
    mockUseAuth.mockReturnValue({
      register: mockRegister,
      isLoading: false,
    });
  });

  describe('renderização básica', () => {
    it('deve renderizar a página de registro corretamente', () => {
      render(<RegisterPage />);

      // Verificar elementos principais
      expect(screen.getByRole('heading', { name: 'Criar Conta' })).toBeInTheDocument();
      expect(screen.getByText('Sicoop - Sistema da Goalmoon')).toBeInTheDocument();
      expect(screen.getByLabelText('Nome Completo')).toBeInTheDocument();
      expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
      expect(screen.getByLabelText('Senha')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirmar Senha')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Criar Conta' })).toBeInTheDocument();
    });

    it('deve renderizar link de navegação', () => {
      render(<RegisterPage />);

      expect(screen.getByText('Já tem uma conta? Faça login')).toBeInTheDocument();
    });

    it('deve renderizar logo da empresa', () => {
      render(<RegisterPage />);

      const logo = screen.getByAltText('Logo Goalmoon - Sicoop');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', '/logo.png');
    });
  });

  describe('interações do formulário', () => {
    it('deve permitir preenchimento dos campos', async () => {
      render(<RegisterPage />);

      const nameInput = screen.getByLabelText('Nome Completo');
      const emailInput = screen.getByLabelText('E-mail');
      const passwordInput = screen.getByLabelText('Senha');
      const confirmPasswordInput = screen.getByLabelText('Confirmar Senha');

      await user.type(nameInput, 'João Silva');
      await user.type(emailInput, 'joao@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');

      expect(nameInput).toHaveValue('João Silva');
      expect(emailInput).toHaveValue('joao@example.com');
      expect(passwordInput).toHaveValue('password123');
      expect(confirmPasswordInput).toHaveValue('password123');
    });

    it('deve chamar register ao submeter formulário com dados válidos', async () => {
      mockRegister.mockResolvedValue(undefined);
      render(<RegisterPage />);

      const nameInput = screen.getByLabelText('Nome Completo');
      const emailInput = screen.getByLabelText('E-mail');
      const passwordInput = screen.getByLabelText('Senha');
      const confirmPasswordInput = screen.getByLabelText('Confirmar Senha');
      const submitButton = screen.getByRole('button', { name: 'Criar Conta' });

      await user.type(nameInput, 'João Silva');
      await user.type(emailInput, 'joao@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      expect(mockRegister).toHaveBeenCalledWith({
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });
    });
  });

  describe('validação de senha', () => {
    it('deve mostrar erro quando senhas não coincidem', async () => {
      render(<RegisterPage />);

      const nameInput = screen.getByLabelText('Nome Completo');
      const emailInput = screen.getByLabelText('E-mail');
      const passwordInput = screen.getByLabelText('Senha');
      const confirmPasswordInput = screen.getByLabelText('Confirmar Senha');
      const submitButton = screen.getByRole('button', { name: 'Criar Conta' });

      await user.type(nameInput, 'João Silva');
      await user.type(emailInput, 'joao@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'different123');
      await user.click(submitButton);

      expect(screen.getByText('As senhas não coincidem.')).toBeInTheDocument();
      expect(mockRegister).not.toHaveBeenCalled();
    });

    it('deve mostrar erro quando senha é muito curta', async () => {
      render(<RegisterPage />);

      const nameInput = screen.getByLabelText('Nome Completo');
      const emailInput = screen.getByLabelText('E-mail');
      const passwordInput = screen.getByLabelText('Senha');
      const confirmPasswordInput = screen.getByLabelText('Confirmar Senha');
      const submitButton = screen.getByRole('button', { name: 'Criar Conta' });

      await user.type(nameInput, 'João Silva');
      await user.type(emailInput, 'joao@example.com');
      await user.type(passwordInput, '123');
      await user.type(confirmPasswordInput, '123');
      await user.click(submitButton);

      expect(screen.getByText('A senha deve ter pelo menos 6 caracteres.')).toBeInTheDocument();
      expect(mockRegister).not.toHaveBeenCalled();
    });

    it('deve aceitar senha com 6 caracteres ou mais', async () => {
      mockRegister.mockResolvedValue(undefined);
      render(<RegisterPage />);

      const nameInput = screen.getByLabelText('Nome Completo');
      const emailInput = screen.getByLabelText('E-mail');
      const passwordInput = screen.getByLabelText('Senha');
      const confirmPasswordInput = screen.getByLabelText('Confirmar Senha');
      const submitButton = screen.getByRole('button', { name: 'Criar Conta' });

      await user.type(nameInput, 'João Silva');
      await user.type(emailInput, 'joao@example.com');
      await user.type(passwordInput, '123456');
      await user.type(confirmPasswordInput, '123456');
      await user.click(submitButton);

      expect(mockRegister).toHaveBeenCalled();
    });
  });

  describe('estados de loading', () => {
    it('deve mostrar loading quando isLoading é true', () => {
      mockUseAuth.mockReturnValue({
        register: mockRegister,
        isLoading: true,
      });

      render(<RegisterPage />);

      expect(screen.getByText('Criando conta...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Criando conta...' })).toBeDisabled();
    });

    it('deve desabilitar campos durante loading', () => {
      mockUseAuth.mockReturnValue({
        register: mockRegister,
        isLoading: true,
      });

      render(<RegisterPage />);

      expect(screen.getByLabelText('Nome Completo')).toBeDisabled();
      expect(screen.getByLabelText('E-mail')).toBeDisabled();
      expect(screen.getByLabelText('Senha')).toBeDisabled();
      expect(screen.getByLabelText('Confirmar Senha')).toBeDisabled();
    });
  });

  describe('tratamento de erros e sucesso', () => {
    it('deve exibir mensagem de sucesso após registro bem-sucedido', async () => {
      mockRegister.mockResolvedValue(undefined);
      render(<RegisterPage />);

      const nameInput = screen.getByLabelText('Nome Completo');
      const emailInput = screen.getByLabelText('E-mail');
      const passwordInput = screen.getByLabelText('Senha');
      const confirmPasswordInput = screen.getByLabelText('Confirmar Senha');
      const submitButton = screen.getByRole('button', { name: 'Criar Conta' });

      await user.type(nameInput, 'João Silva');
      await user.type(emailInput, 'joao@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Conta criada com sucesso! Verifique seu email para ativar a conta.')).toBeInTheDocument();
      });
    });

    it('deve exibir erro quando register falha', async () => {
      const errorMessage = 'Email já está em uso';
      mockRegister.mockRejectedValue(new Error(errorMessage));
      render(<RegisterPage />);

      const nameInput = screen.getByLabelText('Nome Completo');
      const emailInput = screen.getByLabelText('E-mail');
      const passwordInput = screen.getByLabelText('Senha');
      const confirmPasswordInput = screen.getByLabelText('Confirmar Senha');
      const submitButton = screen.getByRole('button', { name: 'Criar Conta' });

      await user.type(nameInput, 'João Silva');
      await user.type(emailInput, 'joao@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('deve exibir erro genérico quando register falha sem mensagem específica', async () => {
      mockRegister.mockRejectedValue({});
      render(<RegisterPage />);

      const nameInput = screen.getByLabelText('Nome Completo');
      const emailInput = screen.getByLabelText('E-mail');
      const passwordInput = screen.getByLabelText('Senha');
      const confirmPasswordInput = screen.getByLabelText('Confirmar Senha');
      const submitButton = screen.getByRole('button', { name: 'Criar Conta' });

      await user.type(nameInput, 'João Silva');
      await user.type(emailInput, 'joao@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Erro ao criar conta. Tente novamente.')).toBeInTheDocument();
      });
    });

    it('deve limpar erros e sucesso ao submeter novo formulário', async () => {
      mockRegister.mockRejectedValue(new Error('Erro inicial'));
      render(<RegisterPage />);

      const nameInput = screen.getByLabelText('Nome Completo');
      const emailInput = screen.getByLabelText('E-mail');
      const passwordInput = screen.getByLabelText('Senha');
      const confirmPasswordInput = screen.getByLabelText('Confirmar Senha');
      const submitButton = screen.getByRole('button', { name: 'Criar Conta' });

      // Primeiro submit com erro
      await user.type(nameInput, 'João Silva');
      await user.type(emailInput, 'joao@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Erro inicial')).toBeInTheDocument();
      });

      // Segundo submit - erro deve ser limpo
      mockRegister.mockResolvedValue(undefined);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('Erro inicial')).not.toBeInTheDocument();
      });
    });
  });

  describe('validação de formulário', () => {
    it('deve ter campos obrigatórios', () => {
      render(<RegisterPage />);

      expect(screen.getByLabelText('Nome Completo')).toBeRequired();
      expect(screen.getByLabelText('E-mail')).toBeRequired();
      expect(screen.getByLabelText('Senha')).toBeRequired();
      expect(screen.getByLabelText('Confirmar Senha')).toBeRequired();
    });

    it('deve ter tipos de input corretos', () => {
      render(<RegisterPage />);

      expect(screen.getByLabelText('Nome Completo')).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText('E-mail')).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password');
      expect(screen.getByLabelText('Confirmar Senha')).toHaveAttribute('type', 'password');
    });

    it('deve ter placeholders corretos', () => {
      render(<RegisterPage />);

      expect(screen.getByLabelText('Nome Completo')).toHaveAttribute('placeholder', 'Seu nome completo');
      expect(screen.getByLabelText('E-mail')).toHaveAttribute('placeholder', 'seu@email.com');
      expect(screen.getByLabelText('Senha')).toHaveAttribute('placeholder', 'Mínimo 6 caracteres');
      expect(screen.getByLabelText('Confirmar Senha')).toHaveAttribute('placeholder', 'Confirme sua senha');
    });

    it('deve ter autocomplete correto', () => {
      render(<RegisterPage />);

      expect(screen.getByLabelText('E-mail')).toHaveAttribute('autocomplete', 'email');
      expect(screen.getByLabelText('Senha')).toHaveAttribute('autocomplete', 'new-password');
      expect(screen.getByLabelText('Confirmar Senha')).toHaveAttribute('autocomplete', 'new-password');
    });
  });

  describe('navegação', () => {
    it('deve ter link para login', () => {
      render(<RegisterPage />);

      const loginLink = screen.getByText('Já tem uma conta? Faça login');
      expect(loginLink).toHaveAttribute('href', '/auth/login');
    });
  });

  describe('acessibilidade', () => {
    it('deve ter labels associados aos inputs', () => {
      render(<RegisterPage />);

      expect(screen.getByLabelText('Nome Completo')).toBeInTheDocument();
      expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
      expect(screen.getByLabelText('Senha')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirmar Senha')).toBeInTheDocument();
    });

    it('deve ter texto alternativo na imagem', () => {
      render(<RegisterPage />);

      const logo = screen.getByAltText('Logo Goalmoon - Sicoop');
      expect(logo).toBeInTheDocument();
    });
  });
});
