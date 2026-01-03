'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import UserEdit from './UserEdit';
import { Search, Filter, Edit, Trash2, ChevronLeft, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');
  
  const usersPerPage = 10;

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }
      
      if (roleFilter) {
        query = query.eq('role', roleFilter);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * usersPerPage, currentPage * usersPerPage - 1);

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        return;
      }

      setUsers(data || []);
      setTotalPages(Math.ceil((count || 0) / usersPerPage));
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, roleFilter, currentPage]);

  // Debounce para searchTerm e roleFilter
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, roleFilter, fetchUsers]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, fetchUsers]);

  const handleEditUser = useCallback((user: User) => {
    setEditingUser(user);
  }, []);

  const handleBackToList = useCallback(() => {
    setEditingUser(null);
  }, []);

  const handleUserUpdated = useCallback(() => {
    fetchUsers();
    setEditingUser(null);
  }, [fetchUsers]);

  // Função para mostrar notificações temporárias
  const showTemporaryNotification = useCallback((message: string, type: 'success' | 'error') => {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `temporary-notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${type === 'success' ? '✅' : '❌'}</span>
        <span class="notification-message">${message.replace(/\n/g, '<br>')}</span>
      </div>
    `;

    // Adicionar ao DOM
    document.body.appendChild(notification);

    // Remover após 5 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      console.log('🗑️ Iniciando exclusão recursiva do usuário:', userToDelete.id);

      // Chamar API route para exclusão com privilégios de admin
      const {
        data: { session }
      } = await supabase.auth.getSession();

      const response = await fetch('/api/users/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {})
        },
        body: JSON.stringify({ userId: userToDelete.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao excluir usuário');
      }

      console.log('✅ Usuário removido com sucesso:', result.message);
      
      // 1. Fechar modal de confirmação PRIMEIRO
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      setDeleteMessage('');
      
      // 2. Atualizar lista de usuários
      await fetchUsers();
      
      // 3. Mostrar mensagem de sucesso (usando toast ou notificação mais elegante)
      // Substituir o alert por uma notificação mais elegante
      const successMessage = `Usuário "${userToDelete.name}" foi excluído com sucesso do sistema.\n\n✅ Conta removida do Auth\n✅ Perfil removido do banco\n✅ Todos os dados relacionados foram limpos`;
      
      // Criar uma notificação temporária na interface
      showTemporaryNotification(successMessage, 'success');
      
    } catch (error) {
      console.error('❌ Erro ao excluir usuário:', error);
      
      // Em caso de erro, também fechar o modal
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      setDeleteMessage('');
      
      const errorMessage = `Erro ao excluir usuário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
      showTemporaryNotification(errorMessage, 'error');
      
    } finally {
      setIsDeleting(false);
    }
  }, [userToDelete, fetchUsers, showTemporaryNotification]);


  // Função para cancelar exclusão com animação
  const cancelDelete = useCallback(() => {
    // Adicionar classe de animação de saída
    const modal = document.querySelector('.delete-confirm-modal');
    if (modal) {
      modal.classList.add('closing');
      
      // Aguardar animação terminar antes de fechar
      setTimeout(() => {
        setShowDeleteConfirm(false);
        setUserToDelete(null);
        setDeleteMessage('');
      }, 200);
    } else {
      // Fallback se não encontrar o modal
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      setDeleteMessage('');
    }
  }, []);

  // Verificar se o usuário atual não está sendo excluído
  const canDeleteUser = useCallback((user: User) => {
    // 1. Verificar se o usuário atual existe
    if (!currentUser) {
      return false;
    }

    // 2. Verificar se não está tentando excluir a si mesmo
    if (currentUser.id === user.id) {
      return false;
    }

    // 3. Verificar se o usuário atual é administrador
    if (currentUser.role === 'administrador') {
      return true;
    }

    // 4. Verificar se o usuário atual é funcionário (pode excluir apenas clientes)
    if (currentUser.role === 'funcionario' && user.role === 'cliente') {
      return true;
    }

    // Por padrão, não permitir exclusão
    return false;
  }, [currentUser]);

  // Função melhorada para lidar com exclusão
  const handleDeleteUser = useCallback((user: User) => {
    // Verificar se pode excluir o usuário
    if (!canDeleteUser(user)) {
      let errorMessage = 'Você não tem permissão para excluir este usuário.';
      
      if (currentUser?.id === user.id) {
        errorMessage = 'Você não pode excluir sua própria conta.';
      } else if (currentUser?.role === 'funcionario' && user.role !== 'cliente') {
        errorMessage = 'Funcionários só podem excluir contas de clientes.';
      } else if (currentUser?.role === 'cliente') {
        errorMessage = 'Clientes não têm permissão para excluir usuários.';
      }
      
      showTemporaryNotification(errorMessage, 'error');
      return;
    }

    setUserToDelete(user);
    setShowDeleteConfirm(true);
    setDeleteMessage(`Tem certeza que deseja excluir o usuário "${user.name}" (${user.email})?\n\n⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL e removerá:\n• Conta do usuário\n• Todos os dados associados\n• Histórico de atividades\n• Configurações personalizadas\n\nEsta operação não pode ser desfeita.`);
  }, [canDeleteUser, currentUser, showTemporaryNotification]);

  const getRoleLabel = useCallback((role: string | null) => {
    const labels = {
      cliente: 'Cliente',
      funcionario: 'Funcionário',
      tecnico: 'Técnico',
      administrador: 'Administrador',
      vendas: 'Vendas',
      secretaria: 'Secretaria',
      'help-desk': 'Help-Desk',
      financeiro: 'Financeiro'
    };
    return role ? labels[role as keyof typeof labels] || role : '';
  }, []);

  const getRoleBadgeStyle = useCallback((role: string | null) => {
    const roleStyles = {
      cliente: { bg: '#6374AD', text: '#ffffff' },
      funcionario: { bg: '#879FED', text: '#ffffff' },
      tecnico: { bg: '#71b399', text: '#ffffff' },
      administrador: { bg: '#374161', text: '#ffffff' },
      vendas: { bg: '#562632', text: '#ffffff' },
      secretaria: { bg: '#856968', text: '#ffffff' },
      'help-desk': { bg: '#293047', text: '#ffffff' },
      financeiro: { bg: '#3F4A6E', text: '#ffffff' }
    };
    
    const style = role ? roleStyles[role as keyof typeof roleStyles] : { bg: '#dbe2ea', text: '#374161' };
    
    return {
      backgroundColor: style?.bg || '#dbe2ea',
      color: style?.text || '#374161'
    };
  }, []);

  const currentUsers = useMemo(() => {
    return users.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);
  }, [users, currentPage]);

  const paginationStats = useMemo(() => {
    const start = (currentPage - 1) * usersPerPage + 1;
    const end = Math.min(currentPage * usersPerPage, users.length);
    return { start, end, total: users.length };
  }, [currentPage, users]);

  if (editingUser) {
    return (
      <UserEdit
        user={editingUser}
        onBack={handleBackToList}
        onUserUpdated={handleUserUpdated}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
      {/* Search and Filter Controls */}
      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-6" style={{ borderColor: '#dbe2ea', borderWidth: '1px' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#6374AD' }} />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 text-sm sm:text-base"
              style={{ 
                borderColor: '#dbe2ea',
                color: '#374161',
                backgroundColor: '#ffffff'
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

          {/* Role Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: '#6374AD' }} />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 text-sm sm:text-base appearance-none cursor-pointer"
              style={{ 
                borderColor: '#dbe2ea',
                color: '#374161',
                backgroundColor: '#ffffff'
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
              <option value="">Todas as funções</option>
              <option value="cliente">Cliente</option>
              <option value="funcionario">Funcionário</option>
              <option value="tecnico">Técnico</option>
              <option value="administrador">Administrador</option>
              <option value="vendas">Vendas</option>
              <option value="secretaria">Secretaria</option>
              <option value="help-desk">Help-Desk</option>
              <option value="financeiro">Financeiro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center" style={{ borderColor: '#dbe2ea', borderWidth: '1px' }}>
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" style={{ color: '#71b399' }} />
          <p className="text-base sm:text-lg" style={{ color: '#6374AD' }}>Carregando usuários...</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-2xl shadow-sm overflow-hidden" style={{ borderColor: '#dbe2ea', borderWidth: '1px' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: '#eaf0f5' }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#374161' }}>
                      Nome
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#374161' }}>
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#374161' }}>
                      Função
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#374161' }}>
                      Data de Criação
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider" style={{ color: '#374161' }}>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#dbe2ea' }}>
                  {currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-opacity-50 transition-colors duration-150" style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eaf0f5'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium" style={{ color: '#374161' }}>{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm" style={{ color: '#6374AD' }}>{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={getRoleBadgeStyle(user.role)}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm" style={{ color: '#6374AD' }}>
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                            style={{ backgroundColor: '#71b399', color: 'white' }}
                            title="Editar usuário"
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5fa385'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#71b399'}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            disabled={!canDeleteUser(user)}
                            className={`p-2 rounded-lg transition-all duration-200 ${canDeleteUser(user) ? 'hover:scale-110' : 'opacity-40 cursor-not-allowed'}`}
                            style={{ 
                              backgroundColor: canDeleteUser(user) ? '#dc2626' : '#e5e7eb',
                              color: 'white'
                            }}
                            title={canDeleteUser(user) ? "Excluir usuário" : "Sem permissão para excluir"}
                            onMouseEnter={(e) => {
                              if (canDeleteUser(user)) {
                                e.currentTarget.style.backgroundColor = '#b91c1c';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (canDeleteUser(user)) {
                                e.currentTarget.style.backgroundColor = '#dc2626';
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden space-y-4">
            {currentUsers.map((user) => (
              <div 
                key={user.id} 
                className="bg-white rounded-2xl shadow-sm p-4 sm:p-6" 
                style={{ borderColor: '#dbe2ea', borderWidth: '1px' }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold mb-1" style={{ color: '#374161' }}>
                        {user.name}
                      </h3>
                      <p className="text-sm" style={{ color: '#6374AD' }}>{user.email}</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={getRoleBadgeStyle(user.role)}>
                        {getRoleLabel(user.role)}
                      </span>
                      <span className="text-xs" style={{ color: '#6374AD' }}>
                        Criado em: {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '-'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 sm:flex-col">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 text-sm font-medium"
                      style={{ backgroundColor: '#71b399', color: 'white' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5fa385'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#71b399'}
                    >
                      <Edit className="w-4 h-4 inline mr-1" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      disabled={!canDeleteUser(user)}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${canDeleteUser(user) ? 'hover:scale-105' : 'opacity-40 cursor-not-allowed'}`}
                      style={{ 
                        backgroundColor: canDeleteUser(user) ? '#dc2626' : '#e5e7eb',
                        color: 'white'
                      }}
                      onMouseEnter={(e) => {
                        if (canDeleteUser(user)) {
                          e.currentTarget.style.backgroundColor = '#b91c1c';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (canDeleteUser(user)) {
                          e.currentTarget.style.backgroundColor = '#dc2626';
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 inline mr-1" />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {currentUsers.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center" style={{ borderColor: '#dbe2ea', borderWidth: '1px' }}>
              <Filter className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: '#6374AD' }} />
              <p className="text-base sm:text-lg font-medium mb-2" style={{ color: '#374161' }}>
                Nenhum usuário encontrado
              </p>
              <p className="text-sm" style={{ color: '#6374AD' }}>
                Tente ajustar os filtros de busca
              </p>
            </div>
          )}

          {/* Pagination Info */}
          {currentUsers.length > 0 && (
            <div className="mt-6 text-center">
              <p className="text-sm" style={{ color: '#6374AD' }}>
                Mostrando <span className="font-semibold" style={{ color: '#374161' }}>{paginationStats.start}</span> a{' '}
                <span className="font-semibold" style={{ color: '#374161' }}>{paginationStats.end}</span> de{' '}
                <span className="font-semibold" style={{ color: '#374161' }}>{paginationStats.total}</span> usuários
              </p>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 font-medium text-sm ${
                  currentPage === 1 
                    ? 'opacity-40 cursor-not-allowed' 
                    : 'hover:scale-105'
                }`}
                style={{ 
                  backgroundColor: currentPage === 1 ? '#e5e7eb' : '#6374AD',
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 1) {
                    e.currentTarget.style.backgroundColor = '#4f5d8f';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 1) {
                    e.currentTarget.style.backgroundColor = '#6374AD';
                  }
                }}
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
              
              <span className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor: '#eaf0f5', color: '#374161' }}>
                Página {currentPage} de {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 font-medium text-sm ${
                  currentPage === totalPages 
                    ? 'opacity-40 cursor-not-allowed' 
                    : 'hover:scale-105'
                }`}
                style={{ 
                  backgroundColor: currentPage === totalPages ? '#e5e7eb' : '#6374AD',
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== totalPages) {
                    e.currentTarget.style.backgroundColor = '#4f5d8f';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== totalPages) {
                    e.currentTarget.style.backgroundColor = '#6374AD';
                  }
                }}
              >
                Próxima
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={cancelDelete}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
            style={{ borderColor: '#dbe2ea', borderWidth: '1px' }}
          >
            {/* Modal Header */}
            <div className="p-6 border-b" style={{ backgroundColor: '#eaf0f5', borderColor: '#dbe2ea' }}>
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6" style={{ color: '#dc2626' }} />
                <h3 className="text-xl font-bold" style={{ color: '#374161' }}>
                  Confirmar Exclusão
                </h3>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#6374AD' }}>
                {deleteMessage}
              </div>
            </div>
            
            {/* Modal Actions */}
            <div className="p-6 border-t flex flex-col-reverse sm:flex-row gap-3 sm:justify-end" style={{ backgroundColor: '#eaf0f5', borderColor: '#dbe2ea' }}>
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 font-medium text-sm"
                style={{ 
                  backgroundColor: '#ffffff',
                  color: '#374161',
                  borderColor: '#dbe2ea',
                  borderWidth: '2px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eaf0f5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 font-medium text-sm flex items-center justify-center gap-2"
                style={{ 
                  backgroundColor: '#dc2626',
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  if (!isDeleting) {
                    e.currentTarget.style.backgroundColor = '#b91c1c';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isDeleting) {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                  }
                }}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  'Sim, Excluir Usuário'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
