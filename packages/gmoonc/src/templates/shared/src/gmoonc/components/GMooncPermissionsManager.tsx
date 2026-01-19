import React, { useState, useEffect } from 'react';
import { useGMooncSession } from '../session/GMooncSessionContext';
import '../styles/app.css';

interface Role {
  id: string;
  name: string;
  description: string | null;
  is_system_role: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

interface Module {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

interface Permission {
  id: string;
  role_id: string;
  module_id: string;
  can_access: boolean | null;
  can_create: boolean | null;
  can_read: boolean | null;
  can_update: boolean | null;
  can_delete: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

interface NewPermission {
  role_id: string;
  module_id: string;
  can_access: boolean;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
}

interface PermissionMatrix {
  [roleId: string]: {
    [moduleId: string]: Permission | NewPermission;
  };
}

// Mock data storage
let mockRoles: Role[] = [
  { id: '1', name: 'admin', description: 'Administrator role', is_system_role: true, created_at: new Date().toISOString(), updated_at: null },
  { id: '2', name: 'user', description: 'Regular user role', is_system_role: true, created_at: new Date().toISOString(), updated_at: null }
];

let mockModules: Module[] = [
  { id: '1', name: 'admin', display_name: 'Admin', description: null, is_active: true, created_at: new Date().toISOString(), updated_at: null },
  { id: '2', name: 'technical', display_name: 'Technical', description: null, is_active: true, created_at: new Date().toISOString(), updated_at: null },
  { id: '3', name: 'customer', display_name: 'Customer', description: null, is_active: true, created_at: new Date().toISOString(), updated_at: null }
];

let mockPermissions: Permission[] = [];
let mockUserCounts: Record<string, number> = {};

export function GMooncPermissionsManager() {
  const { user } = useGMooncSession();
  const [roles, setRoles] = useState<Role[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [permissions, setPermissions] = useState<PermissionMatrix>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNewRoleModal, setShowNewRoleModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deletingRole, setDeletingRole] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 300));

      const permissionMatrix: PermissionMatrix = {};
      mockRoles.forEach(role => {
        permissionMatrix[role.id] = {};
        mockModules.forEach(module => {
          const existingPermission = mockPermissions.find(
            p => p.role_id === role.id && p.module_id === module.id
          );
          if (existingPermission) {
            permissionMatrix[role.id][module.id] = existingPermission;
          }
        });
      });

