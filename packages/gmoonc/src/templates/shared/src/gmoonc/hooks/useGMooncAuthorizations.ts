import { useState, useCallback, useEffect } from 'react';
import { useGMooncSession } from '../session/GMooncSessionContext';

export interface GMooncRole {
  id: string;
  name: string;
  description: string | null;
  is_system_role: boolean | null;
}

export interface GMooncUserForAuth {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface UseGMooncAuthorizationsReturn {
  users: GMooncUserForAuth[];
  roles: GMooncRole[];
  loading: boolean;
  error: string | null;
  updateUserRole: (userId: string, newRole: string) => Promise<boolean>;
}

// Mock data
let mockUsers: GMooncUserForAuth[] = [
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

let mockRoles: GMooncRole[] = [
  {
    id: '1',
    name: 'administrator',
    description: 'System administrator',
    is_system_role: true
  },
  {
    id: '2',
    name: 'customer',
    description: 'Customer user',
    is_system_role: true
  },
  {
    id: '3',
    name: 'employee',
    description: 'Employee user',
    is_system_role: false
  }
];

export function useGMooncAuthorizations(): UseGMooncAuthorizationsReturn {
  const { user } = useGMooncSession();
  const [users, setUsers] = useState<GMooncUserForAuth[]>([]);
  const [roles, setRoles] = useState<GMooncRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 300));

      setUsers([...mockUsers]);
      setRoles([...mockRoles]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching data';
      setError(errorMessage);
      console.error('Error fetching authorizations data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateUserRole = useCallback(async (userId: string, newRole: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 300));

      const index = mockUsers.findIndex(u => u.id === userId);
      if (index === -1) {
        setError('User not found');
        return false;
      }

      mockUsers[index] = {
        ...mockUsers[index],
        role: newRole,
        updated_at: new Date().toISOString()
      };

      setUsers([...mockUsers]);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating user role';
      setError(errorMessage);
      console.error('Error updating user role:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  return {
    users,
    roles,
    loading,
    error,
    updateUserRole
  };
}
