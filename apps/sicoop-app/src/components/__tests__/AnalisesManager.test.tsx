import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnalisesManager from '../AnalisesManager';
import { useAnalises } from '@/hooks/useAnalises';

// Mock do hook useAnalises
jest.mock('@/hooks/useAnalises');
const mockUseAnalises = useAnalises as jest.MockedFunction<typeof useAnalises>;

// Mock do contexto de autenticação
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Usuário Teste',
      role: 'cliente',
    },
    loading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock do window.confirm
const mockConfirm = jest.fn();
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true,
});

// Mock das funções do hook
const mockCreateAnalise = jest.fn();
const mockUpdateAnalise = jest.fn();
const mockDeleteAnalise = jest.fn();

// Dados de teste
const mockAnalises = [
  {
    id: '1',
    nome: 'João Silva',
    email: 'joao@example.com',
    telefone: '(11) 99999-9999',
    nome_fazenda: 'Fazenda Teste',
    area_fazenda_ha: 100,
    latitude: -23.5505,
    longitude: -46.6333,
    observacoes: 'Observações da análise',
    status: 'pendente',
    created_at: '2025-01-01T10:00:00Z',
    updated_at: '2025-01-01T10:00:00Z',
  },
  {
    id: '2',
    nome: 'Maria Santos',
    email: 'maria@example.com',
    telefone: '(11) 88888-8888',
    nome_fazenda: 'Fazenda Maria',
    area_fazenda_ha: 200,
    latitude: -22.9068,
    longitude: -43.1729,
    observacoes: 'Observações da análise 2',
    status: 'em_analise',
    created_at: '2025-01-02T10:00:00Z',
    updated_at: '2025-01-02T10:00:00Z',
  },
];

// Wrapper de teste
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

