import { useState, useCallback, useEffect } from 'react';
import { useGMooncSession } from '../session/GMooncSessionContext';

export interface GMooncUser {
  id: string;
  email: string;
  name: string;
  role: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface UseGMooncUsersReturn {
  users: GMooncUser[];
  loading: boolean;
  error: string | null;
  fetchUsers: (searchTerm?: string, roleFilter?: string, page?: number, perPage?: number) => Promise<{ users: GMooncUser[]; total: number }>;
  updateUser: (id: string, data: Partial<GMooncUser>) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
}

// Mock data storage (in-memory)
let mockUsers: GMooncUser[] = [
  {
    id: '1',
    email: 'admin@gmoonc.com',
    name: 'Admin User',
    role: 'administrator',
    created_at: new Date().toISOString(),
    updated_at: null
  },
  {
    id: '2',
    email: 'user@gmoonc.com',
    name: 'Regular User',
    role: 'customer',
    created_at: new Date().toISOString(),
    updated_at: null
  }
];

export function useGMooncUsers(): UseGMooncUsersReturn {
  const { user } = useGMooncSession();
  const [users, setUsers] = useState<GMooncUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (
    searchTerm: string = '',
    roleFilter: string = '',
    page: number = 1,
    perPage: number = 10
  ): Promise<{ users: GMooncUser[]; total: number }> => {
    if (!user) {
      return { users: [], total: 0 };
    }

    try {
      setLoading(true);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 300));

      let filtered = [...mockUsers];

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(u =>
          u.name.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower)
        );
      }

      if (roleFilter) {
        filtered = filtered.filter(u => u.role === roleFilter);
      }

      const total = filtered.length;
      const start = (page - 1) * perPage;
      const end = start + perPage;
      const paginated = filtered.slice(start, end);

      setUsers(paginated);
      return { users: paginated, total };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching users';
      setError(errorMessage);
      console.error('Error fetching users:', err);
      return { users: [], total: 0 };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateUser = useCallback(async (id: string, data: Partial<GMooncUser>): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 300));

      const index = mockUsers.findIndex(u => u.id === id);
      if (index === -1) {
        setError('User not found');
        return false;
      }

      mockUsers[index] = {
        ...mockUsers[index],
        ...data,
        updated_at: new Date().toISOString()
      };

      setUsers([...mockUsers]);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating user';
      setError(errorMessage);
      console.error('Error updating user:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteUser = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 300));

      const index = mockUsers.findIndex(u => u.id === id);
      if (index === -1) {
        setError('User not found');
        return false;
      }

      mockUsers.splice(index, 1);
      setUsers([...mockUsers]);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting user';
      setError(errorMessage);
      console.error('Error deleting user:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user, fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    updateUser,
    deleteUser
  };
}
