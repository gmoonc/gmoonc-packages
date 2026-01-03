import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnaliseForm from '../AnaliseForm';
import { AnaliseCobertura } from '@/types/analises';

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

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

describe('AnaliseForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o formulário corretamente', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <AnaliseForm
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
          />
        </TestWrapper>
      );
    });

    // Verificar se os campos estão presentes
    expect(screen.getByDisplayValue('Usuário Teste')).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nome da fazenda/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/área da fazenda/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/latitude/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/longitude/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/observações/i)).toBeInTheDocument();

    // Verificar se os botões estão presentes
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar análise/i })).toBeInTheDocument();
  });

  it('deve preencher campos com dados do usuário logado', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <AnaliseForm
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
          />
        </TestWrapper>
      );
    });

    // Verificar se os campos foram preenchidos com dados do usuário
    expect(screen.getByDisplayValue('Usuário Teste')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
  });

  it('deve preencher campos com dados iniciais quando fornecidos', async () => {
    const initialData: AnaliseCobertura = {
      id: '1',
      user_id: 'test-user-1',
      nome: 'João Silva',
      email: 'joao@example.com',
      telefone: '(11) 99999-9999',
      nome_fazenda: 'Fazenda Teste',
      area_fazenda_ha: 100.5,
      latitude: -15.7801,
      longitude: -47.9292,
      observacoes: 'Observações de teste',
      status: 'rascunho',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    };

    await act(async () => {
      render(
        <TestWrapper>
          <AnaliseForm
            initialData={initialData}
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
          />
        </TestWrapper>
      );
    });

    // Verificar se os campos foram preenchidos com dados iniciais
    expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    expect(screen.getByDisplayValue('joao@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('(11) 99999-9999')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Fazenda Teste')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100.5')).toBeInTheDocument();
    expect(screen.getByDisplayValue('-15.7801')).toBeInTheDocument();
    expect(screen.getByDisplayValue('-47.9292')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Observações de teste')).toBeInTheDocument();
  });

  it('deve validar campos obrigatórios', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <TestWrapper>
          <AnaliseForm
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
          />
        </TestWrapper>
      );
    });

    // Limpar campos obrigatórios
    const nomeInput = screen.getByDisplayValue('Usuário Teste');
    const emailInput = screen.getByDisplayValue('test@example.com');
    const fazendaInput = screen.getByLabelText(/nome da fazenda/i);
    
    await user.clear(nomeInput);
    await user.clear(emailInput);
    await user.clear(fazendaInput);

    // Tentar enviar formulário
    await user.click(screen.getByRole('button', { name: /criar análise/i }));

    // Verificar se as mensagens de erro aparecem
    expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
    expect(screen.getByText('Email é obrigatório')).toBeInTheDocument();
    expect(screen.getByText('Nome da fazenda é obrigatório')).toBeInTheDocument();

    // Verificar se onSubmit não foi chamado
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('deve validar formato de email', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <TestWrapper>
          <AnaliseForm
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
          />
        </TestWrapper>
      );
    });

    // Preencher campos obrigatórios
    const nomeInput = screen.getByDisplayValue('Usuário Teste');
    const emailInput = screen.getByLabelText(/e-mail/i);
    const fazendaInput = screen.getByLabelText(/nome da fazenda/i);
    
    await user.clear(nomeInput);
    await user.clear(emailInput);
    await user.clear(fazendaInput);
    
    await user.type(nomeInput, 'João Silva');
    await user.type(emailInput, 'email-invalido');
    await user.type(fazendaInput, 'Fazenda Teste');

    // Tentar enviar formulário
    await user.click(screen.getByRole('button', { name: /criar análise/i }));

    // Verificar se onSubmit não foi chamado (validação deve ter falhado)
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('deve aceitar área da fazenda vazia (campo opcional)', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <TestWrapper>
          <AnaliseForm
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
          />
        </TestWrapper>
      );
    });

    // Preencher apenas campos obrigatórios
    const nomeInput = screen.getByDisplayValue('Usuário Teste');
    const fazendaInput = screen.getByLabelText(/nome da fazenda/i);
    
    await user.clear(nomeInput);
    await user.clear(fazendaInput);
    
    await user.type(nomeInput, 'João Silva');
    await user.type(fazendaInput, 'Fazenda Teste');

    // Tentar enviar formulário
    await user.click(screen.getByRole('button', { name: /criar análise/i }));

    // Verificar se onSubmit foi chamado (área é opcional)
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('deve validar latitude dentro do range válido', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <TestWrapper>
          <AnaliseForm
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
          />
        </TestWrapper>
      );
    });

    // Preencher campos obrigatórios
    const nomeInput = screen.getByDisplayValue('Usuário Teste');
    const emailInput = screen.getByDisplayValue('test@example.com');
    const fazendaInput = screen.getByLabelText(/nome da fazenda/i);
    const latitudeInput = screen.getByLabelText(/latitude/i);
    
    await user.clear(nomeInput);
    await user.clear(emailInput);
    await user.clear(fazendaInput);
    await user.clear(latitudeInput);
    
    await user.type(nomeInput, 'João Silva');
    await user.type(emailInput, 'joao@example.com');
    await user.type(fazendaInput, 'Fazenda Teste');
    await user.type(latitudeInput, '95'); // Latitude inválida (> 90)

    // Tentar enviar formulário
    await user.click(screen.getByRole('button', { name: /criar análise/i }));

    // Verificar se a mensagem de erro aparece
    expect(screen.getByText('Latitude deve estar entre -90 e +90 graus')).toBeInTheDocument();

    // Verificar se onSubmit não foi chamado
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('deve validar longitude dentro do range válido', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <TestWrapper>
          <AnaliseForm
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
          />
        </TestWrapper>
      );
    });

    // Preencher campos obrigatórios
    const nomeInput = screen.getByDisplayValue('Usuário Teste');
    const emailInput = screen.getByDisplayValue('test@example.com');
    const fazendaInput = screen.getByLabelText(/nome da fazenda/i);
    const longitudeInput = screen.getByLabelText(/longitude/i);
    
    await user.clear(nomeInput);
    await user.clear(emailInput);
    await user.clear(fazendaInput);
    await user.clear(longitudeInput);
    
    await user.type(nomeInput, 'João Silva');
    await user.type(emailInput, 'joao@example.com');
    await user.type(fazendaInput, 'Fazenda Teste');
    await user.type(longitudeInput, '185'); // Longitude inválida (> 180)

    // Tentar enviar formulário
    await user.click(screen.getByRole('button', { name: /criar análise/i }));

    // Verificar se a mensagem de erro aparece
    expect(screen.getByText('Longitude deve estar entre -180 e +180 graus')).toBeInTheDocument();

    // Verificar se onSubmit não foi chamado
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('deve limpar erros quando usuário começar a digitar', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <TestWrapper>
          <AnaliseForm
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
          />
        </TestWrapper>
      );
    });

    // Limpar campo nome e tentar enviar
    const nomeInput = screen.getByDisplayValue('Usuário Teste');
    await user.clear(nomeInput);
    await user.click(screen.getByRole('button', { name: /criar análise/i }));

    // Verificar se erro aparece
    expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();

    // Começar a digitar no campo nome
    await user.type(nomeInput, 'João');

    // Verificar se erro desaparece
    expect(screen.queryByText('Nome é obrigatório')).not.toBeInTheDocument();
  });

  it('deve chamar onSubmit com dados corretos quando formulário é válido', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <TestWrapper>
          <AnaliseForm
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
          />
        </TestWrapper>
      );
    });

    // Preencher formulário
    const nomeInput = screen.getByDisplayValue('Usuário Teste');
    const emailInput = screen.getByDisplayValue('test@example.com');
    const telefoneInput = screen.getByLabelText(/telefone/i);
    const fazendaInput = screen.getByLabelText(/nome da fazenda/i);
    const areaInput = screen.getByLabelText(/área da fazenda/i);
    const latitudeInput = screen.getByLabelText(/latitude/i);
    const longitudeInput = screen.getByLabelText(/longitude/i);
    const observacoesInput = screen.getByLabelText(/observações/i);
    
    await user.clear(nomeInput);
    await user.clear(emailInput);
    await user.clear(fazendaInput);
    await user.clear(areaInput);
    await user.clear(latitudeInput);
    await user.clear(longitudeInput);
    await user.clear(observacoesInput);
    
    await user.type(nomeInput, 'João Silva');
    await user.type(emailInput, 'joao@example.com');
    await user.type(telefoneInput, '(11) 99999-9999');
    await user.type(fazendaInput, 'Fazenda Teste');
    await user.type(areaInput, '100.5');
    await user.type(latitudeInput, '-15.7801');
    await user.type(longitudeInput, '-47.9292');
    await user.type(observacoesInput, 'Observações de teste');

    // Enviar formulário
    await user.click(screen.getByRole('button', { name: /criar análise/i }));

    // Verificar se onSubmit foi chamado com dados corretos
    expect(mockOnSubmit).toHaveBeenCalledWith({
      nome: 'João Silva',
      email: 'joao@example.com',
      telefone: '(11) 99999-9999',
      nome_fazenda: 'Fazenda Teste',
      area_fazenda_ha: '100.5',
      latitude: '-15.7801',
      longitude: '-47.9292',
      observacoes: 'Observações de teste'
    });
  });

  it('deve chamar onCancel quando botão cancelar é clicado', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <TestWrapper>
          <AnaliseForm
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
          />
        </TestWrapper>
      );
    });

    // Clicar no botão cancelar
    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    // Verificar se onCancel foi chamado
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('deve mostrar estado de loading durante submissão', async () => {
    const user = userEvent.setup();
    
    // Mock onSubmit que demora para resolver
    const slowOnSubmit = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    await act(async () => {
      render(
        <TestWrapper>
          <AnaliseForm
            onSubmit={slowOnSubmit}
            onCancel={mockOnCancel}
          />
        </TestWrapper>
      );
    });

    // Preencher e enviar formulário
    const nomeInput = screen.getByDisplayValue('Usuário Teste');
    const emailInput = screen.getByDisplayValue('test@example.com');
    const fazendaInput = screen.getByLabelText(/nome da fazenda/i);
    
    await user.clear(nomeInput);
    await user.clear(emailInput);
    await user.clear(fazendaInput);
    
    await user.type(nomeInput, 'João Silva');
    await user.type(emailInput, 'joao@example.com');
    await user.type(fazendaInput, 'Fazenda Teste');

    await user.click(screen.getByRole('button', { name: /criar análise/i }));

    // Verificar se estado de loading aparece
    expect(screen.getByText('Salvando...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /salvando/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeDisabled();

    // Aguardar submissão terminar
    await waitFor(() => {
      expect(screen.queryByText('Salvando...')).not.toBeInTheDocument();
    });
  });

  it('deve mostrar texto correto no botão submit para edição', async () => {
    const initialData: AnaliseCobertura = {
      id: '1',
      user_id: 'test-user-1',
      nome: 'João Silva',
      email: 'joao@example.com',
      telefone: '(11) 99999-9999',
      nome_fazenda: 'Fazenda Teste',
      area_fazenda_ha: 100.5,
      latitude: -15.7801,
      longitude: -47.9292,
      observacoes: 'Observações de teste',
      status: 'rascunho',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    };

    await act(async () => {
      render(
        <TestWrapper>
          <AnaliseForm
            initialData={initialData}
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
          />
        </TestWrapper>
      );
    });

    // Verificar se o texto do botão é para edição
    expect(screen.getByRole('button', { name: /atualizar análise/i })).toBeInTheDocument();
  });

  it('deve ter campos obrigatórios marcados com asterisco', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <AnaliseForm
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
          />
        </TestWrapper>
      );
    });

    // Verificar se campos obrigatórios têm asterisco
    expect(screen.getByText('Nome')).toBeInTheDocument();
    expect(screen.getByText('E-mail')).toBeInTheDocument();
    expect(screen.getByText('Nome da Fazenda')).toBeInTheDocument();
    
    // Verificar se os asteriscos estão presentes
    expect(screen.getAllByText('*')).toHaveLength(3);

    // Verificar se campos opcionais não têm asterisco
    expect(screen.queryByText('Telefone *')).not.toBeInTheDocument();
    expect(screen.queryByText('Área da Fazenda *')).not.toBeInTheDocument();
    expect(screen.queryByText('Latitude *')).not.toBeInTheDocument();
    expect(screen.queryByText('Longitude *')).not.toBeInTheDocument();
    expect(screen.queryByText('Observações *')).not.toBeInTheDocument();
  });
});
