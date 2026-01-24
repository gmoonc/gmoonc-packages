import { useState, useCallback, useEffect } from 'react';
import { useGMooncSession } from '../session/GMooncSessionContext';
import { Mensagem, MensagemFormData } from '../types/mensagens';

interface UseGMooncMensagensReturn {
  mensagens: Mensagem[];
  loading: boolean;
  error: string | null;
  fetchMensagens: () => Promise<void>;
  createMensagem: (data: MensagemFormData) => Promise<Mensagem | null>;
  updateMensagem: (id: string, data: MensagemFormData) => Promise<Mensagem | null>;
  deleteMensagem: (id: string) => Promise<boolean>;
}

// Mock data storage (in-memory, per user)
const mockMensagensByUser: Record<string, Mensagem[]> = {};

export function useGMooncMensagens(): UseGMooncMensagensReturn {
  const { user } = useGMooncSession();
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMensagens = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const userMensagens = mockMensagensByUser[user.id] || [];
      setMensagens([...userMensagens]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching messages';
      setError(errorMessage);
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createMensagem = useCallback(async (data: MensagemFormData): Promise<Mensagem | null> => {
    if (!user) return null;

    try {
      setLoading(true);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newMensagem: Mensagem = {
        id: Date.now().toString(),
        user_id: user.id,
        nome: data.nome,
        email: data.email,
        telefone: data.telefone || null,
        company: data.company,
        mensagem: data.mensagem,
        status: 'pendente',
        created_at: new Date().toISOString(),
        updated_at: null
      };

      if (!mockMensagensByUser[user.id]) {
        mockMensagensByUser[user.id] = [];
      }
      mockMensagensByUser[user.id] = [newMensagem, ...mockMensagensByUser[user.id]];
      setMensagens([...mockMensagensByUser[user.id]]);
      
      return newMensagem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating message';
      setError(errorMessage);
      console.error('Error creating message:', err);
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
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const userMensagens = mockMensagensByUser[user.id] || [];
      const index = userMensagens.findIndex(m => m.id === id);
      if (index !== -1) {
        userMensagens[index] = {
          ...userMensagens[index],
          ...data,
          updated_at: new Date().toISOString()
        };
        mockMensagensByUser[user.id] = [...userMensagens];
        setMensagens([...userMensagens]);
        return userMensagens[index];
      }
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating message';
      setError(errorMessage);
      console.error('Error updating message:', err);
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
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const userMensagens = mockMensagensByUser[user.id] || [];
      mockMensagensByUser[user.id] = userMensagens.filter(m => m.id !== id);
      setMensagens([...mockMensagensByUser[user.id]]);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting message';
      setError(errorMessage);
      console.error('Error deleting message:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchMensagens();
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
