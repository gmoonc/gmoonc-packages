import { supabase } from './supabase';

export interface NotificationData {
  category: 'nova_mensagem' | 'nova_analise';
  entityType: 'mensagem' | 'analise';
  entityId: string;
  entityData: Record<string, unknown>;
}

/**
 * Envia uma notificação por email via Edge Function
 */
export async function sendNotification(data: NotificationData): Promise<boolean> {
  try {
    const { data: response, error } = await supabase.functions.invoke('send-notification-email', {
      body: data
    });

    if (error) {
      console.error('Erro ao enviar notificação:', error);
      return false;
    }

    console.log('Notificação enviada com sucesso:', response);
    return true;
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    return false;
  }
}

/**
 * Processa notificações pendentes no banco de dados
 */
export async function processPendingNotifications(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('process_pending_notifications');

    if (error) {
      console.error('Erro ao processar notificações pendentes:', error);
      return false;
    }

    console.log('Notificações processadas:', data);
    return true;
  } catch (error) {
    console.error('Erro ao processar notificações pendentes:', error);
    return false;
  }
}

/**
 * Obtém destinatários de uma categoria de notificação
 */
export async function getNotificationRecipients(categoryName: string) {
  try {
    const { data, error } = await supabase.rpc('get_notification_recipients', {
      category_name: categoryName
    });

    if (error) {
      console.error('Erro ao buscar destinatários:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar destinatários:', error);
    return [];
  }
}
