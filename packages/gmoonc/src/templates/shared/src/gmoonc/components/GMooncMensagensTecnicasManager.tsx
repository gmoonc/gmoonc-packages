import React, { useState, useCallback } from 'react';
import { useGMooncMensagensTecnicas } from '../hooks/useGMooncMensagensTecnicas';
import { useGMooncPermissions } from '../hooks/useGMooncPermissions';
import { Mensagem, STATUS_OPTIONS, STATUS_COLORS } from '../types/mensagens';

export function GMooncMensagensTecnicasManager() {
  const { hasPermission } = useGMooncPermissions();
  const {
    mensagens,
    users,
    loading,
    error,
    assignMensagem,
    updateMensagemStatus,
    deleteMensagem,
    updateMensagem,
    createMensagem
  } = useGMooncMensagensTecnicas();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [mensagemToDelete, setMensagemToDelete] = useState<Mensagem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMensagem, setEditingMensagem] = useState<Mensagem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [assigningMensagem, setAssigningMensagem] = useState<string | null>(null);

  const [newMensagem, setNewMensagem] = useState({
    nome: '',
    email: '',
    telefone: '',
    company: '',
    mensagem: ''
  });

  const hasTecnicoAccess = hasPermission({
    moduleName: 'technical',
    permissionType: 'read'
  });

  const handleDeleteMensagem = useCallback((mensagem: Mensagem) => {
    setMensagemToDelete(mensagem);
    setShowDeleteConfirm(true);
  }, []);

  const handleEditMensagem = useCallback((mensagem: Mensagem) => {
    setEditingMensagem(mensagem);
    setShowEditModal(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
    setEditingMensagem(null);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (editingMensagem) {
      try {
        const updatedData = {
          nome: editingMensagem.nome,
          email: editingMensagem.email,
          telefone: editingMensagem.telefone || '',
          company: editingMensagem.company,
          mensagem: editingMensagem.mensagem,
          status: editingMensagem.status
        };

        const success = await updateMensagem(editingMensagem.id, updatedData);
        if (success) {
          setShowEditModal(false);
          setEditingMensagem(null);
        }
      } catch (error) {
        console.error('Error updating message:', error);
      }
    }
  }, [editingMensagem, updateMensagem]);

  const confirmDelete = useCallback(async () => {
    if (mensagemToDelete) {
      const success = await deleteMensagem(mensagemToDelete.id);
      if (success) {
        setShowDeleteConfirm(false);
        setMensagemToDelete(null);
      }
    }
  }, [mensagemToDelete, deleteMensagem]);

  const handleAssignUser = useCallback(async (mensagemId: string, userId: string) => {
    setAssigningMensagem(mensagemId);
    try {
      await assignMensagem(mensagemId, userId === 'unassigned' ? null : userId);
    } finally {
      setAssigningMensagem(null);
    }
  }, [assignMensagem]);

  const handleStatusChange = useCallback(async (mensagemId: string, status: string) => {
    await updateMensagemStatus(mensagemId, status);
  }, [updateMensagemStatus]);

  const handleCreateMensagem = useCallback(async () => {
    if (loading) return;

    try {
      if (!newMensagem.nome.trim()) {
        alert('Name is required');
        return;
      }

      if (!newMensagem.email.trim()) {
        alert('Email is required');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newMensagem.email.trim())) {
        alert('Invalid email');
        return;
      }

      if (!newMensagem.company.trim()) {
        alert('Company is required');
        return;
      }

      if (!newMensagem.mensagem.trim()) {
        alert('Message is required');
        return;
      }

      const mensagemData = {
        ...newMensagem,
        nome: newMensagem.nome.trim(),
        email: newMensagem.email.trim(),
        telefone: newMensagem.telefone.trim() || null,
        company: newMensagem.company.trim(),
        mensagem: newMensagem.mensagem.trim(),
        user_id: null,
        status: 'pendente'
      };

      const success = await createMensagem(mensagemData);

      if (success) {
        setShowCreateModal(false);
        setNewMensagem({
          nome: '',
          email: '',
          telefone: '',
          company: '',
          mensagem: ''
        });
      }
    } catch (error) {
      console.error('Error creating message:', error);
    }
  }, [newMensagem, createMensagem, loading]);

  const handleCloseCreateModal = useCallback(() => {
    setShowCreateModal(false);
    setNewMensagem({
      nome: '',
      email: '',
      telefone: '',
      company: '',
      mensagem: ''
    });
  }, []);

  const filteredMensagens = mensagens.filter(mensagem => {
    const matchesSearch = mensagem.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mensagem.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mensagem.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || mensagem.status === statusFilter;

    const matchesUser = !userFilter ||
      (userFilter === 'unassigned' && !mensagem.user_id) ||
      (userFilter !== 'unassigned' && mensagem.user_id === userFilter);

    return matchesSearch && matchesStatus && matchesUser;
  });

  const getUserName = useCallback((userId: string | null) => {
    if (!userId) return 'Unassigned';
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'User not found';
  }, [users]);

  const getUserEmail = useCallback((userId: string | null) => {
    if (!userId) return '';
    const user = users.find(u => u.id === userId);
    return user ? user.email : '';
  }, [users]);

  if (!hasTecnicoAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md text-center">
          <div className="text-red-600 text-6xl mb-4">🚫</div>
          <h1 className="text-xl font-bold text-red-800 mb-2">Access Denied</h1>
          <p className="text-red-600">
            You do not have permission to access the technical module.
          </p>
          <p className="text-red-500 text-sm mt-2">
            Contact the administrator to request access.
          </p>
        </div>
      </div>
    );
  }

  if (loading && mensagens.length === 0 && users.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-red-800">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header com Estatísticas */}
      <div className="bg-gradient-to-r from-[#374161] to-[#6374AD] text-white p-4 md:p-6 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <p className="text-[#dbe2ea] text-sm md:text-base lg:text-lg">
              Control message distribution among system users
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="bg-[#6374AD] px-3 py-1 rounded-lg text-xs md:text-sm font-medium">
                📊 Total: {mensagens.length}
              </span>
              <span className="bg-[#71B399] px-3 py-1 rounded-lg text-xs md:text-sm font-medium">
                👥 Users: {users.length}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl md:text-4xl">🔧</div>
            <div className="text-[#dbe2ea] text-xs md:text-sm">Technical Version</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-[#dbe2ea]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h3 className="text-base md:text-lg font-semibold text-[#374161]">Filters and Actions</h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto px-4 py-2 bg-[#71B399] text-white rounded-lg hover:bg-[#5fa085] transition-colors font-medium flex items-center justify-center space-x-2 text-sm md:text-base"
            disabled={loading}
          >
            <span>➕</span>
            <span>New Message</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div>
            <label className="block text-xs md:text-sm font-medium text-[#374161] mb-1">Search</label>
            <input
              type="text"
              placeholder="Name, email or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#dbe2ea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6374AD] text-[#374161] placeholder-gray-400 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs md:text-sm font-medium text-[#374161] mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#dbe2ea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6374AD] text-[#374161] bg-white"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.slice(1).map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs md:text-sm font-medium text-[#374161] mb-1">Current User</label>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#dbe2ea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6374AD] text-[#374161] bg-white"
              disabled={loading}
            >
              <option value="">All Users</option>
              <option value="unassigned">Unassigned</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setUserFilter('');
              }}
              className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 sm:p-4 rounded-lg shadow-sm" style={{
          backgroundColor: 'rgba(255, 152, 0, 0.08)',
          borderColor: 'rgba(255, 152, 0, 0.25)',
          borderWidth: '1px'
        }}>
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <span className="text-base sm:text-lg">📋</span>
            <div className="text-xs font-medium" style={{ color: '#856968' }}>Unassigned</div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: '#FF9800' }}>
            {mensagens.filter(m => !m.user_id).length}
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-lg shadow-sm" style={{
          backgroundColor: 'rgba(255, 235, 59, 0.12)',
          borderColor: 'rgba(255, 235, 59, 0.3)',
          borderWidth: '1px'
        }}>
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <span className="text-base sm:text-lg">🔍</span>
            <div className="text-xs font-medium" style={{ color: '#856968' }}>In Analysis</div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: '#F9A825' }}>
            {mensagens.filter(m => m.status === 'em_analise').length}
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-lg shadow-sm" style={{
          backgroundColor: 'rgba(113, 179, 153, 0.12)',
          borderColor: 'rgba(113, 179, 153, 0.3)',
          borderWidth: '1px'
        }}>
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <span className="text-base sm:text-lg">✅</span>
            <div className="text-xs font-medium" style={{ color: '#856968' }}>Completed</div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: '#71b399' }}>
            {mensagens.filter(m => m.status === 'concluida').length}
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-lg shadow-sm" style={{
          backgroundColor: 'rgba(99, 116, 173, 0.12)',
          borderColor: 'rgba(99, 116, 173, 0.3)',
          borderWidth: '1px'
        }}>
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <span className="text-base sm:text-lg">📨</span>
            <div className="text-xs font-medium" style={{ color: '#856968' }}>Pending</div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: '#6374AD' }}>
            {mensagens.filter(m => m.status === 'pendente').length}
          </div>
        </div>
      </div>

      {/* Layout Desktop/Tablet Landscape - Tabela (1024px+) */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-[#dbe2ea] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#dbe2ea]">
            <thead className="bg-[#f8f9fb]">
              <tr>
                <th className="px-3 xl:px-4 py-3 text-left text-xs xl:text-sm font-semibold text-[#374161] uppercase tracking-wider">
                  Client
                </th>
                <th className="px-3 xl:px-4 py-3 text-left text-xs xl:text-sm font-semibold text-[#374161] uppercase tracking-wider">
                  Company
                </th>
                <th className="px-3 xl:px-4 py-3 text-left text-xs xl:text-sm font-semibold text-[#374161] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 xl:px-4 py-3 text-left text-xs xl:text-sm font-semibold text-[#374161] uppercase tracking-wider">
                  Current User
                </th>
                <th className="px-3 xl:px-4 py-3 text-left text-xs xl:text-sm font-semibold text-[#374161] uppercase tracking-wider">
                  Reassign To
                </th>
                <th className="px-3 xl:px-4 py-3 text-left text-xs xl:text-sm font-semibold text-[#374161] uppercase tracking-wider">
                  Date
                </th>
                <th className="px-3 xl:px-4 py-3 text-left text-xs xl:text-sm font-semibold text-[#374161] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#dbe2ea]">
              {filteredMensagens.map((mensagem) => (
                <tr key={mensagem.id} className="hover:bg-[#f8f9fb] transition-colors">
                  <td className="px-3 xl:px-4 py-3">
                    <div>
                      <div className="text-xs xl:text-sm font-semibold text-[#374161]">{mensagem.nome}</div>
                      <div className="text-xs text-[#6374AD]">{mensagem.email}</div>
                      {mensagem.telefone && (
                        <div className="text-xs text-[#6374AD]">{mensagem.telefone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 xl:px-4 py-3">
                    <div className="text-xs xl:text-sm font-medium text-[#374161]">{mensagem.company}</div>
                  </td>
                  <td className="px-3 xl:px-4 py-3">
                    <select
                      value={mensagem.status ?? ''}
                      onChange={(e) => handleStatusChange(mensagem.id, e.target.value)}
                      className={`w-full px-2.5 py-1.5 text-xs font-medium rounded-lg focus:outline-none focus:ring-2 transition-shadow ${mensagem.status && mensagem.status !== '' ? STATUS_COLORS[mensagem.status as keyof typeof STATUS_COLORS] : 'bg-gray-100 text-gray-800'}`}
                      style={mensagem.status === 'pendente' ? { 
                        borderWidth: '1px', 
                        minWidth: '130px', 
                        boxShadow: 'none',
                        backgroundColor: '#eef2ff',
                        color: '#879FED',
                        borderColor: '#c7d2fe'
                      } : { borderWidth: '1px', minWidth: '130px', boxShadow: 'none' }}
                      disabled={loading}
                    >
                      {(!mensagem.status || mensagem.status === '') && (
                        <option value="">Select status</option>
                      )}
                      {STATUS_OPTIONS.slice(1).map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 xl:px-4 py-3">
                    <div className="text-xs xl:text-sm">
                      {mensagem.user_id ? (
                        <div>
                          <div className="font-semibold text-[#374161]">{getUserName(mensagem.user_id)}</div>
                          <div className="text-[#6374AD]">{getUserEmail(mensagem.user_id)}</div>
                        </div>
                      ) : (
                        <span className="text-[#FF9800] font-semibold bg-[#FF9800]/10 px-2 py-1 rounded-lg text-xs">Unassigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 xl:px-4 py-3">
                    <select
                      value={mensagem.user_id || 'unassigned'}
                      onChange={(e) => handleAssignUser(mensagem.id, e.target.value)}
                      className="px-2.5 py-1.5 text-xs border border-[#dbe2ea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6374AD] w-full text-[#374161] bg-white"
                      disabled={loading || assigningMensagem === mensagem.id}
                    >
                      <option value="unassigned">Remove assignment</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                    {assigningMensagem === mensagem.id && (
                      <div className="mt-1 text-xs text-[#6374AD] font-medium">Updating...</div>
                    )}
                  </td>
                  <td className="px-3 xl:px-4 py-3 text-xs xl:text-sm text-[#6374AD]">
                    {mensagem.created_at ? new Date(mensagem.created_at).toLocaleDateString('en-US') : '-'}
                  </td>
                  <td className="px-3 xl:px-4 py-3">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditMensagem(mensagem)}
                        className="text-[#6374AD] hover:text-[#374161] p-1.5 hover:bg-[#dbe2ea] rounded transition-colors"
                        title="Edit message"
                        disabled={loading}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteMensagem(mensagem)}
                        className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded transition-colors"
                        title="Delete message"
                        disabled={loading}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMensagens.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-[#6374AD]">No messages found with the applied filters.</p>
          </div>
        )}
      </div>

      {/* Layout Tablet Portrait - Grid de 2 colunas (768px-1023px) */}
      <div className="hidden md:grid lg:hidden grid-cols-2 gap-3">
        {filteredMensagens.map((mensagem) => (
          <div key={mensagem.id} className="bg-white rounded-lg shadow-sm border border-[#dbe2ea] p-3 hover:shadow-md transition-shadow">
            <div className="mb-2 pb-2 border-b border-[#dbe2ea]">
              <div className="text-sm font-bold text-[#374161] truncate">{mensagem.nome}</div>
              <div className="text-xs text-[#6374AD] truncate">{mensagem.email}</div>
              {mensagem.telefone && (
                <div className="text-xs text-[#6374AD]">{mensagem.telefone}</div>
              )}
            </div>

            <div className="mb-2">
              <div className="text-xs font-medium text-[#374161] opacity-60 mb-0.5">Company</div>
              <div className="text-xs font-semibold text-[#374161] truncate">{mensagem.company}</div>
            </div>

            <div className="mb-2">
              <div className="text-xs font-medium text-[#374161] opacity-60 mb-0.5">Status</div>
              <select
                value={mensagem.status ?? ''}
                onChange={(e) => handleStatusChange(mensagem.id, e.target.value)}
                className={`w-full px-2 py-1 text-xs font-medium rounded-lg focus:outline-none focus:ring-2 transition-shadow ${mensagem.status && mensagem.status !== '' ? STATUS_COLORS[mensagem.status as keyof typeof STATUS_COLORS] : 'bg-gray-100 text-gray-800'}`}
                style={mensagem.status === 'pendente' ? { 
                  borderWidth: '1px',
                  backgroundColor: '#eef2ff',
                  color: '#879FED',
                  borderColor: '#c7d2fe'
                } : { borderWidth: '1px' }}
                disabled={loading}
              >
                {(!mensagem.status || mensagem.status === '') && <option value="">Select</option>}
                {STATUS_OPTIONS.slice(1).map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <div className="text-xs font-medium text-[#374161] opacity-60 mb-0.5">Assigned to</div>
              {mensagem.user_id ? (
                <div>
                  <div className="text-xs font-semibold text-[#374161] truncate">{getUserName(mensagem.user_id)}</div>
                  <div className="text-xs text-[#6374AD] truncate">{getUserEmail(mensagem.user_id)}</div>
                </div>
              ) : (
                <span className="text-[#FF9800] font-semibold bg-[#FF9800]/10 px-2 py-1 rounded-lg text-xs">Unassigned</span>
              )}
            </div>

            <div className="mb-2">
              <select
                value={mensagem.user_id || 'unassigned'}
                onChange={(e) => handleAssignUser(mensagem.id, e.target.value)}
                className="w-full px-2 py-1 text-xs border border-[#dbe2ea] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6374AD] text-[#374161] bg-white"
                disabled={loading || assigningMensagem === mensagem.id}
              >
                <option value="unassigned">Remove assignment</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#dbe2ea]">
              <div className="text-xs text-[#6374AD]">
                {mensagem.created_at ? new Date(mensagem.created_at).toLocaleDateString('en-US') : '-'}
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleEditMensagem(mensagem)}
                  className="text-[#6374AD] hover:text-[#374161] p-1 hover:bg-[#dbe2ea] rounded text-sm"
                  disabled={loading}
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteMensagem(mensagem)}
                  className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded text-sm"
                  disabled={loading}
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredMensagens.length === 0 && !loading && (
          <div className="col-span-2 text-center py-8">
            <p className="text-[#6374AD]">No messages found with the applied filters.</p>
          </div>
        )}
      </div>

      {/* Layout Mobile - Cards Verticais (<768px) */}
      <div className="md:hidden space-y-3">
        {filteredMensagens.map((mensagem) => (
          <div key={mensagem.id} className="bg-white rounded-lg shadow-sm border border-[#dbe2ea] p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-[#374161] mb-1">{mensagem.nome}</h3>
                <p className="text-xs text-[#6374AD]">{mensagem.email}</p>
                {mensagem.telefone && (
                  <p className="text-xs text-[#6374AD]">{mensagem.telefone}</p>
                )}
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleEditMensagem(mensagem)}
                  className="text-[#6374AD] hover:text-[#374161] p-2 hover:bg-[#dbe2ea] rounded-lg transition-colors"
                  disabled={loading}
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteMensagem(mensagem)}
                  className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  disabled={loading}
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="mb-3">
              <div className="text-xs font-medium text-[#374161] opacity-60 mb-1">Company</div>
              <div className="text-sm font-semibold text-[#374161]">{mensagem.company}</div>
            </div>

            <div className="mb-3">
              <div className="text-xs font-medium text-[#374161] opacity-60 mb-1">Status</div>
              <select
                value={mensagem.status ?? ''}
                onChange={(e) => handleStatusChange(mensagem.id, e.target.value)}
                className={`w-full px-3 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 transition-shadow ${mensagem.status && mensagem.status !== '' ? STATUS_COLORS[mensagem.status as keyof typeof STATUS_COLORS] : 'bg-gray-100 text-gray-800'}`}
                style={mensagem.status === 'pendente' ? { 
                  borderWidth: '1px',
                  backgroundColor: '#eef2ff',
                  color: '#879FED',
                  borderColor: '#c7d2fe'
                } : { borderWidth: '1px' }}
                disabled={loading}
              >
                {(!mensagem.status || mensagem.status === '') && <option value="">Select status</option>}
                {STATUS_OPTIONS.slice(1).map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <div className="text-xs font-medium text-[#374161] opacity-60 mb-1">Assigned to</div>
              {mensagem.user_id ? (
                <div className="bg-[#f8f9fb] p-2 rounded-lg">
                  <div className="text-sm font-semibold text-[#374161]">{getUserName(mensagem.user_id)}</div>
                  <div className="text-xs text-[#6374AD]">{getUserEmail(mensagem.user_id)}</div>
                </div>
              ) : (
                <div className="text-sm text-[#FF9800] font-semibold bg-[#FF9800]/10 px-3 py-2 rounded-lg inline-block">
                  Unassigned
                </div>
              )}
            </div>

            <div className="mb-3">
              <div className="text-xs font-medium text-[#374161] opacity-60 mb-1">Reassign to</div>
              <select
                value={mensagem.user_id || 'unassigned'}
                onChange={(e) => handleAssignUser(mensagem.id, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#dbe2ea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6374AD] text-[#374161] bg-white"
                disabled={loading || assigningMensagem === mensagem.id}
              >
                <option value="unassigned">Remove assignment</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              {assigningMensagem === mensagem.id && (
                <div className="mt-1 text-xs text-[#6374AD] font-medium">Updating...</div>
              )}
            </div>

            <div className="pt-3 border-t border-[#dbe2ea]">
              <div className="text-xs text-[#6374AD]">
                Created: {mensagem.created_at ? new Date(mensagem.created_at).toLocaleDateString('en-US') : '-'}
              </div>
            </div>
          </div>
        ))}

        {filteredMensagens.length === 0 && !loading && (
          <div className="text-center py-8 bg-white rounded-lg border border-[#dbe2ea]">
            <p className="text-[#6374AD]">No messages found with the applied filters.</p>
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      {showEditModal && editingMensagem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start md:items-center justify-center z-50 p-0 md:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-4 md:p-6 max-w-2xl w-full min-h-full md:min-h-0 md:my-8">
            <h3 className="text-base md:text-lg font-bold text-[#374161] mb-4">Edit Message</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm font-semibold text-[#374161] mb-1">Name</label>
                <input
                  type="text"
                  value={editingMensagem.nome}
                  onChange={(e) => setEditingMensagem({ ...editingMensagem, nome: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#dbe2ea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6374AD] text-[#374161] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-semibold text-[#374161] mb-1">Email</label>
                <input
                  type="email"
                  value={editingMensagem.email}
                  onChange={(e) => setEditingMensagem({ ...editingMensagem, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#dbe2ea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6374AD] text-[#374161] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-semibold text-[#374161] mb-1">Phone</label>
                <input
                  type="text"
                  value={editingMensagem.telefone || ''}
                  onChange={(e) => setEditingMensagem({ ...editingMensagem, telefone: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#dbe2ea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6374AD] text-[#374161] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-semibold text-[#374161] mb-1">Company</label>
                <input
                  type="text"
                  value={editingMensagem.company}
                  onChange={(e) => setEditingMensagem({ ...editingMensagem, company: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#dbe2ea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6374AD] text-[#374161] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-semibold text-[#374161] mb-1">Status</label>
                <select
                  value={editingMensagem.status ?? ''}
                  onChange={(e) => setEditingMensagem({ ...editingMensagem, status: e.target.value as Mensagem['status'] })}
                  className="w-full px-3 py-2 text-sm border border-[#dbe2ea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6374AD] text-[#374161] bg-white"
                >
                  {editingMensagem.status === null && (
                    <option value="">Select status</option>
                  )}
                  {STATUS_OPTIONS.slice(1).map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3 md:mt-4">
              <label className="block text-xs md:text-sm font-semibold text-[#374161] mb-1">Message</label>
              <textarea
                value={editingMensagem.mensagem}
                onChange={(e) => setEditingMensagem({ ...editingMensagem, mensagem: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 text-sm border border-[#dbe2ea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6374AD] text-[#374161] bg-white"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-3 mt-4 md:mt-6">
              <button
                onClick={handleCloseEditModal}
                className="px-4 py-2 text-[#374161] bg-[#dbe2ea] rounded-lg hover:bg-[#c5cdd9] transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-[#6374AD] text-white rounded-lg hover:bg-[#4f5a8f] transition-colors font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start md:items-center justify-center z-50 p-0 md:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-4 md:p-6 max-w-2xl w-full min-h-full md:min-h-0 md:my-8">
            <h3 className="text-base md:text-lg font-bold text-[#374161] mb-4">Create New Message</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm font-semibold text-[#374161] mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newMensagem.nome}
                  onChange={(e) => setNewMensagem({ ...newMensagem, nome: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#dbe2ea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6374AD] text-[#374161] bg-white"
                  placeholder="Client name"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-semibold text-[#374161] mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newMensagem.email}
                  onChange={(e) => setNewMensagem({ ...newMensagem, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#dbe2ea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6374AD] text-[#374161] bg-white"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-semibold text-[#374161] mb-1">Phone</label>
                <input
                  type="text"
                  value={newMensagem.telefone}
                  onChange={(e) => setNewMensagem({ ...newMensagem, telefone: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#dbe2ea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6374AD] text-[#374161] bg-white"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-semibold text-[#374161] mb-1">
                  Company <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newMensagem.company}
                  onChange={(e) => setNewMensagem({ ...newMensagem, company: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#dbe2ea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6374AD] text-[#374161] bg-white"
                  placeholder="Your company name"
                />
              </div>
            </div>

            <div className="mt-3 md:mt-4">
              <label className="block text-xs md:text-sm font-semibold text-[#374161] mb-1">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={newMensagem.mensagem}
                onChange={(e) => setNewMensagem({ ...newMensagem, mensagem: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 text-sm border border-[#dbe2ea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6374AD] text-[#374161] bg-white"
                placeholder="Describe how we can help you"
              />
            </div>

            <div className="mt-4 md:mt-6 p-3 md:p-4 bg-[#6374AD]/10 border border-[#6374AD]/30 rounded-lg">
              <div className="flex items-start">
                <div className="text-[#6374AD] text-base md:text-lg mr-3">ℹ️</div>
                <div>
                  <p className="text-[#374161] font-semibold text-sm md:text-base">New message without assignment</p>
                  <p className="text-[#6374AD] text-xs md:text-sm mt-1">
                    This message will be created with status "Pending" and without assigned user.
                    You can assign it later through the table.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-3 mt-4 md:mt-6">
              <button
                onClick={handleCloseCreateModal}
                className="px-4 py-2 text-[#374161] bg-[#dbe2ea] rounded-lg hover:bg-[#c5cdd9] transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMensagem}
                disabled={!newMensagem.nome || !newMensagem.email || !newMensagem.company || !newMensagem.mensagem || loading}
                className="px-4 py-2 bg-[#71B399] text-white rounded-lg hover:bg-[#5fa085] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <span>▲</span>
                <span>Send Message</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 max-w-md w-full">
            <h3 className="text-base md:text-lg font-bold text-[#374161] mb-3 md:mb-4">Confirm Deletion</h3>
            <p className="text-sm md:text-base text-[#6374AD] mb-4 md:mb-6">
              Are you sure you want to delete the message from "{mensagemToDelete?.nome}"?
              This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-[#374161] bg-[#dbe2ea] rounded-lg hover:bg-[#c5cdd9] transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
