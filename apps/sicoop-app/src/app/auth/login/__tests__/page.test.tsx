import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import LoginPage from '../page';

// Mock do Next.js
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock do AuthContext
const mockLogin = jest.fn();
const mockClearError = jest.fn();
const mockResendConfirmationEmail = jest.fn();
const mockUseAuth = jest.fn();

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('LoginPage', () => {
  const mockPush = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    
    // Configurar mock padrão do useAuth
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
      clearError: mockClearError,
      resendConfirmationEmail: mockResendConfirmationEmail,
    });
  });

  describe('renderização básica', () => {
    it('deve renderizar a página de login corretamente', () => {
      render(<LoginPage />);

      // Verificar elementos principais
      expect(screen.getByText('Sicoop')).toBeInTheDocument();
      expect(screen.getByText('Sistema de Controle de Operações da Goalmoon')).toBeInTheDocument();
      expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
      expect(screen.getByLabelText('Senha')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    });

    it('deve renderizar links de navegação', () => {
      render(<LoginPage />);

      expect(screen.getByText('Esqueceu sua senha?')).toBeInTheDocument();
      expect(screen.getByText('Criar conta')).toBeInTheDocument();
    });

    it('deve renderizar logo da empresa', () => {
      render(<LoginPage />);

      const logo = screen.getByAltText('Logo Goalmoon - Sicoop');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', '/logo.png');
    });
  });

  describe('interações do formulário', () => {
    it('deve permitir preenchimento dos campos', async () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('E-mail');
      const passwordInput = screen.getByLabelText('Senha');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
    });

    it('deve chamar login ao submeter formulário', async () => {
      mockLogin.mockResolvedValue(undefined);
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('E-mail');
      const passwordInput = screen.getByLabelText('Senha');
      const submitButton = screen.getByRole('button', { name: 'Entrar' });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(mockClearError).toHaveBeenCalled();
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('deve limpar erro antes de tentar login', async () => {
      mockLogin.mockResolvedValue(undefined);
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('E-mail');
      const passwordInput = screen.getByLabelText('Senha');
      const submitButton = screen.getByRole('button', { name: 'Entrar' });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(mockClearError).toHaveBeenCalled();
      expect(mockLogin).toHaveBeenCalled();
    });
  });

  describe('estados de loading', () => {
    it('deve mostrar loading quando isLoading é true', () => {
      mockUseAuth.mockReturnValue({
        login: mockLogin,
        isLoading: true,
        error: null,
        clearError: mockClearError,
        resendConfirmationEmail: mockResendConfirmationEmail,
      });

      render(<LoginPage />);

      expect(screen.getByText('Entrando...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Entrando...' })).toBeDisabled();
    });

    it('deve desabilitar campos durante loading', () => {
      mockUseAuth.mockReturnValue({
        login: mockLogin,
        isLoading: true,
        error: null,
        clearError: mockClearError,
        resendConfirmationEmail: mockResendConfirmationEmail,
      });

      render(<LoginPage />);

      expect(screen.getByLabelText('E-mail')).toBeDisabled();
      expect(screen.getByLabelText('Senha')).toBeDisabled();
    });
  });

  describe('tratamento de erros', () => {
    it('deve exibir erro quando há erro no contexto', () => {
      mockUseAuth.mockReturnValue({
        login: mockLogin,
        isLoading: false,
        error: 'Credenciais inválidas',
        clearError: mockClearError,
        resendConfirmationEmail: mockResendConfirmationEmail,
      });

      render(<LoginPage />);

      expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument();
    });

    it('deve exibir instruções para email não confirmado', () => {
      mockUseAuth.mockReturnValue({
        login: mockLogin,
        isLoading: false,
        error: 'Email não confirmado',
        clearError: mockClearError,
        resendConfirmationEmail: mockResendConfirmationEmail,
      });

      render(<LoginPage />);

      expect(screen.getByText('Email não confirmado')).toBeInTheDocument();
      expect(screen.getByText('Para ativar sua conta:')).toBeInTheDocument();
      expect(screen.getByText('Reenviar Email de Confirmação')).toBeInTheDocument();
    });

    it('deve chamar resendConfirmationEmail ao clicar no botão de reenvio', async () => {
      mockResendConfirmationEmail.mockResolvedValue(undefined);
      mockUseAuth.mockReturnValue({
        login: mockLogin,
        isLoading: false,
        error: 'Email não confirmado',
        clearError: mockClearError,
        resendConfirmationEmail: mockResendConfirmationEmail,
      });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText('E-mail');
      await user.type(emailInput, 'test@example.com');

      const resendButton = screen.getByText('Reenviar Email de Confirmação');
      await user.click(resendButton);

      expect(mockResendConfirmationEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('deve desabilitar botão de reenvio durante loading', () => {
      mockUseAuth.mockReturnValue({
        login: mockLogin,
        isLoading: true,
        error: 'Email não confirmado',
        clearError: mockClearError,
        resendConfirmationEmail: mockResendConfirmationEmail,
      });

      render(<LoginPage />);

      expect(screen.getByText('Enviando...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Enviando...' })).toBeDisabled();
    });
  });

  describe('validação de formulário', () => {
    it('deve ter campos obrigatórios', () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('E-mail');
      const passwordInput = screen.getByLabelText('Senha');

      expect(emailInput).toBeRequired();
      expect(passwordInput).toBeRequired();
    });

    it('deve ter tipo de input correto', () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('E-mail');
      const passwordInput = screen.getByLabelText('Senha');

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('deve ter placeholders corretos', () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('E-mail');
      const passwordInput = screen.getByLabelText('Senha');

      expect(emailInput).toHaveAttribute('placeholder', 'seu@email.com');
      expect(passwordInput).toHaveAttribute('placeholder', 'Sua senha');
    });

    it('deve ter autocomplete correto', () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('E-mail');
      const passwordInput = screen.getByLabelText('Senha');

      expect(emailInput).toHaveAttribute('autocomplete', 'username');
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    });
  });

  describe('navegação', () => {
    it('deve ter link para esqueci senha', () => {
      render(<LoginPage />);

      const forgotPasswordLink = screen.getByText('Esqueceu sua senha?');
      expect(forgotPasswordLink).toHaveAttribute('href', '/auth/forgot-password');
    });

    it('deve ter link para criar conta', () => {
      render(<LoginPage />);

      const registerLink = screen.getByText('Criar conta');
      expect(registerLink).toHaveAttribute('href', '/auth/register');
    });
  });

  describe('acessibilidade', () => {
    it('deve ter labels associados aos inputs', () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('E-mail');
      const passwordInput = screen.getByLabelText('Senha');

      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });

    it('deve ter texto alternativo na imagem', () => {
      render(<LoginPage />);

      const logo = screen.getByAltText('Logo Goalmoon - Sicoop');
      expect(logo).toBeInTheDocument();
    });
  });
});