describe('AnalisesManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConfirm.mockReturnValue(true);
    
    mockUseAnalises.mockReturnValue({
      analises: mockAnalises,
      loading: false,
      error: null,
      createAnalise: mockCreateAnalise,
      updateAnalise: mockUpdateAnalise,
      deleteAnalise: mockDeleteAnalise,
    });
  });

  it('deve renderizar o gerenciador de análises corretamente', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <AnalisesManager />
        </TestWrapper>
      );
    });

    expect(screen.getByText('Gerencie suas análises de cobertura de sinal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nova Análise/i })).toBeInTheDocument();
    // João Silva e Maria Santos aparecem múltiplas vezes (desktop, tablet, mobile), usar getAllByText
    expect(screen.getAllByText('João Silva').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Maria Santos').length).toBeGreaterThan(0);
  });

  it('deve mostrar estado de loading', async () => {
    mockUseAnalises.mockReturnValue({
      analises: [],
      loading: true,
      error: null,
      createAnalise: mockCreateAnalise,
      updateAnalise: mockUpdateAnalise,
      deleteAnalise: mockDeleteAnalise,
    });

    await act(async () => {
      render(
        <TestWrapper>
          <AnalisesManager />
        </TestWrapper>
      );
    });

    expect(screen.getByText('Carregando análises...')).toBeInTheDocument();
  });

  it('deve mostrar erro quando há erro', async () => {
    mockUseAnalises.mockReturnValue({
      analises: [],
      loading: false,
      error: 'Erro ao carregar análises',
      createAnalise: mockCreateAnalise,
      updateAnalise: mockUpdateAnalise,
      deleteAnalise: mockDeleteAnalise,
    });

    await act(async () => {
      render(
        <TestWrapper>
          <AnalisesManager />
        </TestWrapper>
      );
    });

    expect(screen.getByText('Erro: Erro ao carregar análises')).toBeInTheDocument();
  });

  it('deve abrir formulário quando botão Nova Análise é clicado', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <TestWrapper>
          <AnalisesManager />
        </TestWrapper>
      );
    });

    // Clicar no botão Nova Análise (texto está dividido em spans)
    await user.click(screen.getByRole('button', { name: /Nova Análise/i }));

    // Verificar se formulário foi aberto
    expect(screen.getByText('Nome')).toBeInTheDocument();
    expect(screen.getByText('E-mail')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('deve fechar formulário quando botão Cancelar é clicado', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <TestWrapper>
          <AnalisesManager />
        </TestWrapper>
      );
    });

    // Abrir formulário (texto está dividido em spans)
    await user.click(screen.getByRole('button', { name: /Nova Análise/i }));
    expect(screen.getByText('Nome')).toBeInTheDocument();

    // Clicar em Cancelar
    await user.click(screen.getByText('Cancelar'));

    // Verificar se voltou para a lista
    expect(screen.getByText('Gerencie suas análises de cobertura de sinal')).toBeInTheDocument();
    // Verificar se o formulário foi fechado (não deve ter campos do formulário)
    expect(screen.queryByLabelText(/nome/i)).not.toBeInTheDocument();
  });

  it('deve chamar createAnalise quando formulário é enviado para nova análise', async () => {
    const user = userEvent.setup();
    mockCreateAnalise.mockResolvedValue(true);

    await act(async () => {
      render(
        <TestWrapper>
          <AnalisesManager />
        </TestWrapper>
      );
    });

    // Abrir formulário (texto está dividido em spans)
    await user.click(screen.getByRole('button', { name: /Nova Análise/i }));

    // Preencher formulário
    const nomeInput = screen.getByDisplayValue('Usuário Teste');
    await user.clear(nomeInput);
    await user.type(nomeInput, 'João Silva');
    
    const emailInput = screen.getByDisplayValue('test@example.com');
    await user.clear(emailInput);
    await user.type(emailInput, 'joao@example.com');
    
    await user.type(screen.getByLabelText(/telefone/i), '(11) 99999-9999');
    await user.type(screen.getByLabelText(/nome da fazenda/i), 'Fazenda Teste');
    await user.type(screen.getByLabelText(/área da fazenda \(ha\)/i), '100');
    await user.type(screen.getByLabelText(/latitude/i), '-23.5505');
    await user.type(screen.getByLabelText(/longitude/i), '-46.6333');
    await user.type(screen.getByLabelText(/observações/i), 'Observações da análise');

    // Enviar formulário
    await user.click(screen.getByText('Criar Análise'));

    // Verificar se createAnalise foi chamado
    await waitFor(() => {
      expect(mockCreateAnalise).toHaveBeenCalledWith({
        nome: 'João Silva',
        email: 'joao@example.com',
        telefone: '(11) 99999-9999',
        nome_fazenda: 'Fazenda Teste',
        area_fazenda_ha: '100',
        latitude: '-23.5505',
        longitude: '-46.6333',
        observacoes: 'Observações da análise',
      });
    });
  });

  it('deve chamar updateAnalise quando formulário é enviado para edição', async () => {
    const user = userEvent.setup();
    mockUpdateAnalise.mockResolvedValue(true);

    await act(async () => {
      render(
        <TestWrapper>
          <AnalisesManager />
        </TestWrapper>
      );
    });

    // Clicar no botão editar da primeira análise
    const editButtons = screen.getAllByTitle('Editar');
    await user.click(editButtons[0]);

    // Verificar se formulário está preenchido com dados da análise
    expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    expect(screen.getByDisplayValue('joao@example.com')).toBeInTheDocument();

    // Modificar dados
    const nomeInput = screen.getByDisplayValue('João Silva');
    await user.clear(nomeInput);
    await user.type(nomeInput, 'João Silva Modificado');

    // Enviar formulário
    await user.click(screen.getByText('Atualizar Análise'));

    // Verificar se updateAnalise foi chamado
    await waitFor(() => {
      expect(mockUpdateAnalise).toHaveBeenCalledWith('1', {
        nome: 'João Silva Modificado',
        email: 'joao@example.com',
        telefone: '(11) 99999-9999',
        nome_fazenda: 'Fazenda Teste',
        area_fazenda_ha: '100',
        latitude: '-23.5505',
        longitude: '-46.6333',
        observacoes: 'Observações da análise',
      });
    });
  });

  it('deve chamar deleteAnalise quando botão excluir é clicado e confirmado', async () => {
    const user = userEvent.setup();
    mockDeleteAnalise.mockResolvedValue(true);

    await act(async () => {
      render(
        <TestWrapper>
          <AnalisesManager />
        </TestWrapper>
      );
    });

    // Clicar no botão excluir da primeira análise
    const deleteButtons = screen.getAllByTitle('Excluir');
    await user.click(deleteButtons[0]);

    // Verificar se confirm foi chamado
    expect(mockConfirm).toHaveBeenCalledWith('Tem certeza que deseja excluir esta análise?');

    // Verificar se deleteAnalise foi chamado
    await waitFor(() => {
      expect(mockDeleteAnalise).toHaveBeenCalledWith('1');
    });
  });

  it('não deve chamar deleteAnalise quando confirmação é cancelada', async () => {
    const user = userEvent.setup();
    mockConfirm.mockReturnValue(false);

    await act(async () => {
      render(
        <TestWrapper>
          <AnalisesManager />
        </TestWrapper>
      );
    });

    // Clicar no botão excluir da primeira análise
    const deleteButtons = screen.getAllByTitle('Excluir');
    await user.click(deleteButtons[0]);

    // Verificar se deleteAnalise não foi chamado
    expect(mockDeleteAnalise).not.toHaveBeenCalled();
  });

  it('deve fechar formulário após criação bem-sucedida', async () => {
    const user = userEvent.setup();
    mockCreateAnalise.mockResolvedValue(true);

    await act(async () => {
      render(
        <TestWrapper>
          <AnalisesManager />
        </TestWrapper>
      );
    });

    // Abrir formulário (texto está dividido em spans)
    await user.click(screen.getByRole('button', { name: /Nova Análise/i }));

    // Preencher e enviar formulário
    const nomeInput = screen.getByDisplayValue('Usuário Teste');
    await user.clear(nomeInput);
    await user.type(nomeInput, 'João Silva');
    
    const emailInput = screen.getByDisplayValue('test@example.com');
    await user.clear(emailInput);
    await user.type(emailInput, 'joao@example.com');
    
    await user.type(screen.getByLabelText(/telefone/i), '(11) 99999-9999');
    await user.type(screen.getByLabelText(/nome da fazenda/i), 'Fazenda Teste');
    await user.type(screen.getByLabelText(/área da fazenda \(ha\)/i), '100');
    await user.type(screen.getByLabelText(/latitude/i), '-23.5505');
    await user.type(screen.getByLabelText(/longitude/i), '-46.6333');
    await user.type(screen.getByLabelText(/observações/i), 'Observações da análise');

    await user.click(screen.getByText('Criar Análise'));

    // Verificar se formulário foi fechado
    await waitFor(() => {
      expect(screen.getByText('Gerencie suas análises de cobertura de sinal')).toBeInTheDocument();
      // Verificar se o formulário foi fechado (não deve ter campos do formulário)
      expect(screen.queryByLabelText(/nome/i)).not.toBeInTheDocument();
    });
  });

  it('deve fechar formulário após edição bem-sucedida', async () => {
    const user = userEvent.setup();
    mockUpdateAnalise.mockResolvedValue(true);

    await act(async () => {
      render(
        <TestWrapper>
          <AnalisesManager />
        </TestWrapper>
      );
    });

    // Clicar no botão editar da primeira análise
    const editButtons = screen.getAllByTitle('Editar');
    await user.click(editButtons[0]);

    // Enviar formulário sem modificações
    await user.click(screen.getByText('Atualizar Análise'));

    // Verificar se formulário foi fechado
    await waitFor(() => {
      expect(screen.getByText('Gerencie suas análises de cobertura de sinal')).toBeInTheDocument();
      // Verificar se o formulário foi fechado (não deve ter campos do formulário)
      expect(screen.queryByLabelText(/nome/i)).not.toBeInTheDocument();
    });
  });

  it('deve manter formulário aberto quando criação falha', async () => {
    const user = userEvent.setup();
    mockCreateAnalise.mockResolvedValue(false);

    await act(async () => {
      render(
        <TestWrapper>
          <AnalisesManager />
        </TestWrapper>
      );
    });

    // Abrir formulário (texto está dividido em spans)
    await user.click(screen.getByRole('button', { name: /Nova Análise/i }));

    // Preencher e enviar formulário
    const nomeInput = screen.getByDisplayValue('Usuário Teste');
    await user.clear(nomeInput);
    await user.type(nomeInput, 'João Silva');
    
    const emailInput = screen.getByDisplayValue('test@example.com');
    await user.clear(emailInput);
    await user.type(emailInput, 'joao@example.com');
    
    await user.type(screen.getByLabelText(/telefone/i), '(11) 99999-9999');
    await user.type(screen.getByLabelText(/nome da fazenda/i), 'Fazenda Teste');
    await user.type(screen.getByLabelText(/área da fazenda \(ha\)/i), '100');
    await user.type(screen.getByLabelText(/latitude/i), '-23.5505');
    await user.type(screen.getByLabelText(/longitude/i), '-46.6333');
    await user.type(screen.getByLabelText(/observações/i), 'Observações da análise');

    await user.click(screen.getByText('Criar Análise'));

    // Verificar se formulário permanece aberto
    await waitFor(() => {
      expect(screen.getByText('Nome')).toBeInTheDocument();
    });
  });

  it('deve manter formulário aberto quando edição falha', async () => {
    const user = userEvent.setup();
    mockUpdateAnalise.mockResolvedValue(false);

    await act(async () => {
      render(
        <TestWrapper>
          <AnalisesManager />
        </TestWrapper>
      );
    });

    // Clicar no botão editar da primeira análise
    const editButtons = screen.getAllByTitle('Editar');
    await user.click(editButtons[0]);

    // Enviar formulário
    await user.click(screen.getByText('Atualizar Análise'));

    // Verificar se formulário permanece aberto
    await waitFor(() => {
      expect(screen.getByText('Nome')).toBeInTheDocument();
    });
  });

  it('deve mostrar dados corretos no formulário de edição', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <TestWrapper>
          <AnalisesManager />
        </TestWrapper>
      );
    });

    // Clicar no botão editar da primeira análise
    const editButtons = screen.getAllByTitle('Editar');
    await user.click(editButtons[0]);

    // Verificar se dados estão preenchidos
    expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    expect(screen.getByDisplayValue('joao@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('(11) 99999-9999')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Fazenda Teste')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByDisplayValue('-23.5505')).toBeInTheDocument();
    expect(screen.getByDisplayValue('-46.6333')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Observações da análise')).toBeInTheDocument();
  });

  it('deve mostrar formulário vazio para nova análise', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <TestWrapper>
          <AnalisesManager />
        </TestWrapper>
      );
    });

    // Clicar no botão Nova Análise (texto está dividido em spans)
    await user.click(screen.getByRole('button', { name: /Nova Análise/i }));

    // Verificar se os campos estão preenchidos com dados do usuário logado
    expect(screen.getByDisplayValue('Usuário Teste')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    // Verificar campos vazios usando seletores específicos
    expect(screen.getByLabelText(/telefone/i)).toHaveValue('');
    expect(screen.getByLabelText(/nome da fazenda/i)).toHaveValue('');
    expect(screen.getByPlaceholderText('Digite a área em hectares')).toBeInTheDocument(); // Área da fazenda vazia
    expect(screen.getByPlaceholderText('Ex: -15.7801 (entre -90 e +90)')).toBeInTheDocument(); // Latitude vazia
    expect(screen.getByPlaceholderText('Ex: -47.9292 (entre -180 e +180)')).toBeInTheDocument(); // Longitude vazia
    expect(screen.getByPlaceholderText('Informações adicionais sobre a análise...')).toBeInTheDocument(); // Observações vazia
  });
});