      setRoles([...mockRoles]);
      setModules([...mockModules]);
      setPermissions(permissionMatrix);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Error loading data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (roleId: string, moduleId: string, field: keyof Permission, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [moduleId]: {
          ...prev[roleId]?.[moduleId],
          [field]: value,
          role_id: roleId,
          module_id: moduleId
        } as Permission | NewPermission
      }
    }));
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setShowEditRoleModal(true);
  };

  const saveRoleEdit = async () => {
    if (!editingRole || !editingRole.name.trim()) {
      setError('Role name is required');
      return;
    }

    try {
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 300));

      const index = mockRoles.findIndex(r => r.id === editingRole.id);
      if (index !== -1) {
        mockRoles[index] = {
          ...mockRoles[index],
          name: editingRole.name.trim().toLowerCase(),
          description: editingRole.description?.trim() || null,
          updated_at: new Date().toISOString()
        };
        setRoles([...mockRoles]);
      }

      setSuccess('Role updated successfully!');
      setShowEditRoleModal(false);
      setEditingRole(null);
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating role:', error);
      setError('Error updating role. Please try again.');
    }
  };

  const checkRoleUsage = async (roleId: string): Promise<number> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockUserCounts[roleId] || 0;
  };

  const deleteRole = async (roleId: string, roleName: string) => {
    if (!confirm(`Are you sure you want to delete the role "${roleName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingRole(roleId);
      setError(null);

      const userCount = await checkRoleUsage(roleId);
      if (userCount > 0) {
        setError(`Cannot delete role "${roleName}" as it is assigned to ${userCount} user(s). Remove the assignment before deleting.`);
        setDeletingRole(null);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 300));
      mockRoles = mockRoles.filter(r => r.id !== roleId);
      mockPermissions = mockPermissions.filter(p => p.role_id !== roleId);
      setRoles([...mockRoles]);
      await loadData();

      setSuccess('Role deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error deleting role:', error);
      setError('Error deleting role. Please try again.');
    } finally {
      setDeletingRole(null);
    }
  };

  const savePermissions = async () => {
    try {
      setSaving(true);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 500));

      const permissionsToUpdate: Array<{
        id: string;
        role_id: string;
        module_id: string;
        can_access: boolean;
        can_create: boolean;
        can_read: boolean;
        can_update: boolean;
        can_delete: boolean;
      }> = [];

      const permissionsToInsert: Array<{
        role_id: string;
        module_id: string;
        can_access: boolean;
        can_create: boolean;
        can_read: boolean;
        can_update: boolean;
        can_delete: boolean;
      }> = [];

      Object.values(permissions).forEach(rolePermissions => {
        Object.values(rolePermissions).forEach((permission) => {
          const hasValidId = 'id' in permission && permission.id && typeof permission.id === 'string' && permission.id.trim() !== '';

          const permissionData = {
            role_id: permission.role_id,
            module_id: permission.module_id,
            can_access: permission.can_access ?? false,
            can_create: permission.can_create ?? false,
            can_read: permission.can_read ?? false,
            can_update: permission.can_update ?? false,
            can_delete: permission.can_delete ?? false
          };

          if (hasValidId) {
            permissionsToUpdate.push({
              ...permissionData,
              id: permission.id
            });
          } else {
            permissionsToInsert.push(permissionData);
          }
        });
      });

      // Update mock storage
      permissionsToUpdate.forEach(perm => {
        const index = mockPermissions.findIndex(p => p.id === perm.id);
        if (index !== -1) {
          mockPermissions[index] = { ...mockPermissions[index], ...perm };
        }
      });

      permissionsToInsert.forEach(perm => {
        const newPerm: Permission = {
          ...perm,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString(),
          updated_at: null
        };
        mockPermissions.push(newPerm);
      });

      setSuccess('Permissions saved successfully!');
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving permissions:', error);
      setError('Error saving permissions. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const createNewRole = async () => {
    if (!newRoleName.trim()) {
      setError('Role name is required');
      return;
    }

    try {
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 300));

      const newRole: Role = {
        id: Date.now().toString(),
        name: newRoleName.trim().toLowerCase(),
        description: newRoleDescription.trim() || null,
        is_system_role: false,
        created_at: new Date().toISOString(),
        updated_at: null
      };

      mockRoles.push(newRole);

      const defaultPermissions = mockModules.map(module => ({
        role_id: newRole.id,
        module_id: module.id,
        can_access: false,
        can_create: false,
        can_read: false,
        can_update: false,
        can_delete: false
      }));

      defaultPermissions.forEach(perm => {
        const newPerm: Permission = {
          ...perm,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString(),
          updated_at: null
        };
        mockPermissions.push(newPerm);
      });

      setSuccess('Role created successfully!');
      setShowNewRoleModal(false);
      setNewRoleName('');
      setNewRoleDescription('');
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error creating role:', error);
      setError('Error creating role. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg font-semibold" style={{ color: 'var(--gmoonc-color-text-primary, #374161)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Botão de ação no topo */}
      <div className="mb-6 sm:mb-8 flex justify-end">
        <button
          onClick={() => setShowNewRoleModal(true)}
          className="px-5 py-2.5 rounded-lg text-white font-semibold transition-all duration-200 hover:shadow-lg whitespace-nowrap"
          style={{ backgroundColor: 'var(--gmoonc-color-accent, #71b399)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5fa086'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--gmoonc-color-accent, #71b399)'}
        >
          + New Role
        </button>
      </div>

      {/* Mensagens de erro e sucesso */}
      {error && (
        <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: 'var(--gmoonc-color-error-bg, #fef2f2)', borderColor: 'var(--gmoonc-color-error-border, #fecaca)', color: 'var(--gmoonc-color-error, #dc2626)' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: 'var(--gmoonc-color-success-bg, #f0fdf4)', borderColor: 'var(--gmoonc-color-success-border, #bbf7d0)', color: 'var(--gmoonc-color-success, #166534)' }}>
          {success}
        </div>
      )}

      {/* Desktop e Tablet - Tabela */}
      <div className="hidden lg:block overflow-x-auto bg-white rounded-lg shadow-sm border" style={{ borderColor: 'var(--gmoonc-color-border, #dbe2ea)' }}>
        <table className="min-w-full">
          <thead style={{ backgroundColor: 'var(--gmoonc-color-bg-light, #eaf0f5)' }}>
            <tr>
              <th className="px-4 py-4 text-left text-sm font-semibold align-middle min-w-[220px]" style={{ color: 'var(--gmoonc-color-text-primary, #374161)', borderBottom: '2px solid var(--gmoonc-color-border, #dbe2ea)' }}>
                Roles / Modules
              </th>
              {modules.map(module => (
                <th key={module.id} className="px-3 py-4 text-center text-xs font-semibold align-middle min-w-[140px]" style={{ color: 'var(--gmoonc-color-text-primary, #374161)', borderBottom: '2px solid var(--gmoonc-color-border, #dbe2ea)' }}>
                  {module.display_name}
                </th>
              ))}
              <th className="px-4 py-4 text-center text-sm font-semibold align-middle min-w-[120px]" style={{ color: 'var(--gmoonc-color-text-primary, #374161)', borderBottom: '2px solid var(--gmoonc-color-border, #dbe2ea)' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role, idx) => (
              <tr key={role.id} className="transition-colors hover:bg-opacity-50" style={{ backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--gmoonc-color-surface-light, #f8f9fa)', borderBottom: '1px solid var(--gmoonc-color-bg-light, #eaf0f5)' }}>
                <td className="px-4 py-4 align-middle">
                  <div>
                    <div className="font-semibold text-base" style={{ color: 'var(--gmoonc-color-text-primary, #374161)' }}>{role.name}</div>
                    {role.description && (
                      <div className="text-sm mt-1" style={{ color: 'var(--gmoonc-color-primary-2, #6374AD)' }}>{role.description}</div>
                    )}
                    {role.is_system_role && (
                      <span className="inline-block text-xs px-2 py-1 rounded-full mt-2" style={{ backgroundColor: 'var(--gmoonc-color-border, #dbe2ea)', color: 'var(--gmoonc-color-text-primary, #374161)' }}>
                        System
                      </span>
                    )}
                  </div>
                </td>
                {modules.map(module => {
                  const permission = permissions[role.id]?.[module.id];
                  if (!permission) {
                    return (
                      <td key={module.id} className="px-2 py-4 align-top">
                        <div className="flex justify-center">
                          <div className="flex flex-col items-start gap-1">
                            <label className="flex items-center gap-2 cursor-pointer h-8">
                              <input
                                type="checkbox"
                                checked={false}
                                onChange={(e) => {
                                  const newPermission: NewPermission = {
                                    role_id: role.id,
                                    module_id: module.id,
                                    can_access: e.target.checked,
                                    can_create: false,
                                    can_read: false,
                                    can_update: false,
                                    can_delete: false
                                  };
                                  setPermissions(prev => ({
                                    ...prev,
                                    [role.id]: {
                                      ...prev[role.id],
                                      [module.id]: newPermission
                                    }
                                  }));
                                }}
                                className="w-4 h-4 rounded cursor-pointer flex-shrink-0"
                                style={{ accentColor: 'var(--gmoonc-color-accent, #71b399)' }}
                              />
                              <span className="text-xs whitespace-nowrap" style={{ color: 'var(--gmoonc-color-primary-2, #6374AD)' }}>Access</span>
                            </label>
                            {['Create', 'Read', 'Update', 'Delete'].map((label) => (
                              <label key={label} className="flex items-center gap-2 opacity-40 h-8">
                                <input
                                  type="checkbox"
                                  checked={false}
                                  disabled
                                  className="w-4 h-4 rounded flex-shrink-0"
                                />
                                <span className="text-xs whitespace-nowrap" style={{ color: '#aaa' }}>{label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </td>
                    );
                  }

                  return (
                    <td key={module.id} className="px-2 py-4 align-top">
                      <div className="flex justify-center">
                        <div className="flex flex-col items-start gap-1">
                          {[
                            { key: 'can_access', label: 'Access' },
                            { key: 'can_create', label: 'Create' },
                            { key: 'can_read', label: 'Read' },
                            { key: 'can_update', label: 'Update' },
                            { key: 'can_delete', label: 'Delete' }
                          ].map(({ key, label }) => (
                            <label key={key} className="flex items-center gap-2 cursor-pointer h-8">
                              <input
                                type="checkbox"
                                checked={!!permission[key as keyof typeof permission]}
                                onChange={(e) => handlePermissionChange(role.id, module.id, key as keyof Permission, e.target.checked)}
                                className="w-4 h-4 rounded cursor-pointer flex-shrink-0"
                                style={{ accentColor: 'var(--gmoonc-color-accent, #71b399)' }}
                              />
                              <span className="text-xs whitespace-nowrap" style={{ color: 'var(--gmoonc-color-primary-2, #6374AD)' }}>{label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </td>
                  );
                })}
                <td className="px-4 py-4 align-middle text-center">
                  {!role.is_system_role && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleEditRole(role)}
                        className="text-sm px-3 py-1.5 rounded-lg border transition-all duration-200"
                        style={{
                          color: 'var(--gmoonc-color-primary-2, #6374AD)',
                          borderColor: 'var(--gmoonc-color-primary-2, #6374AD)',
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--gmoonc-color-primary-2, #6374AD)';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--gmoonc-color-primary-2, #6374AD)';
                        }}
                        title="Edit role"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => deleteRole(role.id, role.name)}
                        className="text-sm px-3 py-1.5 rounded-lg border transition-all duration-200"
                        disabled={deletingRole === role.id}
                        style={{
                          color: deletingRole === role.id ? '#999' : '#c33',
                          borderColor: deletingRole === role.id ? '#ddd' : '#fcc',
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          if (deletingRole !== role.id) {
                            e.currentTarget.style.backgroundColor = '#fee';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        title="Delete role"
                      >
                        {deletingRole === role.id ? '⏳ Deleting...' : '🗑️ Delete'}
                      </button>
                    </div>
                  )}
                  {role.is_system_role && (
                    <span className="text-xs italic" style={{ color: 'var(--gmoonc-color-primary, #879FED)' }}>
                      System role
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tablet e Mobile - Cards individuais sem container externo */}
      <div className="lg:hidden space-y-4">
        {roles.map(role => (
          <div key={role.id} className="p-4 sm:p-5 rounded-lg shadow-md bg-white" style={{ border: '1px solid var(--gmoonc-color-border, #dbe2ea)' }}>
            {/* Role Header com Botões de Ação no Topo */}
            <div className="mb-4 pb-4 sm:mb-4 sm:pb-4" style={{ borderBottom: '1px solid var(--gmoonc-color-border, #dbe2ea)' }}>
              <div className="flex items-start justify-between gap-3 sm:gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg" style={{ color: 'var(--gmoonc-color-text-primary, #374161)' }}>{role.name}</h3>
                  {role.description && (
                    <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--gmoonc-color-primary-2, #6374AD)' }}>{role.description}</p>
                  )}
                  {role.is_system_role && (
                    <span className="inline-block text-xs px-2 py-1 rounded-full mt-2" style={{ backgroundColor: 'var(--gmoonc-color-border, #dbe2ea)', color: 'var(--gmoonc-color-text-primary, #374161)' }}>
                      System
                    </span>
                  )}
                </div>

                {/* Botões de Ação no Topo */}
                {!role.is_system_role && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEditRole(role)}
                      className="flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-all hover:shadow-md"
                      style={{
                        color: '#fff',
                        backgroundColor: 'var(--gmoonc-color-primary-2, #6374AD)',
                        borderColor: 'var(--gmoonc-color-primary-2, #6374AD)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4f5d8f'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--gmoonc-color-primary-2, #6374AD)'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => deleteRole(role.id, role.name)}
                      disabled={deletingRole === role.id}
                      className="flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-all hover:shadow-md disabled:opacity-50"
                      style={{
                        color: deletingRole === role.id ? '#999' : '#fff',
                        backgroundColor: deletingRole === role.id ? '#e0e0e0' : '#c33',
                        borderColor: deletingRole === role.id ? '#ddd' : '#c33'
                      }}
                      onMouseEnter={(e) => !deletingRole && (e.currentTarget.style.backgroundColor = '#a22')}
                      onMouseLeave={(e) => !deletingRole && (e.currentTarget.style.backgroundColor = '#c33')}
                    >
                      {deletingRole === role.id ? (
                        <>
                          <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                          </svg>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Modules Permissions - Grid responsivo otimizado */}
            <div className="space-y-3 sm:space-y-3">
              {modules.map(module => {
                const permission = permissions[role.id]?.[module.id];
                return (
                  <div key={module.id} className="p-3 sm:p-3 rounded-lg" style={{ backgroundColor: 'var(--gmoonc-color-surface-light, #f8f9fa)', border: '1px solid var(--gmoonc-color-bg-light, #eaf0f5)' }}>
                    <h4 className="font-semibold text-sm mb-3 sm:mb-3" style={{ color: 'var(--gmoonc-color-text-primary, #374161)' }}>{module.display_name}</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                      {!permission ? (
                        <>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={false}
                              onChange={(e) => {
                                const newPermission: NewPermission = {
                                  role_id: role.id,
                                  module_id: module.id,
                                  can_access: e.target.checked,
                                  can_create: false,
                                  can_read: false,
                                  can_update: false,
                                  can_delete: false
                                };
                                setPermissions(prev => ({
                                  ...prev,
                                  [role.id]: {
                                    ...prev[role.id],
                                    [module.id]: newPermission
                                  }
                                }));
                              }}
                              className="w-4 h-4 rounded flex-shrink-0"
                              style={{ accentColor: '#71b399' }}
                            />
                            <span className="text-xs" style={{ color: '#6374AD' }}>Access</span>
                          </label>
                          {['Create', 'Read', 'Update', 'Delete'].map((label) => (
                            <label key={label} className="flex items-center space-x-2 opacity-40">
                              <input type="checkbox" checked={false} disabled className="w-4 h-4 rounded flex-shrink-0" />
                              <span className="text-xs" style={{ color: '#aaa' }}>{label}</span>
                            </label>
                          ))}
                        </>
                      ) : (
                        <>
                          {[
                            { key: 'can_access', label: 'Access' },
                            { key: 'can_create', label: 'Create' },
                            { key: 'can_read', label: 'Read' },
                            { key: 'can_update', label: 'Update' },
                            { key: 'can_delete', label: 'Delete' }
                          ].map(({ key, label }) => (
                            <label key={key} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!permission[key as keyof typeof permission]}
                                onChange={(e) => handlePermissionChange(role.id, module.id, key as keyof Permission, e.target.checked)}
                                className="w-4 h-4 rounded flex-shrink-0"
                                style={{ accentColor: 'var(--gmoonc-color-accent, #71b399)' }}
                              />
                              <span className="text-xs" style={{ color: '#6374AD' }}>{label}</span>
                            </label>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Botão Salvar */}
      <div className="mt-6 sm:mt-8 flex justify-end">
        <button
          onClick={savePermissions}
          disabled={saving}
          className="px-6 py-3 rounded-lg text-white font-semibold transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          style={{ backgroundColor: saving ? '#999' : '#71b399' }}
          onMouseEnter={(e) => !saving && (e.currentTarget.style.backgroundColor = '#5fa086')}
          onMouseLeave={(e) => !saving && (e.currentTarget.style.backgroundColor = '#71b399')}
        >
          {saving ? 'Saving...' : 'Save Permissions'}
        </button>
      </div>

      {/* Modal para Nova Role */}
      {showNewRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ fontFamily: 'var(--gmoonc-font-family)' }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl" style={{ fontFamily: 'var(--gmoonc-font-family)' }}>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--gmoonc-color-text-primary, #374161)', fontFamily: 'var(--gmoonc-font-family)' }}>Create New Role</h2>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gmoonc-color-text-primary, #374161)', fontFamily: 'var(--gmoonc-font-family)' }}>
                Role Name *
              </label>
              <input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#71b399] transition-all"
                style={{ borderColor: 'var(--gmoonc-color-border, #dbe2ea)', fontFamily: 'var(--gmoonc-font-family)', color: 'var(--gmoonc-color-text-primary, #374161)' }}
                placeholder="e.g., manager, supervisor"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gmoonc-color-text-primary, #374161)', fontFamily: 'var(--gmoonc-font-family)' }}>
                Description
              </label>
              <textarea
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: 'var(--gmoonc-color-border, #dbe2ea)', fontFamily: 'var(--gmoonc-font-family)', color: 'var(--gmoonc-color-text-primary, #374161)' }}
                rows={3}
                placeholder="Description of this role's function"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNewRoleModal(false);
                  setNewRoleName('');
                  setNewRoleDescription('');
                }}
                className="flex-1 px-4 py-2.5 rounded-lg border transition-all"
                style={{ color: 'var(--gmoonc-color-primary-2, #6374AD)', borderColor: 'var(--gmoonc-color-border, #dbe2ea)', fontFamily: 'var(--gmoonc-font-family)' }}
              >
                Cancel
              </button>
              <button
                onClick={createNewRole}
                className="flex-1 px-4 py-2.5 rounded-lg text-white font-semibold transition-all"
                style={{ backgroundColor: 'var(--gmoonc-color-accent, #71b399)', fontFamily: 'var(--gmoonc-font-family)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5fa086'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--gmoonc-color-accent, #71b399)'}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Editar Role */}
      {showEditRoleModal && editingRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ fontFamily: 'var(--gmoonc-font-family)' }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl" style={{ fontFamily: 'var(--gmoonc-font-family)' }}>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--gmoonc-color-text-primary, #374161)', fontFamily: 'var(--gmoonc-font-family)' }}>Edit Role</h2>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gmoonc-color-text-primary, #374161)' }}>
                Role Name *
              </label>
              <input
                type="text"
                value={editingRole.name}
                onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: 'var(--gmoonc-color-border, #dbe2ea)', fontFamily: 'var(--gmoonc-font-family)', color: 'var(--gmoonc-color-text-primary, #374161)' }}
                placeholder="e.g., manager, supervisor"
                maxLength={50}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--gmoonc-color-primary, #879FED)', fontFamily: 'var(--gmoonc-font-family)' }}>
                Maximum 50 characters
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gmoonc-color-text-primary, #374161)' }}>
                Description
              </label>
              <textarea
                value={editingRole.description || ''}
                onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: 'var(--gmoonc-color-border, #dbe2ea)', fontFamily: 'var(--gmoonc-font-family)', color: 'var(--gmoonc-color-text-primary, #374161)' }}
                rows={3}
                placeholder="Description of this role's function"
                maxLength={200}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--gmoonc-color-primary, #879FED)', fontFamily: 'var(--gmoonc-font-family)' }}>
                Maximum 200 characters
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEditRoleModal(false);
                  setEditingRole(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-lg border transition-all"
                style={{ color: 'var(--gmoonc-color-primary-2, #6374AD)', borderColor: 'var(--gmoonc-color-border, #dbe2ea)', fontFamily: 'var(--gmoonc-font-family)' }}
              >
                Cancel
              </button>
              <button
                onClick={saveRoleEdit}
                disabled={!editingRole.name.trim()}
                className="flex-1 px-4 py-2.5 rounded-lg text-white font-semibold transition-all disabled:opacity-50"
                style={{ backgroundColor: 'var(--gmoonc-color-primary-2, #6374AD)', fontFamily: 'var(--gmoonc-font-family)' }}
                onMouseEnter={(e) => !editingRole.name.trim() ? null : e.currentTarget.style.backgroundColor = '#4f5d8f'}
                onMouseLeave={(e) => !editingRole.name.trim() ? null : e.currentTarget.style.backgroundColor = 'var(--gmoonc-color-primary-2, #6374AD)'}
              >
                ✏️ Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
