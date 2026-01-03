import { sendNotification, processPendingNotifications } from '../notifications';
import { supabase } from '../supabase';

// Mock do Supabase
jest.mock('../supabase', () => ({
  supabase: {
    functions: {
      invoke: jest.fn()
    },
    rpc: jest.fn()
  }
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendNotification', () => {
    it('deve enviar notificação com sucesso', async () => {
      const mockResponse = { success: true, messageId: 'msg-123' };
      mockSupabase.functions.invoke.mockResolvedValue({
        data: mockResponse,
        error: null
      });

      const notificationData = {
        category: 'Nova Mensagem',
        entityType: 'mensagem' as const,
        entityId: 'msg-123',
        entityData: { nome: 'Cliente Teste' }
      };

      const result = await sendNotification(notificationData);

      expect(result).toBe(true);
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('send-notification-email', {
        body: notificationData
      });
    });

    it('deve retornar false quando há erro na Edge Function', async () => {
      mockSupabase.functions.invoke.mockResolvedValue({
        data: null,
        error: { message: 'Function error' }
      });

      const notificationData = {
        category: 'Nova Mensagem',
        entityType: 'mensagem' as const,
        entityId: 'msg-123',
        entityData: { nome: 'Cliente Teste' }
      };

      const result = await sendNotification(notificationData);

      expect(result).toBe(false);
    });

    it('deve retornar false quando há exceção', async () => {
      mockSupabase.functions.invoke.mockRejectedValue(new Error('Network error'));

      const notificationData = {
        category: 'Nova Mensagem',
        entityType: 'mensagem' as const,
        entityId: 'msg-123',
        entityData: { nome: 'Cliente Teste' }
      };

      const result = await sendNotification(notificationData);

      expect(result).toBe(false);
    });
  });

  describe('processPendingNotifications', () => {
    it('deve processar notificações pendentes com sucesso', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: { processed: 3 },
        error: null
      });

      const result = await processPendingNotifications();

      expect(result).toBe(true);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('process_pending_notifications');
    });

    it('deve retornar false quando há erro no processamento', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      const result = await processPendingNotifications();

      expect(result).toBe(false);
    });

    it('deve retornar false quando há exceção', async () => {
      mockSupabase.rpc.mockRejectedValue(new Error('Network error'));

      const result = await processPendingNotifications();

      expect(result).toBe(false);
    });
  });
});
