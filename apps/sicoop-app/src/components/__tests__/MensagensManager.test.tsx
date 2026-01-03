import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MensagensManager from '../MensagensManager';
import { useMensagens } from '@/hooks/useMensagens';

// Mock do hook useMensagens
jest.mock('@/hooks/useMensagens');
const mockUseMensagens = useMensagens as jest.MockedFunction<typeof useMensagens>;

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

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

describe('MensagensManager', () => {
  const mockMensagens = [
    {
      id: '1',
      user_id: 'user-1',
      nome: 'João Silva',
      email: 'joao@example.com',
      telefone: '(11) 99999-9999',
      empresa_fazenda: 'Fazenda Teste',
      mensagem: 'Mensagem de teste',
      status: 'pendente',
      created_at: '2025-01-01T10:00:00Z',
      updated_at: '2025-01-01T10:00:00Z'
    },
    {
      id: '2',
      user_id: 'user-2',
      nome: 'Maria Santos',
      email: 'maria@example.com',
      telefone: null,
      empresa_fazenda: 'Empresa ABC',
      mensagem: 'Outra mensagem',
      status: 'em_analise',
      created_at: '2025-01-02T14:30:00Z',
      updated_at: '2025-01-02T14:30:00Z'
    }
  ];

  const mockCreateMensagem = jest.fn();
  const mockUpdateMensagem = jest.fn();
  const mockDeleteMensagem = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfirm.mockReturnValue(true);
    
    mockUseMensagens.mockReturnValue({
      mensagens: mockMensagens,
      loading: false,
      error: null,
      createMensagem: mockCreateMensagem,
      updateMensagem: mockUpdateMensagem,
      deleteMensagem: mockDeleteMensagem
    });
  });

  it('deve renderizar o gerenciador de mensagens corretamente', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <MensagensManager />
        </TestWrapper>
      );
    });

    // Verificar se o cabeçalho está presente
    expect(screen.getByText('Gerencie suas mensagens para o Sicoop')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nova Mensagem/i })).toBeInTheDocument();

    // Verificar se a lista de mensagens está presente (aparecem múltiplas vezes - desktop, tablet, mobile)
    expect(screen.getAllByText('João Silva').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Maria Santos').length).toBeGreaterThan(0);
  });

  it('deve mostrar estado de loading', async () => {
    mockUseMensagens.mockReturnValue({
      mensagens: [],
      loading: true,
      error: null,
      createMensagem: mockCreateMensagem,
      updateMensagem: mockUpdateMensagem,
      deleteMensagem: mockDeleteMensagem
    });

    await act(async () => {
      render(
        <TestWrapper>
          <MensagensManager />
        </TestWrapper>
      );
    });

    expect(screen.getByText('Carregando mensagens...')).toBeInTheDocument();
  });

  it('deve mostrar erro quando há erro', async () => {
    mockUseMensagens.mockReturnValue({
      mensagens: [],
      loading: false,
      error: 'Erro ao carregar mensagens',
      createMensagem: mockCreateMensagem,
      updateMensagem: mockUpdateMensagem,
      deleteMensagem: mockDeleteMensagem
    });

    await act(async () => {
      render(
        <TestWrapper>
          <MensagensManager />
        </TestWrapper>
      );
    });

    expect(screen.getByText('Erro: Erro ao carregar mensagens')).toBeInTheDocument();
  });

  it('deve abrir formulário quando botão Nova Mensagem é clicado', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <TestWrapper>
          <MensagensManager />
        </TestWrapper>
      );
    });

    // Clicar no botão Nova Mensagem (texto está dividido em spans)
    await user.click(screen.getByRole('button', { name: /Nova Mensagem/i }));

    // Verificar se o formulário aparece
    expect(screen.getByText('Nome')).toBeInTheDocument();
    expect(screen.getByText('E-mail')).toBeInTheDocument();
    expect(screen.getByText('Telefone')).toBeInTheDocument();
    expect(screen.getByText('Empresa/Fazenda')).toBeInTheDocument();
    expect(screen.getByText('Mensagem')).toBeInTheDocument();
  });

  it('deve fechar formulário quando botão Cancelar é clicado', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <TestWrapper>
          <MensagensManager />
        </TestWrapper>
      );
    });

    // Abrir formulário
    await user.click(screen.getByText('Nova Mensagem'));

    // Verificar se formulário está aberto
    expect(screen.getByText('Nome')).toBeInTheDocument();

    // Clicar em Cancelar
    await user.click(screen.getByText('Cancelar'));

    // Verificar se voltou para a lista
    expect(screen.getByText('Gerencie suas mensagens para o Sicoop')).toBeInTheDocument();
    // Verificar se o formulário foi fechado (não deve ter campos do formulário)
    expect(screen.queryByLabelText(/nome/i)).not.toBeInTheDocument();
  });

  it('deve chamar createMensagem quando formulário é enviado para nova mensagem', async () => {
    const user = userEvent.setup();
    mockCreateMensagem.mockResolvedValue(true);

    await act(async () => {
      render(
        <TestWrapper>
          <MensagensManager />
        </TestWrapper>
      );
    });

    // Abrir formulário
    await user.click(screen.getByText('Nova Mensagem'));

    // Preencher formulário
    const nomeInput = screen.getByDisplayValue('Usuário Teste');
    const emailInput = screen.getByDisplayValue('test@example.com');
    const fazendaInput = screen.getByLabelText(/empresa\/fazenda/i);
    const mensagemInput = screen.getByLabelText(/mensagem/i);

    await user.clear(nomeInput);
    await user.clear(emailInput);
    await user.clear(fazendaInput);
    await user.clear(mensagemInput);

    await user.type(nomeInput, 'João Silva');
    await user.type(emailInput, 'joao@example.com');
    await user.type(fazendaInput, 'Fazenda Teste');
    await user.type(mensagemInput, 'Mensagem de teste');

    // Enviar formulário
    await user.click(screen.getByText('Enviar Mensagem'));

    // Verificar se createMensagem foi chamado
    await waitFor(() => {
      expect(mockCreateMensagem).toHaveBeenCalledWith({
        nome: 'João Silva',
        email: 'joao@example.com',
        telefone: '',
        empresa_fazenda: 'Fazenda Teste',
        mensagem: 'Mensagem de teste'
      });
    });
  });

  it('deve chamar updateMensagem quando formulário é enviado para edição', async () => {
    const user = userEvent.setup();
    mockUpdateMensagem.mockResolvedValue(true);

    await act(async () => {
      render(
        <TestWrapper>
          <MensagensManager />
        </TestWrapper>
      );
    });

    // Clicar no botão editar da primeira mensagem
    const editButtons = screen.getAllByTitle('Editar');
    await user.click(editButtons[0]);

    // Verificar se formulário está preenchido com dados da mensagem
    expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    expect(screen.getByDisplayValue('joao@example.com')).toBeInTheDocument();

    // Modificar dados
    const nomeInput = screen.getByDisplayValue('João Silva');
    await user.clear(nomeInput);
    await user.type(nomeInput, 'João Silva Modificado');

    // Enviar formulário
    await user.click(screen.getByText('Atualizar Mensagem'));

    // Verificar se updateMensagem foi chamado
    await waitFor(() => {
      expect(mockUpdateMensagem).toHaveBeenCalledWith('1', {
        nome: 'João Silva Modificado',
        email: 'joao@example.com',
        telefone: '(11) 99999-9999',
        empresa_fazenda: 'Fazenda Teste',
        mensagem: 'Mensagem de teste'
      });
    });
  });

  it('deve chamar deleteMensagem quando botão excluir é clicado e confirmado', async () => {
    const user = userEvent.setup();
    mockDeleteMensagem.mockResolvedValue(true);

    await act(async () => {
      render(
        <TestWrapper>
          <MensagensManager />
        </TestWrapper>
      );
    });

    // Clicar no botão excluir da primeira mensagem
    const deleteButtons = screen.getAllByTitle('Excluir');
    await user.click(deleteButtons[0]);

    // Verificar se confirm foi chamado
    expect(mockConfirm).toHaveBeenCalledWith('Tem certeza que deseja excluir esta mensagem?');

    // Verificar se deleteMensagem foi chamado
    await waitFor(() => {
      expect(mockDeleteMensagem).toHaveBeenCalledWith('1');
    });
  });

  it('não deve chamar deleteMensagem quando confirmação é cancelada', async () => {
    const user = userEvent.setup();
    mockConfirm.mockReturnValue(false);

    await act(async () => {
      render(
        <TestWrapper>
          <MensagensManager />
        </TestWrapper>
      );
    });

    // Clicar no botão excluir da primeira mensagem
    const deleteButtons = screen.getAllByTitle('Excluir');
    await user.click(deleteButtons[0]);

    // Verificar se confirm foi chamado
    expect(mockConfirm).toHaveBeenCalledWith('Tem certeza que deseja excluir esta mensagem?');

    // Verificar se deleteMensagem NÃO foi chamado
    expect(mockDeleteMensagem).not.toHaveBeenCalled();
  });

  it('deve fechar formulário após criação bem-sucedida', async () => {
    const user = userEvent.setup();
    mockCreateMensagem.mockResolvedValue(true);

    await act(async () => {
      render(
        <TestWrapper>
          <MensagensManager />
        </TestWrapper>
      );
    });

    // Abrir formulário
    await user.click(screen.getByText('Nova Mensagem'));

    // Preencher e enviar formulário
    const nomeInput = screen.getByDisplayValue('Usuário Teste');
    const emailInput = screen.getByDisplayValue('test@example.com');
    const fazendaInput = screen.getByLabelText(/empresa\/fazenda/i);
    const mensagemInput = screen.getByLabelText(/mensagem/i);

    await user.clear(nomeInput);
    await user.clear(emailInput);
    await user.clear(fazendaInput);
    await user.clear(mensagemInput);

    await user.type(nomeInput, 'João Silva');
    await user.type(emailInput, 'joao@example.com');
    await user.type(fazendaInput, 'Fazenda Teste');
    await user.type(mensagemInput, 'Mensagem de teste');

    await user.click(screen.getByText('Enviar Mensagem'));

    // Verificar se formulário foi fechado
    await waitFor(() => {
      expect(screen.getByText('Gerencie suas mensagens para o Sicoop')).toBeInTheDocument();
      // Verificar se o formulário foi fechado (não deve ter campos do formulário)
      expect(screen.queryByLabelText(/nome/i)).not.toBeInTheDocument();
    });
  });

  it('deve fechar formulário após edição bem-sucedida', async () => {
    const user = userEvent.setup();
    mockUpdateMensagem.mockResolvedValue(true);

    await act(async () => {
      render(
        <TestWrapper>
          <MensagensManager />
        </TestWrapper>
      );
    });

    // Clicar no botão editar da primeira mensagem
    const editButtons = screen.getAllByTitle('Editar');
    await user.click(editButtons[0]);

    // Enviar formulário sem modificações
    await user.click(screen.getByText('Atualizar Mensagem'));

    // Verificar se formulário foi fechado
    await waitFor(() => {
      expect(screen.getByText('Gerencie suas mensagens para o Sicoop')).toBeInTheDocument();
      // Verificar se o formulário foi fechado (não deve ter campos do formulário)
      expect(screen.queryByLabelText(/nome/i)).not.toBeInTheDocument();
    });
  });

  it('deve manter formulário aberto quando criação falha', async () => {
    const user = userEvent.setup();
    mockCreateMensagem.mockResolvedValue(false);

    await act(async () => {
      render(
        <TestWrapper>
          <MensagensManager />
        </TestWrapper>
      );
    });

    // Abrir formulário
    await user.click(screen.getByText('Nova Mensagem'));

    // Preencher e enviar formulário
    const nomeInput = screen.getByDisplayValue('Usuário Teste');
    const emailInput = screen.getByDisplayValue('test@example.com');
    const fazendaInput = screen.getByLabelText(/empresa\/fazenda/i);
    const mensagemInput = screen.getByLabelText(/mensagem/i);

    await user.clear(nomeInput);
    await user.clear(emailInput);
    await user.clear(fazendaInput);
    await user.clear(mensagemInput);

    await user.type(nomeInput, 'João Silva');
    await user.type(emailInput, 'joao@example.com');
    await user.type(fazendaInput, 'Fazenda Teste');
    await user.type(mensagemInput, 'Mensagem de teste');

    await user.click(screen.getByText('Enviar Mensagem'));

    // Verificar se formulário permanece aberto
    await waitFor(() => {
      expect(screen.getByText('Nome')).toBeInTheDocument();
    });
  });

  it('deve manter formulário aberto quando edição falha', async () => {
    const user = userEvent.setup();
    mockUpdateMensagem.mockResolvedValue(false);

    await act(async () => {
      render(
        <TestWrapper>
          <MensagensManager />
        </TestWrapper>
      );
    });

    // Clicar no botão editar da primeira mensagem
    const editButtons = screen.getAllByTitle('Editar');
    await user.click(editButtons[0]);

    // Enviar formulário
    await user.click(screen.getByText('Atualizar Mensagem'));

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
          <MensagensManager />
        </TestWrapper>
      );
    });

    // Clicar no botão editar da primeira mensagem
    const editButtons = screen.getAllByTitle('Editar');
    await user.click(editButtons[0]);

    // Verificar se os dados estão preenchidos corretamente
    expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    expect(screen.getByDisplayValue('joao@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('(11) 99999-9999')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Fazenda Teste')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Mensagem de teste')).toBeInTheDocument();
  });

  it('deve mostrar formulário vazio para nova mensagem', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <TestWrapper>
          <MensagensManager />
        </TestWrapper>
      );
    });

    // Clicar no botão Nova Mensagem (texto está dividido em spans)
    await user.click(screen.getByRole('button', { name: /Nova Mensagem/i }));

    // Verificar se os campos estão preenchidos com dados do usuário logado
    expect(screen.getByDisplayValue('Usuário Teste')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    // Verificar campos vazios usando seletores específicos
    expect(screen.getByLabelText(/telefone/i)).toHaveValue('');
    expect(screen.getByLabelText(/empresa/i)).toHaveValue('');
    // Mensagem vazia (textarea não tem value, apenas conteúdo)
    expect(screen.getByPlaceholderText('Descreva como podemos ajudar você')).toBeInTheDocument();
  });
});
