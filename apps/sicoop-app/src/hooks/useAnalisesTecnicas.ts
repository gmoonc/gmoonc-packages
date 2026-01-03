import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type AnaliseCobertura = Database['public']['Tables']['analises_cobertura']['Row'];

interface User {
  id: string;
  email: string;
  name: string;
  role: string | null;
}

interface UseAnalisesTecnicasReturn {
  analises: AnaliseCobertura[];
  users: User[];
  loading: boolean;
  error: string | null;
  fetchAnalises: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  createAnalise: (data: Omit<AnaliseCobertura, 'id' | 'created_at' | 'updated_at'>) => Promise<AnaliseCobertura | null>;
  updateAnalise: (id: string, data: Partial<AnaliseCobertura>) => Promise<AnaliseCobertura | null>;
  deleteAnalise: (id: string) => Promise<boolean>;
  assignAnalise: (analiseId: string, userId: string | null) => Promise<boolean>;
  updateAnaliseStatus: (analiseId: string, status: string) => Promise<boolean>;
}

export function useAnalisesTecnicas(): UseAnalisesTecnicasReturn {
  const { user } = useAuth();
  const [analises, setAnalises] = useState<AnaliseCobertura[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalises = useCallback(async () => {
    if (!user) return;

    try {
      setError(null);

      // Buscar todas as análises (não apenas do usuário logado)
      const { data, error: fetchError } = await supabase
        .from('analises_cobertura')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setAnalises(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar análises';
      setError(errorMessage);
      console.error('Erro ao buscar análises:', err);
    }
  }, [user]);

  const fetchUsers = useCallback(async () => {
    if (!user) return;

    try {
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
    }
  }, [user]);

  const createAnalise = useCallback(async (data: Omit<AnaliseCobertura, 'id' | 'created_at' | 'updated_at'>): Promise<AnaliseCobertura | null> => {
    if (!user) return null;

    try {
      setLoading(true);
      setError(null);

      const { data: newAnalise, error: insertError } = await supabase
        .from('analises_cobertura')
        .insert([data])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Atualizar lista local
      setAnalises(prev => [newAnalise, ...prev]);
      
      return newAnalise;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar análise';
      setError(errorMessage);
      console.error('Erro ao criar análise:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateAnalise = useCallback(async (id: string, data: Partial<AnaliseCobertura>): Promise<AnaliseCobertura | null> => {
    if (!user) return null;

    try {
      setLoading(true);
      setError(null);

      const { data: updatedAnalise, error: updateError } = await supabase
        .from('analises_cobertura')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Atualizar lista local
      setAnalises(prev => prev.map(analise => 
        analise.id === id ? updatedAnalise : analise
      ));
      
      return updatedAnalise;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar análise';
      setError(errorMessage);
      console.error('Erro ao atualizar análise:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteAnalise = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('analises_cobertura')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      // Remover da lista local
      setAnalises(prev => prev.filter(analise => analise.id !== id));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir análise';
      setError(errorMessage);
      console.error('Erro ao excluir análise:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const assignAnalise = useCallback(async (analiseId: string, userId: string | null): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('analises_cobertura')
        .update({ user_id: userId })
        .eq('id', analiseId);

      if (updateError) {
        throw updateError;
      }

      // Atualizar lista local
      setAnalises(prev => prev.map(analise => 
        analise.id === analiseId ? { ...analise, user_id: userId } : analise
      ));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atribuir análise';
      setError(errorMessage);
      console.error('Erro ao atribuir análise:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateAnaliseStatus = useCallback(async (analiseId: string, status: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('analises_cobertura')
        .update({ status })
        .eq('id', analiseId);

      if (updateError) {
        throw updateError;
      }

      // Atualizar lista local
      setAnalises(prev => prev.map(analise => 
        analise.id === analiseId ? { ...analise, status } : analise
      ));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar status';
      setError(errorMessage);
      console.error('Erro ao atualizar status:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Carregar dados quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchAnalises(), fetchUsers()]).finally(() => {
        setLoading(false);
      });
    } else {
      setAnalises([]);
      setUsers([]);
      setLoading(false);
    }
  }, [user, fetchAnalises, fetchUsers]);

  return {
    analises,
    users,
    loading,
    error,
    fetchAnalises,
    fetchUsers,
    createAnalise,
    updateAnalise,
    deleteAnalise,
    assignAnalise,
    updateAnaliseStatus
  };
}
