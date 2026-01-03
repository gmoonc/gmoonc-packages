import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import type { MensagemFormData } from '@/types/mensagens';

type Mensagem = Database['public']['Tables']['mensagens']['Row'];
type MensagemInsertData = Database['public']['Tables']['mensagens']['Insert'];
type MensagemUpdateData = Database['public']['Tables']['mensagens']['Update'];

interface UseMensagensReturn {
  mensagens: Mensagem[];
  loading: boolean;
  error: string | null;
  fetchMensagens: () => Promise<void>;
  createMensagem: (data: MensagemFormData) => Promise<Mensagem | null>;
  updateMensagem: (id: string, data: MensagemFormData) => Promise<Mensagem | null>;
  deleteMensagem: (id: string) => Promise<boolean>;
}

export function useMensagens(): UseMensagensReturn {
  const { user } = useAuth();
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMensagens = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('mensagens')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setMensagens(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar mensagens';
      setError(errorMessage);
      console.error('Erro ao buscar mensagens:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createMensagem = useCallback(async (data: MensagemFormData): Promise<Mensagem | null> => {
    if (!user) return null;

    try {
      setLoading(true);
      setError(null);

      const mensagemData: MensagemInsertData = {
        user_id: user.id,
        nome: data.nome,
        email: data.email,
        telefone: data.telefone || null,
        empresa_fazenda: data.empresa_fazenda,
        mensagem: data.mensagem,
        status: 'pendente'
      };

      const { data: newMensagem, error: insertError } = await supabase
        .from('mensagens')
        .insert(mensagemData)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Atualizar lista local
      setMensagens(prev => [newMensagem, ...prev]);
      
      return newMensagem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar mensagem';
      setError(errorMessage);
      console.error('Erro ao criar mensagem:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateMensagem = useCallback(async (id: string, data: MensagemFormData): Promise<Mensagem | null> => {
    if (!user) return null;

    try {
      setLoading(true);
      setError(null);

      const updateData: MensagemUpdateData = {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone || null,
        empresa_fazenda: data.empresa_fazenda,
        mensagem: data.mensagem
      };

      const { data: updatedMensagem, error: updateError } = await supabase
        .from('mensagens')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id) // Garantir que só o dono pode atualizar
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Atualizar lista local
      setMensagens(prev => prev.map(mensagem => 
        mensagem.id === id ? updatedMensagem : mensagem
      ));
      
      return updatedMensagem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar mensagem';
      setError(errorMessage);
      console.error('Erro ao atualizar mensagem:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteMensagem = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('mensagens')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Garantir que só o dono pode deletar

      if (deleteError) {
        throw deleteError;
      }

      // Remover da lista local
      setMensagens(prev => prev.filter(mensagem => mensagem.id !== id));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir mensagem';
      setError(errorMessage);
      console.error('Erro ao excluir mensagem:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Carregar mensagens quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      fetchMensagens();
    } else {
      setMensagens([]);
    }
  }, [user, fetchMensagens]);

  return {
    mensagens,
    loading,
    error,
    fetchMensagens,
    createMensagem,
    updateMensagem,
    deleteMensagem
  };
}
