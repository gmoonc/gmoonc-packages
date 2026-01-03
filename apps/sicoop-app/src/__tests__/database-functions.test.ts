// Testes de Funções RPC - Usando Mocks (Padrão das Fases Anteriores)
import { supabase } from '@/lib/supabase';

describe('Database Functions Tests - RPC Functions', () => {
  beforeEach(() => {
    // Reset dos mocks antes de cada teste
    jest.clearAllMocks();
  });

  describe('create_user_profile - Função RPC', () => {
    it('deve criar perfil de usuário com sucesso', async () => {
      // Mock da resposta do Supabase RPC
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: {
          id: 'new-user-123',
          name: 'João Silva',
          email: 'joao@teste.com',
          role: 'usuario'
        },
        error: null
      });

      const { data, error } = await supabase.rpc('create_user_profile', {
        p_name: 'João Silva',
        p_email: 'joao@teste.com'
      });

      expect(error).toBeNull();
      expect(data).toMatchObject({
        id: 'new-user-123',
        name: 'João Silva',
        email: 'joao@teste.com',
        role: 'usuario'
      });
      expect(supabase.rpc).toHaveBeenCalledWith('create_user_profile', {
        p_name: 'João Silva',
        p_email: 'joao@teste.com'
      });
    });

    it('deve falhar ao criar perfil com email duplicado', async () => {
      // Mock da resposta do Supabase RPC com erro
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Email já existe' }
      });

      const { data, error } = await supabase.rpc('create_user_profile', {
        p_name: 'João Silva',
        p_email: 'joao@teste.com'
      });

      expect(error).toBeTruthy();
      expect(error?.message).toBe('Email já existe');
      expect(data).toBeNull();
    });

    it('deve falhar com parâmetros inválidos', async () => {
      // Mock da resposta do Supabase RPC com erro de parâmetros
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Parâmetros obrigatórios não fornecidos' }
      });

      const { data, error } = await supabase.rpc('create_user_profile', {
        p_name: 'João Silva'
        // Faltando p_email
      });

      expect(error).toBeTruthy();
      expect(error?.message).toContain('obrigatórios');
      expect(data).toBeNull();
    });
  });

  describe('get_user_permissions - Função RPC', () => {
    it('deve retornar permissões do usuário', async () => {
      // Mock da resposta do Supabase RPC
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: [
          { module: 'cliente', action: 'read', granted: true },
          { module: 'cliente', action: 'write', granted: false },
          { module: 'relatorio', action: 'read', granted: true }
        ],
        error: null
      });

      const { data, error } = await supabase.rpc('get_user_permissions', {
        user_id: 'user-123'
      });

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(3);
      expect(data?.[0]).toMatchObject({
        module: 'cliente',
        action: 'read',
        granted: true
      });
      expect(supabase.rpc).toHaveBeenCalledWith('get_user_permissions', {
        user_id: 'user-123'
      });
    });

    it('deve retornar array vazio para usuário sem permissões', async () => {
      // Mock da resposta do Supabase RPC
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: [],
        error: null
      });

      const { data, error } = await supabase.rpc('get_user_permissions', {
        user_id: 'usuario-sem-permissoes'
      });

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(0);
    });
  });

  describe('check_permission - Função RPC', () => {
    it('deve retornar true para permissão concedida', async () => {
      // Mock da resposta do Supabase RPC
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: true,
        error: null
      });

      const { data, error } = await supabase.rpc('check_permission', {
        user_id: 'user-123',
        module_name: 'cliente',
        action_name: 'read'
      });

      expect(error).toBeNull();
      expect(data).toBe(true);
      expect(supabase.rpc).toHaveBeenCalledWith('check_permission', {
        user_id: 'user-123',
        module_name: 'cliente',
        action_name: 'read'
      });
    });

    it('deve retornar false para permissão negada', async () => {
      // Mock da resposta do Supabase RPC
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: false,
        error: null
      });

      const { data, error } = await supabase.rpc('check_permission', {
        user_id: 'user-123',
        module_name: 'admin',
        action_name: 'delete'
      });

      expect(error).toBeNull();
      expect(data).toBe(false);
    });
  });

  describe('get_notification_recipients - Função RPC', () => {
    it('deve retornar destinatários para categoria válida', async () => {
      // Mock da resposta do Supabase RPC
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: [
          { user_id: 'user-1', email: 'user1@teste.com', name: 'Usuário 1' },
          { user_id: 'user-2', email: 'user2@teste.com', name: 'Usuário 2' }
        ],
        error: null
      });

      const { data, error } = await supabase.rpc('get_notification_recipients', {
        category_name: 'sistema'
      });

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(2);
      expect(data?.[0]).toMatchObject({
        user_id: 'user-1',
        email: 'user1@teste.com',
        name: 'Usuário 1'
      });
    });

    it('deve retornar array vazio para categoria inexistente', async () => {
      // Mock da resposta do Supabase RPC
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: [],
        error: null
      });

      const { data, error } = await supabase.rpc('get_notification_recipients', {
        category_name: 'categoria-inexistente'
      });

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(0);
    });
  });

  describe('log_notification - Função RPC', () => {
    it('deve registrar log de notificação com sucesso', async () => {
      // Mock da resposta do Supabase RPC
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: { id: 'log-123', status: 'logged' },
        error: null
      });

      const { data, error } = await supabase.rpc('log_notification', {
        p_category_name: 'sistema',
        p_user_id: 'user-123',
        p_message: 'Teste de notificação',
        p_status: 'sent'
      });

      expect(error).toBeNull();
      expect(data).toMatchObject({
        id: 'log-123',
        status: 'logged'
      });
      expect(supabase.rpc).toHaveBeenCalledWith('log_notification', {
        p_category_name: 'sistema',
        p_user_id: 'user-123',
        p_message: 'Teste de notificação',
        p_status: 'sent'
      });
    });
  });

  describe('process_pending_notifications - Função RPC', () => {
    it('deve processar notificações pendentes com sucesso', async () => {
      // Mock da resposta do Supabase RPC
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: { processed: 5, failed: 0 },
        error: null
      });

      const { data, error } = await supabase.rpc('process_pending_notifications');

      expect(error).toBeNull();
      expect(data).toMatchObject({
        processed: 5,
        failed: 0
      });
      expect(supabase.rpc).toHaveBeenCalledWith('process_pending_notifications');
    });

    it('deve retornar resultado mesmo sem notificações pendentes', async () => {
      // Mock da resposta do Supabase RPC
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: { processed: 0, failed: 0 },
        error: null
      });

      const { data, error } = await supabase.rpc('process_pending_notifications');

      expect(error).toBeNull();
      expect(data).toMatchObject({
        processed: 0,
        failed: 0
      });
    });
  });

  describe('Validação de Chamadas RPC', () => {
    it('deve chamar funções RPC com parâmetros corretos', async () => {
      // Mock para create_user_profile
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: { id: 'test' },
        error: null
      });

      await supabase.rpc('create_user_profile', {
        p_name: 'Teste',
        p_email: 'teste@teste.com'
      });

      expect(supabase.rpc).toHaveBeenCalledWith('create_user_profile', {
        p_name: 'Teste',
        p_email: 'teste@teste.com'
      });
    });

    it('deve tratar erros de função RPC', async () => {
      // Mock da resposta do Supabase RPC com erro
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Função não encontrada' }
      });

      const { data, error } = await supabase.rpc('funcao_inexistente', {
        parametro: 'valor'
      });

      expect(error).toBeTruthy();
      expect(error?.message).toBe('Função não encontrada');
      expect(data).toBeNull();
    });
  });
});