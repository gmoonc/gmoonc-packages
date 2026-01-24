import { useState, useCallback, useEffect } from 'react';
import { useGMooncSession } from '../session/GMooncSessionContext';
import { Mensagem } from '../types/mensagens';

interface User {
  id: string;
  name: string;
  email: string;
  role: string | null;
}

interface UseGMooncMensagensTecnicasReturn {
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

// Mock data storage (in-memory)
let mockMensagens: Mensagem[] = [
  {
    id: '1',
    user_id: null,
    nome: 'John Doe',
    email: 'john@example.com',
    telefone: '123456789',
    company: 'Company A',
    mensagem: 'Test message',
    status: 'pendente',
    created_at: new Date().toISOString(),
    updated_at: null
  }
];

let mockUsers: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
  { id: '2', name: 'Tech User', email: 'tech@example.com', role: 'technical' }
];

export function useGMooncMensagensTecnicas(): UseGMooncMensagensTecnicasReturn {
  const { user } = useGMooncSession();
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMensagens = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      // Mock: simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      setMensagens([...mockMensagens]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching messages';
      setError(errorMessage);
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchUsers = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 200));
      setUsers([...mockUsers]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching users';
      setError(errorMessage);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const assignMensagem = useCallback(async (mensagemId: string, userId: string | null): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const index = mockMensagens.findIndex(m => m.id === mensagemId);
      if (index !== -1) {
        mockMensagens[index] = { ...mockMensagens[index], user_id: userId };
        setMensagens([...mockMensagens]);
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error assigning message';
      setError(errorMessage);
      console.error('Error assigning message:', err);
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
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const index = mockMensagens.findIndex(m => m.id === mensagemId);
      if (index !== -1) {
        mockMensagens[index] = { ...mockMensagens[index], status, updated_at: new Date().toISOString() };
        setMensagens([...mockMensagens]);
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating status';
      setError(errorMessage);
      console.error('Error updating status:', err);
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
      await new Promise(resolve => setTimeout(resolve, 300));
      
      mockMensagens = mockMensagens.filter(m => m.id !== mensagemId);
      setMensagens([...mockMensagens]);
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

  const updateMensagem = useCallback(async (mensagemId: string, data: Partial<Mensagem>): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const index = mockMensagens.findIndex(m => m.id === mensagemId);
      if (index !== -1) {
        mockMensagens[index] = { ...mockMensagens[index], ...data, updated_at: new Date().toISOString() };
        setMensagens([...mockMensagens]);
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating message';
      setError(errorMessage);
      console.error('Error updating message:', err);
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
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newMensagem: Mensagem = {
        ...data,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: null
      };
      mockMensagens = [newMensagem, ...mockMensagens];
      setMensagens([...mockMensagens]);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating message';
      setError(errorMessage);
      console.error('Error creating message:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

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
