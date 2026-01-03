import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface PermissionCheck {
  moduleName: string;
  permissionType?: 'access' | 'create' | 'read' | 'update' | 'delete';
}

interface UserPermission {
  module_name: string;
  can_access: boolean;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
}

interface UsePermissionsReturn {
  hasPermission: (check: PermissionCheck) => boolean;
  checkPermission: (check: PermissionCheck) => Promise<boolean>;
  userPermissions: UserPermission[] | null;
  loading: boolean;
}

export function usePermissions(): UsePermissionsReturn {
  const { user } = useAuth();
  const [userPermissions, setUserPermissions] = useState<UserPermission[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Verificação rápida baseada no role (sem consulta ao banco)
  const hasPermission = (check: PermissionCheck): boolean => {
    if (!user) return false;
    
    // Administradores sempre têm acesso
    if (user.role === 'administrador') return true;
    
    // Se não temos as permissões carregadas, retornar false por segurança
    if (!userPermissions) return false;
    
    // Buscar permissão específica
    const permission = userPermissions.find(p => p.module_name === check.moduleName);
    if (!permission) return false;
    
    // Verificar tipo de permissão específico
    switch (check.permissionType) {
      case 'create':
        return permission.can_create;
      case 'read':
        return permission.can_read;
      case 'update':
        return permission.can_update;
      case 'delete':
        return permission.can_delete;
      default:
        return permission.can_access;
    }
  };

  // Verificação completa via API (com consulta ao banco)
  const checkPermission = async (check: PermissionCheck): Promise<boolean> => {
    if (!user) return false;
    
    // Administradores sempre têm acesso
    if (user.role === 'administrador') return true;
    
    try {
      setLoading(true);
      
      const {
        data: { session }
      } = await supabase.auth.getSession();

      const response = await fetch('/api/check-permission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {})
        },
        body: JSON.stringify({
          userId: user.id,
          moduleName: check.moduleName,
          permissionType: check.permissionType || 'access'
        })
      });
      
      const result = await response.json();
      
      if (result.error) {
        console.error('Erro ao verificar permissão:', result.error);
        return false;
      }
      
      return result.data;
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Carregar permissões do usuário
  useEffect(() => {
    const loadUserPermissions = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const {
          data: { session }
        } = await supabase.auth.getSession();

        const response = await fetch('/api/user-permissions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token
              ? { Authorization: `Bearer ${session.access_token}` }
              : {})
          },
          body: JSON.stringify({
            userId: user.id
          })
        });
        
        const result = await response.json();
        
        if (result.error) {
          console.error('Erro ao carregar permissões:', result.error);
        } else {
          setUserPermissions(result.data);
        }
      } catch (error) {
        console.error('Erro ao carregar permissões:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserPermissions();
  }, [user]);

  return {
    hasPermission,
    checkPermission,
    userPermissions,
    loading
  };
}
