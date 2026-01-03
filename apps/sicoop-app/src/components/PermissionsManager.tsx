'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

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

export default function PermissionsManager() {
  const { user } = useAuth();
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

  // Carregar dados iniciais
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carregar autorizações
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (rolesError) throw rolesError;

      // Carregar módulos
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('is_active', true)
        .order('display_name');

      if (modulesError) throw modulesError;

      // Carregar permissões existentes
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('permissions')
        .select('*');

      if (permissionsError) throw permissionsError;

      // Organizar permissões em matriz
      const permissionMatrix: PermissionMatrix = {};
      (rolesData as Role[])?.forEach(role => {
        permissionMatrix[role.id] = {};
        (modulesData as Module[])?.forEach(module => {
          const existingPermission = (permissionsData as Permission[])?.find(
            p => p.role_id === role.id && p.module_id === module.id
          );

          if (existingPermission) {
            // Usar permissão existente
            permissionMatrix[role.id][module.id] = existingPermission;
          } else {
            // Não criar permissão padrão - deixar vazio
            // Só será criada quando o usuário salvar
          }
        });
      });

      setRoles(rolesData || []);
      setModules(modulesData || []);
      setPermissions(permissionMatrix);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados. Tente novamente.');
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
          ...prev[roleId][moduleId],
          [field]: value
        }
      }
    }));
  };

  // Função para abrir modal de edição
  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setShowEditRoleModal(true);
  };

  // Função para salvar edição da role
  const saveRoleEdit = async () => {
    if (!editingRole || !editingRole.name.trim()) {
      setError('Nome da autorização é obrigatório');
      return;
    }

    try {
      setError(null);

      const updates: Database['public']['Tables']['roles']['Update'] = {
        name: editingRole.name.trim().toLowerCase(),
        description: editingRole.description?.trim() || null
      };

      const { error } = await supabase
        .from('roles')
        .update(updates)
        .eq('id', editingRole.id);

      if (error) throw error;

      setSuccess('Autorização atualizada com sucesso!');
      setShowEditRoleModal(false);
      setEditingRole(null);
      await loadData();

      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Erro ao atualizar role:', error);
      setError('Erro ao atualizar autorização. Tente novamente.');
    }
  };

  // Função para verificar se role está sendo usada
  const checkRoleUsage = async (roleId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', (roles.find(r => r.id === roleId)?.name || ''));

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Erro ao verificar uso da role:', error);
      return 0;
    }
  };

  // Função para excluir role
  const deleteRole = async (roleId: string, roleName: string) => {
    if (!confirm(`Tem certeza que deseja deletar a autorização "${roleName}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      setDeletingRole(roleId);
      setError(null);

      // Verificar se a role está sendo usada
      const userCount = await checkRoleUsage(roleId);

      if (userCount > 0) {
        setError(`Não é possível deletar a autorização "${roleName}" pois está atribuída a ${userCount} usuário(s). Remova a atribuição antes de deletar.`);
        setDeletingRole(null);
        return;
      }

      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      setSuccess('Autorização deletada com sucesso!');
      await loadData();

      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Erro ao deletar role:', error);
      setError('Erro ao deletar autorização. Tente novamente.');
    } finally {
      setDeletingRole(null);
    }
  };

  const savePermissions = async () => {
    try {
      setSaving(true);
      setError(null);

      // Separar permissões existentes (para UPDATE) e novas (para INSERT)
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
          // Verificar se é uma permissão existente (tem id válido) ou nova (sem id)
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
            // Permissão existente - adicionar à lista de UPDATE
            permissionsToUpdate.push({
              ...permissionData,
              id: permission.id
            });
          } else {
            // Nova permissão - adicionar à lista de INSERT (sem campo id)
            permissionsToInsert.push(permissionData);
          }
        });
      });

      // Executar UPDATEs primeiro (se houver)
      if (permissionsToUpdate.length > 0) {
        // Para UPDATEs, usar upsert com onConflict no id
        const { error: updateError } = await supabase
          .from('permissions')
          .upsert(permissionsToUpdate, { onConflict: 'id' });

        if (updateError) throw updateError;
      }

      // Executar INSERTs depois (se houver)
      // Para INSERTs, usar insert() diretamente (não upsert) para evitar problemas com id
      if (permissionsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('permissions')
          .insert(permissionsToInsert);

        if (insertError) {
          // Se der erro de conflito (permissão já existe), tentar fazer upsert
          if (insertError.code === '23505') { // Unique violation
            const { error: upsertError } = await supabase
              .from('permissions')
              .upsert(permissionsToInsert, { onConflict: 'role_id,module_id' });

            if (upsertError) throw upsertError;
          } else {
            throw insertError;
          }
        }
      }

      setSuccess('Permissões salvas com sucesso!');
      await loadData(); // Recarregar para obter IDs das novas permissões

      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
      setError('Erro ao salvar permissões. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const createNewRole = async () => {
    if (!newRoleName.trim()) {
      setError('Nome da autorização é obrigatório');
      return;
    }

    try {
      setError(null);

      const { data, error } = await supabase
        .from('roles')
        .insert({
          name: newRoleName.trim().toLowerCase(),
          description: newRoleDescription.trim() || null,
          is_system_role: false
        })
        .select()
        .single();

      if (error) throw error;

      // Criar permissões padrão para a nova role
      const defaultPermissions = modules.map(module => ({
        role_id: data.id,
        module_id: module.id,
        can_access: false,
        can_create: false,
        can_read: false,
        can_update: false,
        can_delete: false
      }));

      const { error: permissionsError } = await supabase
        .from('permissions')
        .insert(defaultPermissions);

      if (permissionsError) throw permissionsError;

      setSuccess('Role criada com sucesso!');
      setShowNewRoleModal(false);
      setNewRoleName('');
      setNewRoleDescription('');
      await loadData();

      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Erro ao criar role:', error);
      setError('Erro ao criar role. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg font-semibold" style={{ color: '#374161' }}>Carregando...</div>
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
          style={{ backgroundColor: '#71b399' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5fa086'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#71b399'}
        >
          + Nova Autorização
        </button>
      </div>

      {/* Mensagens de erro e sucesso */}
      {error && (
        <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: '#fee', borderColor: '#fcc', color: '#c33' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: '#efe', borderColor: '#cfc', color: '#3c3' }}>
          {success}
        </div>
      )}

      {/* Desktop e Tablet - Tabela */}
      <div className="hidden lg:block overflow-x-auto bg-white rounded-lg shadow-sm border" style={{ borderColor: '#dbe2ea' }}>
        <table className="min-w-full">
          <thead style={{ backgroundColor: '#eaf0f5' }}>
            <tr>
              <th className="px-4 py-4 text-left text-sm font-semibold align-middle min-w-[220px]" style={{ color: '#374161', borderBottom: '2px solid #dbe2ea' }}>
                Autorizações / Módulos
              </th>
              {modules.map(module => (
                <th key={module.id} className="px-3 py-4 text-center text-xs font-semibold align-middle min-w-[140px]" style={{ color: '#374161', borderBottom: '2px solid #dbe2ea' }}>
                  {module.display_name}
                </th>
              ))}
              <th className="px-4 py-4 text-center text-sm font-semibold align-middle min-w-[120px]" style={{ color: '#374161', borderBottom: '2px solid #dbe2ea' }}>
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role, idx) => (
              <tr key={role.id} className="transition-colors hover:bg-opacity-50" style={{ backgroundColor: idx % 2 === 0 ? 'transparent' : '#fafbfc', borderBottom: '1px solid #eaf0f5' }}>
                <td className="px-4 py-4 align-middle">
                  <div>
                    <div className="font-semibold text-base" style={{ color: '#374161' }}>{role.name}</div>
                    {role.description && (
                      <div className="text-sm mt-1" style={{ color: '#6374AD' }}>{role.description}</div>
                    )}
                    {role.is_system_role && (
                      <span className="inline-block text-xs px-2 py-1 rounded-full mt-2" style={{ backgroundColor: '#dbe2ea', color: '#374161' }}>
                        Sistema
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
                                  const newPermission = {
                                    id: '',
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
                                style={{ accentColor: '#71b399' }}
                              />
                              <span className="text-xs whitespace-nowrap" style={{ color: '#6374AD' }}>Acesso</span>
                            </label>
                            {['Criar', 'Ler', 'Atualizar', 'Deletar'].map((label) => (
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
                            { key: 'can_access', label: 'Acesso' },
                            { key: 'can_create', label: 'Criar' },
                            { key: 'can_read', label: 'Ler' },
                            { key: 'can_update', label: 'Atualizar' },
                            { key: 'can_delete', label: 'Deletar' }
                          ].map(({ key, label }) => (
                            <label key={key} className="flex items-center gap-2 cursor-pointer h-8">
                              <input
                                type="checkbox"
                                checked={!!permission[key as keyof typeof permission]}
                                onChange={(e) => handlePermissionChange(role.id, module.id, key as keyof Permission, e.target.checked)}
                                className="w-4 h-4 rounded cursor-pointer flex-shrink-0"
                                style={{ accentColor: '#71b399' }}
                              />
                              <span className="text-xs whitespace-nowrap" style={{ color: '#6374AD' }}>{label}</span>
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
                          color: '#6374AD',
                          borderColor: '#6374AD',
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#6374AD';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#6374AD';
                        }}
                        title="Editar autorização"
                      >
                        ✏️ Editar
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
                        title="Excluir autorização"
                      >
                        {deletingRole === role.id ? '⏳ Deletando...' : '🗑️ Excluir'}
                      </button>
                    </div>
                  )}
                  {role.is_system_role && (
                    <span className="text-xs italic" style={{ color: '#879FED' }}>
                      Role do sistema
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
          <div key={role.id} className="p-4 sm:p-5 rounded-lg shadow-md bg-white" style={{ border: '1px solid #dbe2ea' }}>
            {/* Role Header com Botões de Ação no Topo */}
            <div className="mb-4 pb-4 sm:mb-4 sm:pb-4" style={{ borderBottom: '1px solid #dbe2ea' }}>
              <div className="flex items-start justify-between gap-3 sm:gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg" style={{ color: '#374161' }}>{role.name}</h3>
                  {role.description && (
                    <p className="text-xs sm:text-sm mt-1" style={{ color: '#6374AD' }}>{role.description}</p>
                  )}
                  {role.is_system_role && (
                    <span className="inline-block text-xs px-2 py-1 rounded-full mt-2" style={{ backgroundColor: '#dbe2ea', color: '#374161' }}>
                      Sistema
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
                        backgroundColor: '#6374AD',
                        borderColor: '#6374AD'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4f5d8f'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6374AD'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                      </svg>
                      Editar
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
                          Excluindo...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                          Excluir
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
                  <div key={module.id} className="p-3 sm:p-3 rounded-lg" style={{ backgroundColor: '#fafbfc', border: '1px solid #eaf0f5' }}>
                    <h4 className="font-semibold text-sm mb-3 sm:mb-3" style={{ color: '#374161' }}>{module.display_name}</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                      {!permission ? (
                        <>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={false}
                              onChange={(e) => {
                                const newPermission = {
                                  id: '',
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
                            <span className="text-xs" style={{ color: '#6374AD' }}>Acesso</span>
                          </label>
                          {['Criar', 'Ler', 'Atualizar', 'Deletar'].map((label) => (
                            <label key={label} className="flex items-center space-x-2 opacity-40">
                              <input type="checkbox" checked={false} disabled className="w-4 h-4 rounded flex-shrink-0" />
                              <span className="text-xs" style={{ color: '#aaa' }}>{label}</span>
                            </label>
                          ))}
                        </>
                      ) : (
                        <>
                          {[
                            { key: 'can_access', label: 'Acesso' },
                            { key: 'can_create', label: 'Criar' },
                            { key: 'can_read', label: 'Ler' },
                            { key: 'can_update', label: 'Atualizar' },
                            { key: 'can_delete', label: 'Deletar' }
                          ].map(({ key, label }) => (
                            <label key={key} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!permission[key as keyof typeof permission]}
                                onChange={(e) => handlePermissionChange(role.id, module.id, key as keyof Permission, e.target.checked)}
                                className="w-4 h-4 rounded flex-shrink-0"
                                style={{ accentColor: '#71b399' }}
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
          {saving ? 'Salvando...' : 'Salvar Permissões'}
        </button>
      </div>

      {/* Modal para Nova Role */}
      {showNewRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-6" style={{ color: '#374161' }}>Criar Nova Autorização</h2>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: '#374161' }}>
                Nome da Autorização *
              </label>
              <input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#71b399] transition-all"
                style={{ borderColor: '#dbe2ea' }}
                placeholder="Ex: gerente, supervisor"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: '#374161' }}>
                Descrição
              </label>
              <textarea
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: '#dbe2ea' }}
                rows={3}
                placeholder="Descrição da função desta autorização"
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
                style={{ color: '#6374AD', borderColor: '#dbe2ea' }}
              >
                Cancelar
              </button>
              <button
                onClick={createNewRole}
                className="flex-1 px-4 py-2.5 rounded-lg text-white font-semibold transition-all"
                style={{ backgroundColor: '#71b399' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5fa086'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#71b399'}
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Editar Role */}
      {showEditRoleModal && editingRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-6" style={{ color: '#374161' }}>Editar Autorização</h2>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: '#374161' }}>
                Nome da Autorização *
              </label>
              <input
                type="text"
                value={editingRole.name}
                onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: '#dbe2ea' }}
                placeholder="Ex: gerente, supervisor"
                maxLength={50}
              />
              <p className="text-xs mt-1" style={{ color: '#879FED' }}>
                Máximo 50 caracteres
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: '#374161' }}>
                Descrição
              </label>
              <textarea
                value={editingRole.description || ''}
                onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: '#dbe2ea' }}
                rows={3}
                placeholder="Descrição da função desta autorização"
                maxLength={200}
              />
              <p className="text-xs mt-1" style={{ color: '#879FED' }}>
                Máximo 200 caracteres
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEditRoleModal(false);
                  setEditingRole(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-lg border transition-all"
                style={{ color: '#6374AD', borderColor: '#dbe2ea' }}
              >
                Cancelar
              </button>
              <button
                onClick={saveRoleEdit}
                disabled={!editingRole.name.trim()}
                className="flex-1 px-4 py-2.5 rounded-lg text-white font-semibold transition-all disabled:opacity-50"
                style={{ backgroundColor: '#6374AD' }}
                onMouseEnter={(e) => !editingRole.name.trim() ? null : e.currentTarget.style.backgroundColor = '#4f5d8f'}
                onMouseLeave={(e) => !editingRole.name.trim() ? null : e.currentTarget.style.backgroundColor = '#6374AD'}
              >
                ✏️ Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
