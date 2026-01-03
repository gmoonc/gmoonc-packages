import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserProfile from '@/components/UserProfile';
import { useAuth } from '@/contexts/AuthContext';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) {
    return <img src={src} alt={alt} {...props} />;
  };
});

describe('UserProfile', () => {
  const mockLogout = jest.fn();
  const mockUser = {
    id: '1',
    email: 'test@test.com',
    name: 'Test User',
    role: 'admin',
    user_metadata: {
      full_name: 'Test User',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ avatarUrl: 'https://example.com/avatar.png' }),
    }) as jest.Mock;

    const mockUseAuth = jest.mocked(useAuth);
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: mockLogout,
      logout: mockLogout,
    });
  });

  it('deve renderizar o componente UserProfile', () => {
    render(<UserProfile />);

    expect(screen.getByLabelText('Menu do usuário')).toBeInTheDocument();
  });

  it('deve exibir avatar do usuário quando disponível', async () => {
    render(<UserProfile />);

    fireEvent.click(screen.getByLabelText('Menu do usuário'));

    await waitFor(() => {
      expect(screen.getByAltText('Avatar de Test User')).toHaveAttribute(
        'src',
        'https://example.com/avatar.png?size=80'
      );
    });
  });

  it('deve usar fallback com iniciais quando avatar não está disponível', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: jest.fn(),
    });

    render(<UserProfile />);

    fireEvent.click(screen.getByLabelText('Menu do usuário'));

    await waitFor(() => {
      expect(screen.getByText('TU')).toBeInTheDocument();
    });
  });

  it('deve abrir dropdown com informações do usuário', async () => {
    render(<UserProfile />);

    fireEvent.click(screen.getByLabelText('Menu do usuário'));

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@test.com')).toBeInTheDocument();
      expect(screen.getByText('Conta')).toBeInTheDocument();
      expect(screen.getByText('Sobre')).toBeInTheDocument();
      expect(screen.getByText('Sair')).toBeInTheDocument();
    });
  });

  it('deve acionar callbacks de navegação', async () => {
    const onAccount = jest.fn();
    const onAbout = jest.fn();

    render(<UserProfile onAccount={onAccount} onAbout={onAbout} />);

    fireEvent.click(screen.getByLabelText('Menu do usuário'));

    await waitFor(() => {
      fireEvent.click(screen.getByText('Conta'));
    });

    expect(onAccount).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText('Menu do usuário'));
    fireEvent.click(screen.getByText('Sobre'));

    expect(onAbout).toHaveBeenCalled();
  });

  it('deve acionar callback de logout', async () => {
    const onLogoutRequest = jest.fn();

    render(<UserProfile onLogoutRequest={onLogoutRequest} />);

    fireEvent.click(screen.getByLabelText('Menu do usuário'));

    await waitFor(() => {
      fireEvent.click(screen.getByText('Sair'));
    });

    expect(onLogoutRequest).toHaveBeenCalled();
  });

  it('deve fechar dropdown ao clicar fora', async () => {
    render(
      <div>
        <UserProfile />
        <div data-testid="outside">Fora do dropdown</div>
      </div>
    );

    fireEvent.click(screen.getByLabelText('Menu do usuário'));

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    const outside = screen.getByTestId('outside');
    fireEvent.mouseDown(outside);

    await waitFor(() => {
      expect(screen.queryByText('Test User')).not.toBeInTheDocument();
    });
  });

  it('deve fechar dropdown ao pressionar Escape', async () => {
    render(<UserProfile />);

    fireEvent.click(screen.getByLabelText('Menu do usuário'));

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText('Test User')).not.toBeInTheDocument();
    });
  });
});
