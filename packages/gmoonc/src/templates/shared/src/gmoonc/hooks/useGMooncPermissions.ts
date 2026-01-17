import { useGMooncSession } from '../session/GMooncSessionContext';

interface UseGMooncPermissionsReturn {
  hasPermission: (options: { moduleName: string; permissionType: string }) => boolean;
  checkPermission: (options: { moduleName: string; permissionType: string }) => boolean;
  loading: boolean;
}

export function useGMooncPermissions(): UseGMooncPermissionsReturn {
  const { roles } = useGMooncSession();

  // Mock: admin has all permissions
  const hasPermission = (options: { moduleName: string; permissionType: string }): boolean => {
    return roles.includes('admin');
  };

  const checkPermission = (options: { moduleName: string; permissionType: string }): boolean => {
    return roles.includes('admin');
  };

  return {
    hasPermission,
    checkPermission,
    loading: false
  };
}
