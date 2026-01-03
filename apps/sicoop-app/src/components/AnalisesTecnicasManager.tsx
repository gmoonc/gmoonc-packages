'use client';

import { useState, useCallback } from 'react';
import { useAnalisesTecnicas } from '@/hooks/useAnalisesTecnicas';
import { usePermissions } from '@/hooks/usePermissions';
import { AnaliseCobertura, STATUS_OPTIONS, STATUS_COLORS } from '@/types/analises';

export default function AnalisesTecnicasManager() {
  const { hasPermission } = usePermissions();
  const {
    analises,
    users,
    loading,
    error,
    assignAnalise,
    updateAnaliseStatus,
    deleteAnalise,
    updateAnalise,
    createAnalise
  } = useAnalisesTecnicas();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [analiseToDelete, setAnaliseToDelete] = useState<AnaliseCobertura | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAnalise, setEditingAnalise] = useState<AnaliseCobertura | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [assigningAnalise, setAssigningAnalise] = useState<string | null>(null);

  // Estado para o formulário de criação
  const [newAnalise, setNewAnalise] = useState({
    nome: '',
    email: '',
    telefone: '',
    nome_fazenda: '',
    area_fazenda_ha: '',
    latitude: '',
    longitude: '',
    observacoes: ''
  } as {
    nome: string;
    email: string;
    telefone: string;
    nome_fazenda: string;
    area_fazenda_ha: string;
    latitude: string;
    longitude: string;
    observacoes: string;
  });

  // Verificar permissões
  const hasTecnicoAccess = hasPermission({
    moduleName: 'tecnico',
    permissionType: 'read'
  });

  const handleDeleteAnalise = useCallback((analise: AnaliseCobertura) => {
    setAnaliseToDelete(analise);
    setShowDeleteConfirm(true);
  }, []);

  const handleEditAnalise = useCallback((analise: AnaliseCobertura) => {
    setEditingAnalise(analise);
    setShowEditModal(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
    setEditingAnalise(null);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (editingAnalise) {
      try {
        const updatedData = {
          nome: editingAnalise.nome,
          email: editingAnalise.email,
          telefone: editingAnalise.telefone,
          nome_fazenda: editingAnalise.nome_fazenda,
          area_fazenda_ha: editingAnalise.area_fazenda_ha,
          latitude: editingAnalise.latitude,
          longitude: editingAnalise.longitude,
          observacoes: editingAnalise.observacoes
        };

        const success = await updateAnalise(editingAnalise.id, updatedData);
        if (success) {
          setShowEditModal(false);
          setEditingAnalise(null);
        }
      } catch (error) {
        console.error('Erro ao atualizar análise:', error);
      }
    }
  }, [editingAnalise, updateAnalise]);

  const confirmDelete = useCallback(async () => {
    if (analiseToDelete) {
      const success = await deleteAnalise(analiseToDelete.id);
      if (success) {
        setShowDeleteConfirm(false);
        setAnaliseToDelete(null);
      }
    }
  }, [analiseToDelete, deleteAnalise]);

  const handleAssignUser = useCallback(async (analiseId: string, userId: string) => {
    setAssigningAnalise(analiseId);
    try {
      await assignAnalise(analiseId, userId === 'unassigned' ? null : userId);
    } finally {
      setAssigningAnalise(null);
    }
  }, [assignAnalise]);

  const handleStatusChange = useCallback(async (analiseId: string, status: string) => {
    await updateAnaliseStatus(analiseId, status);
  }, [updateAnaliseStatus]);

  const handleCreateAnalise = useCallback(async () => {
    if (loading) return;

    try {
      if (!newAnalise.nome.trim()) {
        alert('Nome é obrigatório');
        return;
      }

      if (!newAnalise.email.trim()) {
        alert('Email é obrigatório');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newAnalise.email.trim())) {
        alert('Email inválido');
        return;
      }

      if (!newAnalise.nome_fazenda.trim()) {
        alert('Nome da Fazenda é obrigatório');
        return;
      }

      if (!newAnalise.area_fazenda_ha.trim()) {
        alert('Área da Fazenda é obrigatória');
        return;
      }

      const area = parseFloat(newAnalise.area_fazenda_ha);
      if (isNaN(area) || area <= 0) {
        alert('Área da Fazenda deve ser um número positivo');
        return;
      }

      if (newAnalise.latitude.trim() && (parseFloat(newAnalise.latitude) < -90 || parseFloat(newAnalise.latitude) > 90)) {
        alert('Latitude deve estar entre -90 e +90');
        return;
      }

      if (newAnalise.longitude.trim() && (parseFloat(newAnalise.longitude) < -180 || parseFloat(newAnalise.longitude) > 180)) {
        alert('Longitude deve estar entre -180 e +180');
        return;
      }

      const analiseData = {
        nome: newAnalise.nome.trim(),
        email: newAnalise.email.trim(),
        telefone: newAnalise.telefone.trim() || null,
        nome_fazenda: newAnalise.nome_fazenda.trim(),
        area_fazenda_ha: newAnalise.area_fazenda_ha.trim() ? parseFloat(newAnalise.area_fazenda_ha.trim()) : null,
        latitude: newAnalise.latitude.trim() ? parseFloat(newAnalise.latitude.trim()) : null,
        longitude: newAnalise.longitude.trim() ? parseFloat(newAnalise.longitude.trim()) : null,
        observacoes: newAnalise.observacoes.trim() || null,
        user_id: null,
        status: 'pendente'
      };

      const success = await createAnalise(analiseData);

      if (success) {
        setShowCreateModal(false);
        setNewAnalise({
          nome: '',
          email: '',
          telefone: '',
          nome_fazenda: '',
          area_fazenda_ha: '',
          latitude: '',
          longitude: '',
          observacoes: ''
        });
      }
    } catch (error) {
      console.error('Erro ao criar análise:', error);
    }
  }, [newAnalise, createAnalise, loading]);

  const handleCloseCreateModal = useCallback(() => {
    setShowCreateModal(false);
    setNewAnalise({
      nome: '',
      email: '',
      telefone: '',
      nome_fazenda: '',
      area_fazenda_ha: '',
      latitude: '',
      longitude: '',
      observacoes: ''
    });
  }, []);

  const filteredAnalises = analises.filter(analise => {
    const matchesSearch = analise.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analise.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analise.nome_fazenda.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || analise.status === statusFilter;

    const matchesUser = !userFilter ||
      (userFilter === 'unassigned' && !analise.user_id) ||
      (userFilter !== 'unassigned' && analise.user_id === userFilter);

    return matchesSearch && matchesStatus && matchesUser;
  });

  const getUserName = useCallback((userId: string | null) => {
    if (!userId) return 'Não atribuído';
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Usuário não encontrado';
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
          <h1 className="text-xl font-bold text-red-800 mb-2">Acesso Negado</h1>
          <p className="text-red-600">
            Você não tem permissão para acessar o módulo técnico.
          </p>
          <p className="text-red-500 text-sm mt-2">
            Entre em contato com o administrador para solicitar acesso.
          </p>
        </div>
      </div>
    );
  }

  if (loading && analises.length === 0 && users.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-red-800">Erro: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header com Estatísticas */}
      <div className="bg-gradient-to-r from-[#374161] to-[#6374AD] text-white p-4 md:p-6 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <p className="text-[#dbe2ea] text-sm md:text-base lg:text-lg">
              Controle a distribuição de análises entre usuários do sistema
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="bg-[#6374AD] px-3 py-1 rounded-lg text-xs md:text-sm font-medium">
                📊 Total: {analises.length}
              </span>
              <span className="bg-[#71B399] px-3 py-1 rounded-lg text-xs md:text-sm font-medium">
                👥 Usuários: {users.length}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl md:text-4xl">🔧</div>
            <div className="text-[#dbe2ea] text-xs md:text-sm">Versão Técnica</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-[#dbe2ea]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h3 className="text-base md:text-lg font-semibold text-[#374161]">Filtros e Ações</h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto px-4 py-2 bg-[#71B399] text-white rounded-lg hover:bg-[#5fa085] transition-colors font-medium flex items-center justify-center space-x-2 text-sm md:text-base"
            disabled={loading}
          >
            <span>➕</span>
            <span>Nova Análise</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div>
            <label className="block text-xs md:text-sm font-medium text-[#374161] mb-1">Buscar</label>
            <input
              type="text"
              placeholder="Nome, email ou fazenda..."
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
              <option value="">Todos os status</option>
              {STATUS_OPTIONS.slice(1).map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs md:text-sm font-medium text-[#374161] mb-1">Usuário Atual</label>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#dbe2ea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6374AD] text-[#374161] bg-white"
              disabled={loading}
            >
              <option value="">Todos os usuários</option>
              <option value="unassigned">Não atribuído</option>
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
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Não Atribuídas - Laranja/Bege quente */}
        <div className="p-3 sm:p-4 rounded-lg shadow-sm" style={{
          backgroundColor: 'rgba(255, 152, 0, 0.08)',
          borderColor: 'rgba(255, 152, 0, 0.25)',
          borderWidth: '1px'
        }}>
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <span className="text-base sm:text-lg">📋</span>
            <div className="text-xs font-medium" style={{ color: '#856968' }}>Não Atribuídas</div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: '#FF9800' }}>
            {analises.filter(a => !a.user_id).length}
          </div>
        </div>

        {/* Em Análise - Amarelo */}
        <div className="p-3 sm:p-4 rounded-lg shadow-sm" style={{
          backgroundColor: 'rgba(255, 235, 59, 0.12)',
          borderColor: 'rgba(255, 235, 59, 0.3)',
          borderWidth: '1px'
        }}>
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <span className="text-base sm:text-lg">🔍</span>
            <div className="text-xs font-medium" style={{ color: '#856968' }}>Em Análise</div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: '#F9A825' }}>
            {analises.filter(a => a.status === 'em_analise').length}
          </div>
        </div>

        {/* Concluídas - Verde Menta Goalmoon */}
        <div className="p-3 sm:p-4 rounded-lg shadow-sm" style={{
          backgroundColor: 'rgba(113, 179, 153, 0.12)',
          borderColor: 'rgba(113, 179, 153, 0.3)',
          borderWidth: '1px'
        }}>
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <span className="text-base sm:text-lg">✅</span>
            <div className="text-xs font-medium" style={{ color: '#856968' }}>Concluídas</div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: '#71b399' }}>
            {analises.filter(a => a.status === 'concluida').length}
          </div>
        </div>

        {/* Solicitadas - Azul Goalmoon */}
        <div className="p-3 sm:p-4 rounded-lg shadow-sm" style={{
          backgroundColor: 'rgba(99, 116, 173, 0.12)',
          borderColor: 'rgba(99, 116, 173, 0.3)',
          borderWidth: '1px'
        }}>
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <span className="text-base sm:text-lg">📨</span>
            <div className="text-xs font-medium" style={{ color: '#856968' }}>Pendentes</div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: '#6374AD' }}>
            {analises.filter(a => a.status === 'pendente').length}
          </div>
        </div>
      </div>

      {/* Mobile Cards (< 768px) */}
      <div className="md:hidden space-y-3">
        {filteredAnalises.map((analise) => (
          <div key={analise.id} className="bg-white rounded-lg p-3 shadow-sm" style={{
            borderColor: '#dbe2ea',
            borderWidth: '1px'
          }}>
            <div className="mb-2 pb-2" style={{ borderBottomWidth: '1px', borderBottomColor: 'rgba(219, 226, 234, 0.5)' }}>
              <div className="text-xs font-medium mb-1" style={{ color: '#856968' }}>Cliente</div>
              <div className="text-sm font-semibold mb-0.5" style={{ color: '#374161' }}>{analise.nome}</div>
              <div className="text-xs mb-0.5" style={{ color: '#6374AD' }}>{analise.email}</div>
              {analise.telefone && (
                <div className="text-xs" style={{ color: '#879FED' }}>{analise.telefone}</div>
              )}
            </div>

            <div className="mb-2 pb-2" style={{ borderBottomWidth: '1px', borderBottomColor: 'rgba(219, 226, 234, 0.5)' }}>
              <div className="text-xs font-medium mb-1" style={{ color: '#856968' }}>Fazenda</div>
              <div className="text-sm font-semibold mb-0.5" style={{ color: '#374161' }}>{analise.nome_fazenda}</div>
              {analise.area_fazenda_ha && (
                <div className="text-xs" style={{ color: '#6374AD' }}>{analise.area_fazenda_ha} ha</div>
              )}
            </div>

            <div className="mb-2">
              <div className="text-xs font-medium mb-1" style={{ color: '#856968' }}>Status</div>
              <select
                value={analise.status || ''}
                onChange={(e) => handleStatusChange(analise.id, e.target.value)}
                className={`w-full px-2.5 py-1.5 text-xs font-medium rounded-lg focus:outline-none focus:ring-2 transition-shadow ${analise.status ? STATUS_COLORS[analise.status as keyof typeof STATUS_COLORS] : 'bg-gray-100 text-gray-800'}`}
                style={analise.status === 'pendente' ? { 
                  borderWidth: '1px', 
                  boxShadow: 'none',
                  backgroundColor: '#eef2ff',
                  color: '#879FED',
                  borderColor: '#c7d2fe'
                } : { borderWidth: '1px', boxShadow: 'none' }}
                disabled={loading}
              >
                {STATUS_OPTIONS.slice(1).map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-2 pb-2" style={{ borderBottomWidth: '1px', borderBottomColor: 'rgba(219, 226, 234, 0.5)' }}>
              <div className="text-xs font-medium mb-1" style={{ color: '#856968' }}>Usuário Atual</div>
              {analise.user_id ? (
                <div>
                  <div className="text-sm font-semibold mb-0.5" style={{ color: '#374161' }}>{getUserName(analise.user_id)}</div>
                  <div className="text-xs" style={{ color: '#6374AD' }}>{getUserEmail(analise.user_id)}</div>
                </div>
              ) : (
                <span className="text-[#FF9800] font-semibold bg-[#FF9800]/10 px-2 py-1 rounded-lg text-xs">Não atribuído</span>
              )}
            </div>

            <div className="mb-2">
              <div className="text-xs font-medium mb-1">Reatribuir Para</div>
              <select
                value={analise.user_id || 'unassigned'}
                onChange={(e) => handleAssignUser(analise.id, e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2"
                style={{
                  borderColor: '#dbe2ea',
                  borderWidth: '1px',
                  color: '#374161',
                  backgroundColor: '#ffffff'
                }}
                onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px rgba(99, 116, 173, 0.2)'}
                onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                disabled={loading || assigningAnalise === analise.id}
              >
                <option value="unassigned">Remover atribuição</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between pt-2" style={{ borderTopWidth: '1px', borderTopColor: 'rgba(219, 226, 234, 0.5)' }}>
              <div className="text-xs" style={{ color: '#856968' }}>
                {analise.created_at ? new Date(analise.created_at).toLocaleDateString('pt-BR') : '-'}
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleEditAnalise(analise)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'rgba(99, 116, 173, 0.1)',
                    color: '#6374AD'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(99, 116, 173, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(99, 116, 173, 0.1)'}
                  title="Editar"
                  disabled={loading}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteAnalise(analise)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    color: '#dc2626'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)'}
                  title="Excluir"
                  disabled={loading}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredAnalises.length === 0 && !loading && (
          <div className="text-center py-8 bg-white rounded-lg" style={{
            borderColor: '#dbe2ea',
            borderWidth: '1px'
          }}>
            <div className="text-3xl mb-2">📭</div>
            <p className="text-sm" style={{ color: '#856968' }}>Nenhuma análise encontrada.</p>
          </div>
        )}
      </div>

      {/* Tablet Portrait Cards Grid (768px-1023px) */}
      <div className="hidden md:grid lg:hidden grid-cols-2 gap-3">
        {filteredAnalises.map((analise) => (
          <div key={analise.id} className="bg-white rounded-lg p-2.5 shadow-sm" style={{
            borderColor: '#dbe2ea',
            borderWidth: '1px'
          }}>
            <div className="mb-1.5 pb-1.5" style={{ borderBottomWidth: '1px', borderBottomColor: 'rgba(219, 226, 234, 0.5)' }}>
              <div className="text-sm font-semibold mb-0.5 truncate" style={{ color: '#374161' }}>{analise.nome}</div>
              <div className="text-xs truncate" style={{ color: '#6374AD' }}>{analise.email}</div>
            </div>

            <div className="mb-1.5 pb-1.5" style={{ borderBottomWidth: '1px', borderBottomColor: 'rgba(219, 226, 234, 0.5)' }}>
              <div className="text-xs font-medium truncate" style={{ color: '#374161' }}>{analise.nome_fazenda}</div>
              {analise.area_fazenda_ha && (
                <div className="text-xs" style={{ color: '#856968' }}>{analise.area_fazenda_ha} ha</div>
              )}
            </div>

            <div className="mb-1.5">
              <select
                value={analise.status || ''}
                onChange={(e) => handleStatusChange(analise.id, e.target.value)}
                className={`w-full px-2 py-1 text-xs font-medium rounded-lg focus:outline-none focus:ring-2 transition-shadow ${analise.status ? STATUS_COLORS[analise.status as keyof typeof STATUS_COLORS] : 'bg-gray-100 text-gray-800'}`}
                style={analise.status === 'pendente' ? { 
                  borderWidth: '1px',
                  backgroundColor: '#eef2ff',
                  color: '#879FED',
                  borderColor: '#c7d2fe'
                } : { borderWidth: '1px' }}
                disabled={loading}
              >
                {STATUS_OPTIONS.slice(1).map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-1.5">
              <div className="text-xs truncate" style={{ color: '#856968' }}>
                {analise.user_id ? getUserName(analise.user_id) : 'Não atribuído'}
              </div>
            </div>

            <div className="mb-1.5">
              <select
                value={analise.user_id || 'unassigned'}
                onChange={(e) => handleAssignUser(analise.id, e.target.value)}
                className="w-full px-2 py-1 text-xs rounded-lg focus:ring-2"
                style={{
                  borderColor: '#dbe2ea',
                  borderWidth: '1px',
                  color: '#374161',
                  backgroundColor: '#ffffff'
                }}
                disabled={loading}
              >
                <option value="unassigned">Remover</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between pt-1.5" style={{ borderTopWidth: '1px', borderTopColor: 'rgba(219, 226, 234, 0.5)' }}>
              <div className="text-xs" style={{ color: '#856968' }}>
                {analise.created_at ? new Date(analise.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '-'}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEditAnalise(analise)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'rgba(99, 116, 173, 0.1)',
                    color: '#6374AD'
                  }}
                  disabled={loading}
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteAnalise(analise)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    color: '#dc2626'
                  }}
                  disabled={loading}
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredAnalises.length === 0 && !loading && (
          <div className="col-span-2 text-center py-8 bg-white rounded-lg" style={{
            borderColor: '#dbe2ea',
            borderWidth: '1px'
          }}>
            <div className="text-3xl mb-2">📭</div>
            <p className="text-sm" style={{ color: '#856968' }}>Nenhuma análise encontrada.</p>
          </div>
        )}
      </div>

      {/* Desktop Table (1024px+) */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden" style={{
        borderColor: '#dbe2ea',
        borderWidth: '1px'
      }}>
        <div className="overflow-x-auto">
          <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead style={{ backgroundColor: 'rgba(219, 226, 234, 0.3)' }}>
              <tr>
                <th className="px-3 xl:px-4 py-2.5 xl:py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#3F4A6E', minWidth: '160px' }}>
                  Cliente
                </th>
                <th className="px-3 xl:px-4 py-2.5 xl:py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#3F4A6E', minWidth: '130px' }}>
                  Fazenda
                </th>
                <th className="px-3 xl:px-4 py-2.5 xl:py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#3F4A6E', minWidth: '120px' }}>
                  Status
                </th>
                <th className="px-3 xl:px-4 py-2.5 xl:py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#3F4A6E', minWidth: '140px' }}>
                  Usuário Atual
                </th>
                <th className="px-3 xl:px-4 py-2.5 xl:py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#3F4A6E', minWidth: '140px' }}>
                  Reatribuir
                </th>
                <th className="px-3 xl:px-4 py-2.5 xl:py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#3F4A6E', minWidth: '80px' }}>
                  Data
                </th>
                <th className="px-3 xl:px-4 py-2.5 xl:py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#3F4A6E', minWidth: '90px' }}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white" style={{ borderColor: '#dbe2ea' }}>
              {filteredAnalises.map((analise) => (
                <tr key={analise.id} className="transition-colors" style={{ borderBottomWidth: '1px', borderBottomColor: '#dbe2ea' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td className="px-3 xl:px-4 py-2 xl:py-2.5">
                    <div className="text-xs xl:text-sm font-semibold truncate" style={{ color: '#374161' }}>{analise.nome}</div>
                    <div className="text-xs truncate" style={{ color: '#6374AD' }}>{analise.email}</div>
                  </td>
                  <td className="px-3 xl:px-4 py-2 xl:py-2.5">
                    <div className="text-xs xl:text-sm font-medium truncate" style={{ color: '#374161' }}>{analise.nome_fazenda}</div>
                    {analise.area_fazenda_ha && (
                      <div className="text-xs" style={{ color: '#856968' }}>{analise.area_fazenda_ha} ha</div>
                    )}
                  </td>
                  <td className="px-3 xl:px-4 py-2 xl:py-2.5">
                    <select
                      value={analise.status || ''}
                      onChange={(e) => handleStatusChange(analise.id, e.target.value)}
                      className={`w-full px-2 xl:px-2.5 py-1 xl:py-1.5 text-xs font-medium rounded-lg focus:outline-none focus:ring-2 transition-shadow ${analise.status ? STATUS_COLORS[analise.status as keyof typeof STATUS_COLORS] : 'bg-gray-100 text-gray-800'}`}
                      style={analise.status === 'pendente' ? { 
                        borderWidth: '1px', 
                        minWidth: '110px', 
                        boxShadow: 'none',
                        backgroundColor: '#eef2ff',
                        color: '#879FED',
                        borderColor: '#c7d2fe'
                      } : { borderWidth: '1px', minWidth: '110px', boxShadow: 'none' }}
                      disabled={loading}
                    >
                      {STATUS_OPTIONS.slice(1).map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 xl:px-4 py-2 xl:py-2.5">
                    <div className="text-xs xl:text-sm truncate">
                      {analise.user_id ? (
                        <div className="font-semibold" style={{ color: '#374161' }}>{getUserName(analise.user_id)}</div>
                      ) : (
                        <span className="text-[#FF9800] font-semibold bg-[#FF9800]/10 px-2 py-1 rounded-lg text-xs">Não atribuído</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 xl:px-4 py-2 xl:py-2.5">
                    <select
                      value={analise.user_id || 'unassigned'}
                      onChange={(e) => handleAssignUser(analise.id, e.target.value)}
                      className="w-full px-2 xl:px-2.5 py-1 xl:py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        borderColor: '#dbe2ea',
                        borderWidth: '1px',
                        color: '#374161',
                        backgroundColor: '#ffffff',
                        minWidth: '130px'
                      }}
                      disabled={loading}
                    >
                      <option value="unassigned">Remover</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 xl:px-4 py-2 xl:py-2.5 text-xs" style={{ color: '#856968' }}>
                    {analise.created_at ? new Date(analise.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '-'}
                  </td>
                  <td className="px-3 xl:px-4 py-2 xl:py-2.5">
                    <div className="flex gap-1.5 xl:gap-2 justify-center">
                      <button
                        onClick={() => handleEditAnalise(analise)}
                        className="p-1.5 rounded transition-colors"
                        style={{ color: '#6374AD' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(99, 116, 173, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        disabled={loading}
                      >
                        <svg className="h-3.5 xl:h-4 w-3.5 xl:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteAnalise(analise)}
                        className="p-1.5 rounded transition-colors"
                        style={{ color: '#dc2626' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        disabled={loading}
                      >
                        <svg className="h-3.5 xl:h-4 w-3.5 xl:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAnalises.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-sm" style={{ color: '#856968' }}>Nenhuma análise encontrada com os filtros aplicados.</p>
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && analiseToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-red-600 mb-4">Confirmar Exclusão</h3>
            <p className="text-gray-700 mb-6">
              Tem certeza que deseja excluir a análise de <strong>{analiseToDelete.nome}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setAnaliseToDelete(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {showEditModal && editingAnalise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start md:items-center justify-center z-50 p-0 md:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full min-h-full md:min-h-0 md:my-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Editar Análise</h3>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input
                    type="text"
                    value={editingAnalise.nome}
                    onChange={(e) => setEditingAnalise({ ...editingAnalise, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={editingAnalise.email}
                    onChange={(e) => setEditingAnalise({ ...editingAnalise, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={editingAnalise.telefone || ''}
                    onChange={(e) => setEditingAnalise({ ...editingAnalise, telefone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Fazenda *</label>
                  <input
                    type="text"
                    value={editingAnalise.nome_fazenda}
                    onChange={(e) => setEditingAnalise({ ...editingAnalise, nome_fazenda: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Área (ha) *</label>
                  <input
                    type="text"
                    value={editingAnalise.area_fazenda_ha?.toString() || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditingAnalise({ 
                        ...editingAnalise, 
                        area_fazenda_ha: value ? parseFloat(value) || null : null 
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input
                    type="text"
                    value={editingAnalise.latitude?.toString() || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditingAnalise({ 
                        ...editingAnalise, 
                        latitude: value ? parseFloat(value) || null : null 
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="-23.5505"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input
                    type="text"
                    value={editingAnalise.longitude?.toString() || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditingAnalise({ 
                        ...editingAnalise, 
                        longitude: value ? parseFloat(value) || null : null 
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="-46.6333"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={editingAnalise.observacoes || ''}
                  onChange={(e) => setEditingAnalise({ ...editingAnalise, observacoes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCloseEditModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start md:items-center justify-center z-50 p-0 md:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full min-h-full md:min-h-0 md:my-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Nova Análise</h3>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input
                    type="text"
                    value={newAnalise.nome}
                    onChange={(e) => setNewAnalise({ ...newAnalise, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="João Silva"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={newAnalise.email}
                    onChange={(e) => setNewAnalise({ ...newAnalise, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="joao@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={newAnalise.telefone}
                    onChange={(e) => setNewAnalise({ ...newAnalise, telefone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="(11) 98765-4321"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Fazenda *</label>
                  <input
                    type="text"
                    value={newAnalise.nome_fazenda}
                    onChange={(e) => setNewAnalise({ ...newAnalise, nome_fazenda: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Fazenda Boa Vista"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Área (ha) *</label>
                  <input
                    type="text"
                    value={newAnalise.area_fazenda_ha}
                    onChange={(e) => setNewAnalise({ ...newAnalise, area_fazenda_ha: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input
                    type="text"
                    value={newAnalise.latitude}
                    onChange={(e) => setNewAnalise({ ...newAnalise, latitude: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="-23.5505"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input
                    type="text"
                    value={newAnalise.longitude}
                    onChange={(e) => setNewAnalise({ ...newAnalise, longitude: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="-46.6333"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={newAnalise.observacoes}
                  onChange={(e) => setNewAnalise({ ...newAnalise, observacoes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  rows={3}
                  placeholder="Detalhes adicionais sobre a análise..."
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCloseCreateModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateAnalise}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Criando...' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
