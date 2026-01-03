import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type Mensagem = Database['public']['Tables']['mensagens']['Row'];

interface User {
  id: string;
  name: string;
  email: string;
  role: string | null;
}

interface UseMensagensTecnicasReturn {
  mensagens: Mensagem[];
  users: User[];
  loading: boolean;
  error: string | null;
  fetchMensagens: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  assignMensagem: (mensagemId: string, userId: string | null) => Promise<boolean>;
  updateMensagemStatus: (mensagemId: string, status: string) => Promise<boolean>;
  deleteMensagem: (mensagemId: string) => Promise<boolean>;
  updateMensagem: (mensagemId: string, data: Partial<Mensagem>) => Promise<boolean>;
  createMensagem: (data: Omit<Mensagem, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
}

export function useMensagensTecnicas(): UseMensagensTecnicasReturn {
  const { user } = useAuth();
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
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

  const fetchUsers = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, email, name, role')
        .order('name');

      if (fetchError) {
        throw fetchError;
      }

      setUsers(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar usuários';
      setError(errorMessage);
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const assignMensagem = useCallback(async (mensagemId: string, userId: string | null): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('mensagens')
        .update({ user_id: userId })
        .eq('id', mensagemId);

      if (updateError) {
        throw updateError;
      }

      // Atualizar lista local
      setMensagens(prev => 
        prev.map(m => 
          m.id === mensagemId 
            ? { ...m, user_id: userId }
            : m
        )
      );

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atribuir mensagem';
      setError(errorMessage);
      console.error('Erro ao atribuir mensagem:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateMensagemStatus = useCallback(async (mensagemId: string, status: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('mensagens')
        .update({ status })
        .eq('id', mensagemId);

      if (updateError) {
        throw updateError;
      }

      // Atualizar lista local
      setMensagens(prev =>
        prev.map(m =>
          m.id === mensagemId
            ? { ...m, status }
            : m
        )
      );

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar status da mensagem';
      setError(errorMessage);
      console.error('Erro ao atualizar status da mensagem:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteMensagem = useCallback(async (mensagemId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('mensagens')
        .delete()
        .eq('id', mensagemId);

      if (deleteError) {
        throw deleteError;
      }

      // Atualizar lista local
      setMensagens(prev => prev.filter(m => m.id !== mensagemId));

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

  const updateMensagem = useCallback(async (mensagemId: string, data: Partial<Mensagem>): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('mensagens')
        .update(data)
        .eq('id', mensagemId);

      if (updateError) {
        throw updateError;
      }

      // Atualizar lista local
      setMensagens(prev => 
        prev.map(m => 
          m.id === mensagemId 
            ? { ...m, ...data }
            : m
        )
      );

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar mensagem';
      setError(errorMessage);
      console.error('Erro ao atualizar mensagem:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createMensagem = useCallback(async (data: Omit<Mensagem, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const { data: newMensagem, error: createError } = await supabase
        .from('mensagens')
        .insert([data])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Adicionar à lista local
      setMensagens(prev => [newMensagem, ...prev]);

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar mensagem';
      setError(errorMessage);
      console.error('Erro ao criar mensagem:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Carregar dados iniciais
  useEffect(() => {
    if (user) {
      fetchMensagens();
      fetchUsers();
    }
  }, [user, fetchMensagens, fetchUsers]);

  return {
    mensagens,
    users,
    loading,
    error,
    fetchMensagens,
    fetchUsers,
    assignMensagem,
    updateMensagemStatus,
    deleteMensagem,
    updateMensagem,
    createMensagem
  };
}
