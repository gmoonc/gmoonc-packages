import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SicoopMenu from '../SicoopMenu';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

jest.mock('@/contexts/AuthContext');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

jest.mock('@/hooks/usePermissions');
const mockUsePermissions = usePermissions as jest.MockedFunction<typeof usePermissions>;

const mockOnMenuItemClick = jest.fn();
const mockOnLogoutRequest = jest.fn();
const mockHasPermission = jest.fn();
const mockPush = jest.fn();
const mockOnLogoClick = jest.fn();

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

describe('SicoopMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUsePathname.mockReturnValue('/');
    mockUseRouter.mockReturnValue({
      push: mockPush,
      refresh: jest.fn(),
      replace: jest.fn(),
      forward: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
    });

    mockUseAuth.mockReturnValue({
      user: {
        id: 'test-user-1',
        email: 'test@example.com',
        name: 'Usuário Teste',
        role: 'cliente',
      },
      loading: false,
    });

    mockUsePermissions.mockReturnValue({
      hasPermission: mockHasPermission,
    });

    mockHasPermission.mockReturnValue(true);
  });

  it('deve renderizar apenas os módulos principais no menu lateral', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <SicoopMenu
            onMenuItemClick={mockOnMenuItemClick}
            onLogoutRequest={mockOnLogoutRequest}
          />
        </TestWrapper>
      );
    });

    expect(screen.getByAltText('Logo Goalmoon - Sicoop')).toBeInTheDocument();
    expect(screen.getByText('Administrativo')).toBeInTheDocument();
    expect(screen.getByText('Financeiro')).toBeInTheDocument();
    expect(screen.getByText('Help-Desk')).toBeInTheDocument();
    expect(screen.getByText('Secretaria')).toBeInTheDocument();
    expect(screen.getByText('Técnico')).toBeInTheDocument();
    expect(screen.getByText('Vendas')).toBeInTheDocument();
    expect(screen.getByText('Cliente')).toBeInTheDocument();
    expect(screen.queryByText('Conta')).not.toBeInTheDocument();
    expect(screen.queryByText('Sobre')).not.toBeInTheDocument();
    expect(screen.queryByText('Sair')).not.toBeInTheDocument();
  });

  it('deve abrir e fechar submenu quando um módulo é clicado', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <TestWrapper>
          <SicoopMenu
            onMenuItemClick={mockOnMenuItemClick}
            onLogoutRequest={mockOnLogoutRequest}
          />
        </TestWrapper>
      );
    });

    await user.click(screen.getByText('Administrativo'));

    expect(screen.getByText('Usuários')).toBeInTheDocument();
    expect(screen.getByText('Permissões')).toBeInTheDocument();

    await user.click(screen.getByText('Administrativo'));

    expect(screen.queryByText('Usuários')).not.toBeInTheDocument();
  });

  it('deve chamar onMenuItemClick quando item do submenu é clicado', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <TestWrapper>
          <SicoopMenu
            onMenuItemClick={mockOnMenuItemClick}
            onLogoutRequest={mockOnLogoutRequest}
          />
        </TestWrapper>
      );
    });

    await user.click(screen.getByText('Cliente'));
    await user.click(screen.getByText('Análises'));

    expect(mockOnMenuItemClick).toHaveBeenCalledWith({
      id: 'analises-cliente',
      label: 'Análises',
      href: '/cliente/analises',
      module: 'cliente',
      permissionType: 'read'
    });
  });

  it('deve aplicar a classe active no subitem correspondente à rota atual', async () => {
    mockUsePathname.mockReturnValue('/cliente/analises');

    await act(async () => {
      render(
        <TestWrapper>
          <SicoopMenu
            onMenuItemClick={mockOnMenuItemClick}
            onLogoutRequest={mockOnLogoutRequest}
            onLogoClick={mockOnLogoClick}
          />
        </TestWrapper>
      );
    });

    const activeLink = await screen.findByText('Análises');
    expect(activeLink).toHaveClass('submenu-link', 'active');
  });

  it('deve manter destaque visual após clicar em um subitem sem alterar a rota', async () => {
    const user = userEvent.setup();

    mockUsePathname.mockReturnValue('/');

    await act(async () => {
      render(
        <TestWrapper>
          <SicoopMenu
            onMenuItemClick={mockOnMenuItemClick}
            onLogoutRequest={mockOnLogoutRequest}
            onLogoClick={mockOnLogoClick}
          />
        </TestWrapper>
      );
    });

    await user.click(screen.getByText('Cliente'));

    if (!screen.queryByText('Mensagens')) {
      await user.click(screen.getByText('Cliente'));
    }

    await user.click(screen.getByText('Mensagens'));

    const activeLink = screen.getByText('Mensagens');
    expect(activeLink).toHaveClass('submenu-link', 'active');
  });

  it('deve manter o submenu escolhido manualmente aberto mesmo com subitem ativo em outro menu', async () => {
    const user = userEvent.setup();

    mockUsePathname.mockReturnValue('/cliente/analises');

    const { rerender } = render(
      <TestWrapper>
        <SicoopMenu
          onMenuItemClick={mockOnMenuItemClick}
          onLogoutRequest={mockOnLogoutRequest}
        />
      </TestWrapper>
    );

    await user.click(screen.getByText('Administrativo'));

    expect(screen.getByText('Usuários')).toBeInTheDocument();

    mockUsePathname.mockReturnValue('/cliente/mensagens/?foo=1');

    rerender(
      <TestWrapper>
        <SicoopMenu
          onMenuItemClick={mockOnMenuItemClick}
          onLogoutRequest={mockOnLogoutRequest}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Usuários')).toBeInTheDocument();
  });

  it('deve fechar o submenu ao clicar novamente no subitem já selecionado', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <TestWrapper>
          <SicoopMenu
            onMenuItemClick={mockOnMenuItemClick}
            onLogoutRequest={mockOnLogoutRequest}
            onLogoClick={mockOnLogoClick}
          />
        </TestWrapper>
      );
    });

    await user.click(screen.getByText('Cliente'));
    await user.click(screen.getByText('Mensagens'));

    expect(screen.getByText('Mensagens')).toBeInTheDocument();

    await user.click(screen.getByText('Mensagens'));

    expect(screen.queryByText('Mensagens')).not.toBeInTheDocument();
    expect(screen.queryByText('Análises')).not.toBeInTheDocument();
  });

  it('deve permitir abrir outro menu principal mesmo com subitem ativo', async () => {
    const user = userEvent.setup();

    mockUsePathname.mockReturnValue('/cliente/analises');

    await act(async () => {
      render(
        <TestWrapper>
          <SicoopMenu
            onMenuItemClick={mockOnMenuItemClick}
            onLogoutRequest={mockOnLogoutRequest}
            onLogoClick={mockOnLogoClick}
          />
        </TestWrapper>
      );
    });

    expect(screen.getByText('Análises')).toBeInTheDocument();

    await user.click(screen.getByText('Administrativo'));

    expect(screen.getByText('Usuários')).toBeInTheDocument();
    expect(screen.queryByText('Análises')).not.toBeInTheDocument();
  });

  it('deve filtrar itens do menu baseado nas permissões do usuário', async () => {
    mockHasPermission.mockImplementation(({ moduleName }) => {
      return moduleName !== 'administrativo';
    });

    await act(async () => {
      render(
        <TestWrapper>
          <SicoopMenu
            onMenuItemClick={mockOnMenuItemClick}
            onLogoutRequest={mockOnLogoutRequest}
          />
        </TestWrapper>
      );
    });

    expect(screen.queryByText('Administrativo')).not.toBeInTheDocument();
    expect(screen.getByText('Cliente')).toBeInTheDocument();
  });

  it('deve mostrar apenas módulos permitidos quando usuário tem permissão parcial', async () => {
    mockHasPermission.mockImplementation(({ moduleName }) => {
      return moduleName === 'cliente';
    });

    await act(async () => {
      render(
        <TestWrapper>
          <SicoopMenu
            onMenuItemClick={mockOnMenuItemClick}
            onLogoutRequest={mockOnLogoutRequest}
          />
        </TestWrapper>
      );
    });

    expect(screen.getByText('Cliente')).toBeInTheDocument();
    expect(screen.queryByText('Administrativo')).not.toBeInTheDocument();
    expect(screen.queryByText('Financeiro')).not.toBeInTheDocument();
  });

  it('deve esconder itens quando usuário não autenticado', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    await act(async () => {
      render(
        <TestWrapper>
          <SicoopMenu
            onMenuItemClick={mockOnMenuItemClick}
            onLogoutRequest={mockOnLogoutRequest}
          />
        </TestWrapper>
      );
    });

    expect(screen.queryByText('Cliente')).not.toBeInTheDocument();
    expect(screen.queryByText('Administrativo')).not.toBeInTheDocument();
    expect(screen.queryByText('Financeiro')).not.toBeInTheDocument();
  });

  it('deve mostrar a seta de submenu para cada módulo', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <SicoopMenu
          onMenuItemClick={mockOnMenuItemClick}
          onLogoutRequest={mockOnLogoutRequest}
        />
      </TestWrapper>
    );

    expect(document.querySelectorAll('.submenu-arrow')).toHaveLength(7);

    await user.click(screen.getByText('Cliente'));

    expect(document.querySelector('.submenu-arrow svg')).toBeInTheDocument();
  });

  it('deve funcionar sem callbacks opcionais', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <SicoopMenu />
        </TestWrapper>
      );
    });

    expect(screen.getByText('Cliente')).toBeInTheDocument();
  });
});
