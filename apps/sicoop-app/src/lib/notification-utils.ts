import { supabase } from './supabase';

/**
 * Envia notificações pendentes via Edge Function
 */
export async function sendPendingNotifications(): Promise<boolean> {
  try {
    // Primeiro, processar notificações pendentes no banco
    const { data: processResult, error: processError } = await supabase.rpc('process_pending_notifications');
    
    if (processError) {
      console.error('Erro ao processar notificações pendentes:', processError);
      return false;
    }

    console.log('Notificações processadas no banco:', processResult);

    // Buscar notificações que precisam ser enviadas
    const { data: pendingLogs, error: logsError } = await supabase
      .from('notification_logs')
      .select(`
        *,
        category:notification_categories(*),
        user:profiles(id, name, email)
      `)
      .eq('email_sent', true)
      .eq('email_error', 'Processada - aguardando envio via Edge Function')
      .order('created_at', { ascending: true })
      .limit(10);

    if (logsError) {
      console.error('Erro ao buscar logs pendentes:', logsError);
      return false;
    }

    if (!pendingLogs || pendingLogs.length === 0) {
      console.log('Nenhuma notificação pendente para envio');
      return true;
    }

    // Enviar cada notificação via Edge Function
    for (const log of pendingLogs) {
      try {
        // Buscar dados da entidade
        let entityData = {};
        
        if (log.entity_type === 'mensagem') {
          const { data: mensagem } = await supabase
            .from('mensagens')
            .select('*')
            .eq('id', log.entity_id)
            .single();
          
          if (mensagem) {
            entityData = {
              id: mensagem.id,
              nome: mensagem.nome,
              email: mensagem.email,
              telefone: mensagem.telefone || '',
              empresa_fazenda: mensagem.empresa_fazenda,
              mensagem: mensagem.mensagem,
              status: mensagem.status || 'pendente',
              created_at: mensagem.created_at
            };
          }
        } else if (log.entity_type === 'analise') {
          const { data: analise } = await supabase
            .from('analises_cobertura')
            .select('*')
            .eq('id', log.entity_id)
            .single();
          
          if (analise) {
            entityData = {
              id: analise.id,
              nome: analise.nome,
              email: analise.email,
              telefone: analise.telefone || '',
              nome_fazenda: analise.nome_fazenda,
              area_fazenda_ha: analise.area_fazenda_ha || 0,
              latitude: analise.latitude || 0,
              longitude: analise.longitude || 0,
              observacoes: analise.observacoes || '',
              status: analise.status || 'pendente',
              created_at: analise.created_at
            };
          }
        }

        // Chamar API route local
        const response = await fetch('/api/send-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category: (log.category as { name?: string } | null)?.name || 'unknown',
            entityType: log.entity_type,
            entityId: log.entity_id,
            entityData: entityData
          })
        });

        const responseData = await response.json();
        
        if (!response.ok) {
          throw new Error(`Erro da API: ${responseData.error || 'Erro desconhecido'}`);
        }

        if (responseData && responseData.error) {
          console.error('Erro na resposta da API:', responseData);
          throw new Error(`Erro na resposta: ${responseData.error}`);
        }

        // Atualizar log como enviado com sucesso
        await supabase
          .from('notification_logs')
          .update({
            email_sent: true,
            email_error: null,
            sent_at: new Date().toISOString()
          })
          .eq('id', log.id);

        console.log(`Notificação enviada com sucesso para ${(log.user as { email?: string } | null)?.email || 'unknown'}:`, response);

      } catch (error) {
        console.error(`Erro ao enviar notificação ${log.id}:`, error);
        
        // Atualizar log com erro
        await supabase
          .from('notification_logs')
          .update({
            email_sent: false,
            email_error: error instanceof Error ? error.message : 'Erro desconhecido',
            sent_at: null
          })
          .eq('id', log.id);
      }
    }

    return true;
  } catch (error) {
    console.error('Erro geral ao enviar notificações pendentes:', error);
    return false;
  }
}

/**
 * Envia uma notificação específica via Edge Function
 */
export async function sendSingleNotification(
  category: string,
  entityType: 'mensagem' | 'analise',
  entityId: string,
  entityData: Record<string, unknown>
): Promise<boolean> {
  try {
    const { data: response, error } = await supabase.functions.invoke('send-notification-email', {
      body: {
        category,
        entityType,
        entityId,
        entityData
      }
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
