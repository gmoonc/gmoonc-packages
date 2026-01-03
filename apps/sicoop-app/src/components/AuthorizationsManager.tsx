'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Check, X, Users, Shield, User, AlertCircle, Loader2 } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
  is_system_role: boolean | null;
}

export default function AuthorizationsManager() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<{[key: string]: string}>({});

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

      // Carregar usuários
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('name');

      if (usersError) throw usersError;

      // Carregar autorizações
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (rolesError) throw rolesError;

      setUsers(usersData || []);
      setRoles(rolesData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar autorização do usuário
  const updateUserAuthorization = async (userId: string, newRole: string) => {
    try {
      setUpdatingUser(userId);
      setError(null);

      console.log('Tentando atualizar usuário:', userId, 'para autorização:', newRole);

      // Verificar se a autorização existe
      const roleExists = roles.find(r => r.name === newRole);
      if (!roleExists) {
        throw new Error(`Autorização '${newRole}' não encontrada`);
      }

      // Atualizar usando o ID correto do usuário
      const params: Database['public']['Functions']['update_profile_role']['Args'] = {
        user_id: userId,
        new_role: newRole
      };

      const { error } = await supabase.rpc('update_profile_role', params as never);

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      // Atualizar estado local
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: newRole, updated_at: new Date().toISOString() } : u
      ));

      // Limpar mudança pendente
      setPendingChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[userId];
        return newChanges;
      });

      setSuccess('Autorização atualizada com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Erro ao atualizar autorização:', error);
      setError(`Erro ao atualizar autorização: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setUpdatingUser(null);
    }
  };

  // Função para lidar com mudanças pendentes
  const handleRoleChange = (userId: string, newRole: string) => {
    setPendingChanges(prev => ({
      ...prev,
      [userId]: newRole
    }));
  };

  // Função para confirmar mudança
  const confirmRoleChange = (userId: string) => {
    const newRole = pendingChanges[userId];
    if (newRole) {
      updateUserAuthorization(userId, newRole);
    }
  };

  // Função para cancelar mudança pendente
  const cancelRoleChange = (userId: string) => {
    setPendingChanges(prev => {
      const newChanges = { ...prev };
      delete newChanges[userId];
      return newChanges;
    });
  };

  // Função para gerar avatar usando UI Avatars (mais confiável)
  const getAvatarUrl = (userName: string | null, userEmail: string) => {
    const name = userName || userEmail.split('@')[0];
    const encodedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encodedName}&background=3B82F6&color=fff&size=80&bold=true&font-size=0.4`;
  };

  // Filtrar usuários baseado no termo de busca
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#6374AD' }} />
        <span className="ml-3 text-lg" style={{ color: '#374161' }}>Carregando...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Description */}
      <div className="mb-6">
        <p className="text-sm sm:text-base" style={{ color: '#6374AD' }}>
          Gerencie os papéis (autorizações) dos usuários do sistema. Autorizações do sistema são fundamentais e não podem ser deletadas.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-lg border flex items-start gap-3" style={{ 
          backgroundColor: 'rgba(239, 68, 68, 0.1)', 
          borderColor: '#ef4444',
          color: '#991b1b' 
        }}>
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 rounded-lg border flex items-start gap-3" style={{ 
          backgroundColor: 'rgba(113, 179, 153, 0.1)', 
          borderColor: '#71b399',
          color: '#374161' 
        }}>
          <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#879FED' }} />
          <input
            type="text"
            placeholder="Buscar usuários por nome, email ou autorização..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 pl-9 sm:pl-11 rounded-lg border transition-all focus:outline-none focus:ring-2 text-sm sm:text-base"
            style={{ 
              borderColor: '#dbe2ea',
              backgroundColor: '#ffffff',
              color: '#374161'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#71b399';
              e.target.style.boxShadow = '0 0 0 3px rgba(113, 179, 153, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#dbe2ea';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        <p className="text-xs sm:text-sm mt-2" style={{ color: '#879FED' }}>
          {filteredUsers.length} de {users.length} usuários encontrados
        </p>
      </div>

      {/* Desktop Table View (1024px+) */}
      <div className="hidden lg:block overflow-x-auto rounded-lg border shadow-sm" style={{ 
        borderColor: '#dbe2ea',
        backgroundColor: '#ffffff'
      }}>
        <table className="min-w-full">
          <thead style={{ backgroundColor: '#eaf0f5' }}>
            <tr>
              <th className="px-3 lg:px-4 py-3 text-left text-xs font-semibold" style={{ color: '#374161', borderBottom: '2px solid #dbe2ea' }}>
                Usuário
              </th>
              <th className="px-3 lg:px-4 py-3 text-left text-xs font-semibold" style={{ color: '#374161', borderBottom: '2px solid #dbe2ea' }}>
                Email
              </th>
              <th className="px-3 lg:px-4 py-3 text-left text-xs font-semibold" style={{ color: '#374161', borderBottom: '2px solid #dbe2ea' }}>
                Autorização Atual
              </th>
              <th className="px-3 lg:px-4 py-3 text-center text-xs font-semibold" style={{ color: '#374161', borderBottom: '2px solid #dbe2ea' }}>
                Nova Autorização
              </th>
              <th className="px-3 lg:px-4 py-3 text-center text-xs font-semibold" style={{ color: '#374161', borderBottom: '2px solid #dbe2ea' }}>
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => {
              const hasPendingChange = pendingChanges[user.id];
              const currentRole = hasPendingChange || user.role;
              
              return (
                <tr 
                  key={user.id} 
                  className="transition-colors hover:bg-opacity-50"
                  style={{ 
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc',
                    borderBottom: '1px solid #dbe2ea'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#fafbfc'}
                >
                  <td className="px-3 lg:px-4 py-3">
                    <div className="flex items-center gap-2 lg:gap-3">
                      <div className="flex-shrink-0 h-9 w-9 lg:h-10 lg:w-10">
                        <img
                          src={getAvatarUrl(user.name, user.email)}
                          alt={user.name || user.email}
                          className="h-9 w-9 lg:h-10 lg:w-10 rounded-full object-cover border-2"
                          style={{ borderColor: '#dbe2ea' }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate" style={{ color: '#374161' }}>
                          {user.name || 'Sem nome'}
                        </div>
                        <div className="text-xs truncate" style={{ color: '#879FED' }}>
                          ID: {user.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 lg:px-4 py-3">
                    <div className="text-sm" style={{ color: '#374161' }}>{user.email}</div>
                    <div className="text-xs" style={{ color: '#879FED' }}>
                      Criado: {new Date(user.created_at || '').toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-3 lg:px-4 py-3">
                    <span 
                      className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full" 
                      style={{
                        backgroundColor: user.role === 'administrador' ? 'rgba(239, 68, 68, 0.15)' :
                                       user.role === 'cliente' ? 'rgba(99, 116, 173, 0.15)' :
                                       user.role === 'funcionario' ? 'rgba(113, 179, 153, 0.15)' :
                                       user.role === 'técnico' ? 'rgba(135, 159, 237, 0.15)' : 'rgba(219, 226, 234, 0.5)',
                        color: user.role === 'administrador' ? '#991b1b' :
                              user.role === 'cliente' ? '#374161' :
                              user.role === 'funcionario' ? '#065f46' :
                              user.role === 'técnico' ? '#3F4A6E' : '#6374AD'
                      }}
                    >
                      {user.role || 'N/A'}
                    </span>
                  </td>
                  <td className="px-3 lg:px-4 py-3">
                    <select
                      value={currentRole || ''}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={updatingUser === user.id}
                      className="w-full px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg border transition-all focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs lg:text-sm"
                      style={{ 
                        borderColor: '#dbe2ea',
                        backgroundColor: '#ffffff',
                        color: '#374161'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#71b399';
                        e.target.style.boxShadow = '0 0 0 3px rgba(113, 179, 153, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#dbe2ea';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      {roles.map(role => (
                        <option key={role.id} value={role.name}>
                          {role.name} {role.is_system_role ? '(Sistema)' : ''}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 lg:px-4 py-3">
                    {updatingUser === user.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#879FED' }} />
                        <span className="text-xs hidden lg:inline" style={{ color: '#879FED' }}>Atualizando...</span>
                      </div>
                    ) : hasPendingChange ? (
                      <div className="flex items-center justify-center gap-1.5 lg:gap-2">
                        <button
                          onClick={() => confirmRoleChange(user.id)}
                          className="px-2 lg:px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
                          style={{ backgroundColor: '#71b399', color: '#ffffff' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5fa086'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#71b399'}
                          title="Confirmar mudança de autorização"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span className="hidden lg:inline">Confirmar</span>
                        </button>
                        <button
                          onClick={() => cancelRoleChange(user.id)}
                          className="px-2 lg:px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
                          style={{ backgroundColor: '#6374AD', color: '#ffffff' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374161'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6374AD'}
                          title="Cancelar mudança"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span className="hidden lg:inline">Cancelar</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-center block" style={{ color: '#879FED' }}>Sem mudanças</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile & Tablet Portrait Card View (0-1023px) */}
      <div className="lg:hidden space-y-4">
        {filteredUsers.map(user => {
          const hasPendingChange = pendingChanges[user.id];
          const currentRole = hasPendingChange || user.role;
          
          return (
            <div 
              key={user.id} 
              className="rounded-lg border p-4 shadow-sm"
              style={{ 
                backgroundColor: '#ffffff',
                borderColor: '#dbe2ea'
              }}
            >
              {/* User Info */}
              <div className="flex items-start gap-3 mb-3">
                <img
                  src={getAvatarUrl(user.name, user.email)}
                  alt={user.name || user.email}
                  className="h-11 w-11 rounded-full object-cover border-2 flex-shrink-0"
                  style={{ borderColor: '#dbe2ea' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color: '#374161' }}>
                    {user.name || 'Sem nome'}
                  </div>
                  <div className="text-xs truncate" style={{ color: '#6374AD' }}>
                    {user.email}
                  </div>
                  <div className="text-xs mt-1" style={{ color: '#879FED' }}>
                    Criado: {new Date(user.created_at || '').toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>

              {/* Current Role Badge */}
              <div className="mb-3 pb-3 border-b" style={{ borderColor: '#eaf0f5' }}>
                <label className="text-xs font-medium block mb-2" style={{ color: '#879FED' }}>
                  Autorização Atual
                </label>
                <span 
                  className="inline-flex px-3 py-1 text-xs font-semibold rounded-full" 
                  style={{
                    backgroundColor: user.role === 'administrador' ? 'rgba(239, 68, 68, 0.15)' :
                                   user.role === 'cliente' ? 'rgba(99, 116, 173, 0.15)' :
                                   user.role === 'funcionario' ? 'rgba(113, 179, 153, 0.15)' :
                                   user.role === 'técnico' ? 'rgba(135, 159, 237, 0.15)' : 'rgba(219, 226, 234, 0.5)',
                    color: user.role === 'administrador' ? '#991b1b' :
                          user.role === 'cliente' ? '#374161' :
                          user.role === 'funcionario' ? '#065f46' :
                          user.role === 'técnico' ? '#3F4A6E' : '#6374AD'
                  }}
                >
                  {user.role || 'N/A'}
                </span>
              </div>

              {/* New Role Select */}
              <div className="mb-3">
                <label className="text-xs font-medium block mb-2" style={{ color: '#879FED' }}>
                  Nova Autorização
                </label>
                <select
                  value={currentRole || ''}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={updatingUser === user.id}
                  className="w-full px-3 py-2.5 rounded-lg border transition-all focus:outline-none focus:ring-2 disabled:opacity-50 text-sm"
                  style={{ 
                    borderColor: '#dbe2ea',
                    backgroundColor: '#ffffff',
                    color: '#374161'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#71b399';
                    e.target.style.boxShadow = '0 0 0 3px rgba(113, 179, 153, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#dbe2ea';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.name}>
                      {role.name} {role.is_system_role ? '(Sistema)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t" style={{ borderColor: '#eaf0f5' }}>
                {updatingUser === user.id ? (
                  <div className="flex items-center justify-center gap-2 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#879FED' }} />
                    <span className="text-sm" style={{ color: '#879FED' }}>Atualizando...</span>
                  </div>
                ) : hasPendingChange ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirmRoleChange(user.id)}
                      className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                      style={{ backgroundColor: '#71b399', color: '#ffffff' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5fa086'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#71b399'}
                    >
                      <Check className="h-4 w-4" />
                      Confirmar
                    </button>
                    <button
                      onClick={() => cancelRoleChange(user.id)}
                      className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                      style={{ backgroundColor: '#6374AD', color: '#ffffff' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374161'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6374AD'}
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-center py-2" style={{ color: '#879FED' }}>
                    Sem mudanças pendentes
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Statistics Cards */}
      <div className="mt-6 sm:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-lg border transition-all hover:shadow-md" style={{ 
          backgroundColor: 'rgba(234, 240, 245, 0.5)',
          borderColor: '#dbe2ea'
        }}>
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#6374AD' }} />
            <div className="text-xs font-medium" style={{ color: '#6374AD' }}>Total de Usuários</div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold" style={{ color: '#374161' }}>
            {users.length}
          </div>
        </div>
        
        <div className="p-4 rounded-lg border transition-all hover:shadow-md" style={{ 
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239, 68, 68, 0.2)'
        }}>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#991b1b' }} />
            <div className="text-xs font-medium" style={{ color: '#991b1b' }}>Administradores</div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold" style={{ color: '#7f1d1d' }}>
            {users.filter(u => u.role === 'administrador').length}
          </div>
        </div>
        
        <div className="p-4 rounded-lg border transition-all hover:shadow-md" style={{ 
          backgroundColor: 'rgba(99, 116, 173, 0.1)',
          borderColor: 'rgba(99, 116, 173, 0.2)'
        }}>
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#374161' }} />
            <div className="text-xs font-medium" style={{ color: '#374161' }}>Clientes</div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold" style={{ color: '#293047' }}>
            {users.filter(u => u.role === 'cliente').length}
          </div>
        </div>
        
        <div className="p-4 rounded-lg border transition-all hover:shadow-md" style={{ 
          backgroundColor: 'rgba(113, 179, 153, 0.1)',
          borderColor: 'rgba(113, 179, 153, 0.2)'
        }}>
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#065f46' }} />
            <div className="text-xs font-medium" style={{ color: '#065f46' }}>Outras Autorizações</div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold" style={{ color: '#064e3b' }}>
            {users.filter(u => !['administrador', 'cliente'].includes(u.role || '')).length}
          </div>
        </div>
      </div>

      {/* Information Panel */}
      <div className="mt-6 sm:mt-8 p-4 sm:p-5 rounded-lg border" style={{ 
        backgroundColor: 'rgba(234, 240, 245, 0.5)',
        borderColor: '#dbe2ea'
      }}>
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#6374AD' }} />
          <h3 className="text-base sm:text-lg font-semibold" style={{ color: '#374161' }}>
            Sobre o Sistema de Autorizações
          </h3>
        </div>
        <div className="text-xs sm:text-sm space-y-2.5" style={{ color: '#3F4A6E' }}>
          <p>
            <strong style={{ color: '#374161' }}>Autorizações do Sistema:</strong> Não podem ser deletadas (administrador, cliente)
          </p>
          <p>
            <strong style={{ color: '#374161' }}>Autorizações Customizadas:</strong> Podem ser criadas, editadas e deletadas livremente
          </p>
          <p>
            <strong style={{ color: '#374161' }}>Sincronização Automática:</strong> Mudanças em autorizações são refletidas automaticamente
          </p>
          <p>
            <strong style={{ color: '#374161' }}>Segurança:</strong> Usuários com autorizações deletadas são automaticamente convertidos para 'cliente'
          </p>
          <p>
            <strong style={{ color: '#374161' }}>Autorização Padrão:</strong> Todos os novos usuários são criados automaticamente como 'cliente'
          </p>
        </div>
      </div>
    </div>
  );
}
