import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { AnaliseCobertura, AnaliseCoberturaFormData } from '@/types/analises';

interface UseAnalisesReturn {
  analises: AnaliseCobertura[];
  loading: boolean;
  error: string | null;
  fetchAnalises: () => Promise<void>;
  createAnalise: (data: AnaliseCoberturaFormData) => Promise<AnaliseCobertura | null>;
  updateAnalise: (id: string, data: AnaliseCoberturaFormData) => Promise<AnaliseCobertura | null>;
  deleteAnalise: (id: string) => Promise<boolean>;
}

// Tipo para inserção no banco
type AnaliseInsertData = {
  user_id: string;
  nome: string;
  email: string;
  telefone: string | null;
  nome_fazenda: string;
  area_fazenda_ha: number | null;
  latitude: number | null;
  longitude: number | null;
  observacoes: string | null;
  status: string;
};

// Tipo para atualização no banco
type AnaliseUpdateData = {
  nome: string;
  email: string;
  telefone: string | null;
  nome_fazenda: string;
  area_fazenda_ha: number | null;
  latitude: number | null;
  longitude: number | null;
  observacoes: string | null;
};

export function useAnalises(): UseAnalisesReturn {
  const { user } = useAuth();
  const [analises, setAnalises] = useState<AnaliseCobertura[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalises = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('analises_cobertura')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setAnalises(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar análises';
      setError(errorMessage);
      console.error('Erro ao buscar análises:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createAnalise = useCallback(async (data: AnaliseCoberturaFormData): Promise<AnaliseCobertura | null> => {
    if (!user) return null;

    try {
      setLoading(true);
      setError(null);

      const analiseData: AnaliseInsertData = {
        user_id: user.id,
        nome: data.nome,
        email: data.email,
        telefone: data.telefone || null,
        nome_fazenda: data.nome_fazenda,
        area_fazenda_ha: data.area_fazenda_ha ? parseFloat(data.area_fazenda_ha) : null,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        observacoes: data.observacoes || null,
        status: 'pendente'
      };

      const { data: newAnalise, error: insertError } = await supabase
        .from('analises_cobertura')
        .insert(analiseData)
        .select()
        .single();

      if (insertError) {
        console.error('Erro do Supabase:', insertError);
        throw insertError;
      }

      // Atualizar lista local
      setAnalises(prev => [newAnalise, ...prev]);
      
      return newAnalise;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar análise';
      setError(errorMessage);
      console.error('Erro ao criar análise:', err);
      
      // Log mais detalhado do erro
      if (err && typeof err === 'object' && 'code' in err) {
        const errorInfo = err as { code?: string; details?: unknown; message?: string };
        console.error('Código do erro:', errorInfo.code);
        console.error('Detalhes do erro:', errorInfo.details);
        console.error('Mensagem do erro:', errorInfo.message);
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateAnalise = useCallback(async (id: string, data: AnaliseCoberturaFormData): Promise<AnaliseCobertura | null> => {
    if (!user) return null;

    try {
      setLoading(true);
      setError(null);

      const updateData: AnaliseUpdateData = {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone || null,
        nome_fazenda: data.nome_fazenda,
        area_fazenda_ha: data.area_fazenda_ha ? parseFloat(data.area_fazenda_ha) : null,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        observacoes: data.observacoes || null
      };

      const { data: updatedAnalise, error: updateError } = await supabase
        .from('analises_cobertura')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
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
        .eq('id', id)
        .eq('user_id', user.id); // Garantir que só o dono pode deletar

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

  // Carregar análises quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      fetchAnalises();
    } else {
      setAnalises([]);
    }
  }, [user, fetchAnalises]);

  return {
    analises,
    loading,
    error,
    fetchAnalises,
    createAnalise,
    updateAnalise,
    deleteAnalise
  };
}
