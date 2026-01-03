'use client';

import { useState, useCallback } from 'react';
import { useMensagensTecnicas } from '@/hooks/useMensagensTecnicas';
import { usePermissions } from '@/hooks/usePermissions';
import { Mensagem, STATUS_OPTIONS, STATUS_COLORS } from '@/types/mensagens';

export default function MensagensTecnicasManager() {
  const { hasPermission } = usePermissions();
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
  } = useMensagensTecnicas();

  // Log para debug
  console.log('🔍 MensagensTecnicasManager - Hook retornou:', { mensagens: mensagens.length, users: users.length, loading, error });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [mensagemToDelete, setMensagemToDelete] = useState<Mensagem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMensagem, setEditingMensagem] = useState<Mensagem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [assigningMensagem, setAssigningMensagem] = useState<string | null>(null);

  // Estado para o formulário de criação
  const [newMensagem, setNewMensagem] = useState({
    nome: '',
    email: '',
    telefone: '',
    empresa_fazenda: '',
    mensagem: ''
  });

  // Verificar permissões
  const hasTecnicoAccess = hasPermission({
    moduleName: 'tecnico',
    permissionType: 'read'
  });

  // Log para debug das permissões
  console.log('🔍 Permissões do usuário:', { hasTecnicoAccess });

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
        // Criar objeto com os dados atualizados
        const updatedData = {
          nome: editingMensagem.nome,
          email: editingMensagem.email,
          telefone: editingMensagem.telefone || '',
          empresa_fazenda: editingMensagem.empresa_fazenda,
          mensagem: editingMensagem.mensagem,
          status: editingMensagem.status
        };

        // Atualizar a mensagem
        const success = await updateMensagem(editingMensagem.id, updatedData);
        if (success) {
          setShowEditModal(false);
          setEditingMensagem(null);
        }
      } catch (error) {
        console.error('Erro ao atualizar mensagem:', error);
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
    console.log('🔍 handleCreateMensagem chamada');

    // Evitar múltiplos envios
    if (loading) {
      console.log('🔍 Loading ativo, retornando');
      return;
    }

    try {
      console.log('🔍 Iniciando validação...');

      // Validação dos campos obrigatórios
      if (!newMensagem.nome.trim()) {
        alert('Nome é obrigatório');
        return;
      }

      if (!newMensagem.email.trim()) {
        alert('Email é obrigatório');
        return;
      }

      // Validação básica de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newMensagem.email.trim())) {
        alert('Email inválido');
        return;
      }

      if (!newMensagem.empresa_fazenda.trim()) {
        alert('Empresa/Fazenda é obrigatório');
        return;
      }

      if (!newMensagem.mensagem.trim()) {
        alert('Mensagem é obrigatória');
        return;
      }

      console.log('🔍 Validação passou, criando dados...');

      const mensagemData = {
        ...newMensagem,
        nome: newMensagem.nome.trim(),
        email: newMensagem.email.trim(),
        telefone: newMensagem.telefone.trim() || null,
        empresa_fazenda: newMensagem.empresa_fazenda.trim(),
        mensagem: newMensagem.mensagem.trim(),
        user_id: null, // Sem atribuição inicial
        status: 'pendente' // Status padrão
      };

      console.log('🔍 Dados para envio:', mensagemData);
      console.log('🔍 Chamando createMensagem...');

      const success = await createMensagem(mensagemData);

      console.log('🔍 Resultado:', success);

      if (success) {
        console.log('🔍 Sucesso! Fechando modal...');
        setShowCreateModal(false);
        setNewMensagem({
          nome: '',
          email: '',
          telefone: '',
          empresa_fazenda: '',
          mensagem: ''
        });
      }
    } catch (error) {
      console.error('❌ Erro ao criar mensagem:', error);
    }
  }, [newMensagem, createMensagem, loading]);

  const handleCloseCreateModal = useCallback(() => {
    setShowCreateModal(false);
    setNewMensagem({
      nome: '',
      email: '',
      telefone: '',
      empresa_fazenda: '',
      mensagem: ''
    });
  }, []);

  // Filtrar mensagens
  const filteredMensagens = mensagens.filter(mensagem => {
    const matchesSearch = mensagem.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mensagem.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mensagem.empresa_fazenda.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || mensagem.status === statusFilter;

    const matchesUser = !userFilter ||
      (userFilter === 'unassigned' && !mensagem.user_id) ||
      (userFilter !== 'unassigned' && mensagem.user_id === userFilter);

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

  if (loading && mensagens.length === 0 && users.length === 0) {
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
    <div className="space-y-4 md:space-y-6">
      {/* Header com Estatísticas */}
      <div className="bg-gradient-to-r from-[#374161] to-[#6374AD] text-white p-4 md:p-6 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <p className="text-[#dbe2ea] text-sm md:text-base lg:text-lg">
              Controle a distribuição de mensagens entre usuários do sistema
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="bg-[#6374AD] px-3 py-1 rounded-lg text-xs md:text-sm font-medium">
                📊 Total: {mensagens.length}
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
            <span>Nova Mensagem</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div>
            <label className="block text-xs md:text-sm font-medium text-[#374161] mb-1">Buscar</label>
            <input
              type="text"
              placeholder="Nome, email ou empresa..."
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
            {mensagens.filter(m => !m.user_id).length}
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
            {mensagens.filter(m => m.status === 'em_analise').length}
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
            {mensagens.filter(m => m.status === 'concluida').length}
          </div>
        </div>

        {/* Pendentes - Azul Goalmoon */}
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
                  Cliente
                </th>
                <th className="px-3 xl:px-4 py-3 text-left text-xs xl:text-sm font-semibold text-[#374161] uppercase tracking-wider">
                  Empresa/Fazenda
                </th>
                <th className="px-3 xl:px-4 py-3 text-left text-xs xl:text-sm font-semibold text-[#374161] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 xl:px-4 py-3 text-left text-xs xl:text-sm font-semibold text-[#374161] uppercase tracking-wider">
                  Usuário Atual
                </th>
                <th className="px-3 xl:px-4 py-3 text-left text-xs xl:text-sm font-semibold text-[#374161] uppercase tracking-wider">
                  Reatribuir Para
                </th>
                <th className="px-3 xl:px-4 py-3 text-left text-xs xl:text-sm font-semibold text-[#374161] uppercase tracking-wider">
                  Data
                </th>
                <th className="px-3 xl:px-4 py-3 text-left text-xs xl:text-sm font-semibold text-[#374161] uppercase tracking-wider">
                  Ações
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
                    <div className="text-xs xl:text-sm font-medium text-[#374161]">{mensagem.empresa_fazenda}</div>
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
                        <option value="">Selecionar status</option>
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
                        <span className="text-[#FF9800] font-semibold bg-[#FF9800]/10 px-2 py-1 rounded-lg text-xs">Não atribuído</span>
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
                      <option value="unassigned">Remover atribuição</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                    {assigningMensagem === mensagem.id && (
                      <div className="mt-1 text-xs text-[#6374AD] font-medium">Atualizando...</div>
                    )}
                  </td>
                  <td className="px-3 xl:px-4 py-3 text-xs xl:text-sm text-[#6374AD]">
                    {mensagem.created_at ? new Date(mensagem.created_at).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td className="px-3 xl:px-4 py-3">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditMensagem(mensagem)}
                        className="text-[#6374AD] hover:text-[#374161] p-1.5 hover:bg-[#dbe2ea] rounded transition-colors"
                        title="Editar mensagem"
                        disabled={loading}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteMensagem(mensagem)}
                        className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded transition-colors"
                        title="Excluir mensagem"
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
            <p className="text-[#6374AD]">Nenhuma mensagem encontrada com os filtros aplicados.</p>
          </div>
        )}
      </div>

      {/* Layout Tablet Portrait - Grid de 2 colunas (768px-1023px) */}
      <div className="hidden md:grid lg:hidden grid-cols-2 gap-3">
        {filteredMensagens.map((mensagem) => (
          <div key={mensagem.id} className="bg-white rounded-lg shadow-sm border border-[#dbe2ea] p-3 hover:shadow-md transition-shadow">
            {/* Cliente Info */}
            <div className="mb-2 pb-2 border-b border-[#dbe2ea]">
              <div className="text-sm font-bold text-[#374161] truncate">{mensagem.nome}</div>
              <div className="text-xs text-[#6374AD] truncate">{mensagem.email}</div>
              {mensagem.telefone && (
                <div className="text-xs text-[#6374AD]">{mensagem.telefone}</div>
              )}
            </div>

            {/* Empresa */}
            <div className="mb-2">
              <div className="text-xs font-medium text-[#374161] opacity-60 mb-0.5">Empresa/Fazenda</div>
              <div className="text-xs font-semibold text-[#374161] truncate">{mensagem.empresa_fazenda}</div>
            </div>

            {/* Status */}
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
                {(!mensagem.status || mensagem.status === '') && <option value="">Selecionar</option>}
                {STATUS_OPTIONS.slice(1).map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Usuário Atual */}
            <div className="mb-2">
              <div className="text-xs font-medium text-[#374161] opacity-60 mb-0.5">Atribuído a</div>
              {mensagem.user_id ? (
                <div>
                  <div className="text-xs font-semibold text-[#374161] truncate">{getUserName(mensagem.user_id)}</div>
                  <div className="text-xs text-[#6374AD] truncate">{getUserEmail(mensagem.user_id)}</div>
                </div>
              ) : (
                <span className="text-[#FF9800] font-semibold bg-[#FF9800]/10 px-2 py-1 rounded-lg text-xs">Não atribuído</span>
              )}
            </div>

            {/* Reatribuir */}
            <div className="mb-2">
              <select
                value={mensagem.user_id || 'unassigned'}
                onChange={(e) => handleAssignUser(mensagem.id, e.target.value)}
                className="w-full px-2 py-1 text-xs border border-[#dbe2ea] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6374AD] text-[#374161] bg-white"
                disabled={loading || assigningMensagem === mensagem.id}
              >
                <option value="unassigned">Remover atribuição</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>

            {/* Data e Ações */}
            <div className="flex justify-between items-center pt-2 border-t border-[#dbe2ea]">
              <div className="text-xs text-[#6374AD]">
                {mensagem.created_at ? new Date(mensagem.created_at).toLocaleDateString('pt-BR') : '-'}
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
            <p className="text-[#6374AD]">Nenhuma mensagem encontrada com os filtros aplicados.</p>
          </div>
        )}
      </div>

      {/* Layout Mobile - Cards Verticais (<768px) */}
      <div className="md:hidden space-y-3">
        {filteredMensagens.map((mensagem) => (
          <div key={mensagem.id} className="bg-white rounded-lg shadow-sm border border-[#dbe2ea] p-4">
            {/* Header com Nome */}
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

            {/* Empresa/Fazenda */}
            <div className="mb-3">
              <div className="text-xs font-medium text-[#374161] opacity-60 mb-1">Empresa/Fazenda</div>
              <div className="text-sm font-semibold text-[#374161]">{mensagem.empresa_fazenda}</div>
            </div>

            {/* Status */}
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
                {(!mensagem.status || mensagem.status === '') && <option value="">Selecionar status</option>}
                {STATUS_OPTIONS.slice(1).map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Atribuição Atual */}
            <div className="mb-3">
              <div className="text-xs font-medium text-[#374161] opacity-60 mb-1">Atribuído a</div>
              {mensagem.user_id ? (
                <div className="bg-[#f8f9fb] p-2 rounded-lg">
                  <div className="text-sm font-semibold text-[#374161]">{getUserName(mensagem.user_id)}</div>
                  <div className="text-xs text-[#6374AD]">{getUserEmail(mensagem.user_id)}</div>
                </div>
              ) : (
                <div className="text-sm text-[#FF9800] font-semibold bg-[#FF9800]/10 px-3 py-2 rounded-lg inline-block">
                  Não atribuído
                </div>
              )}
            </div>

            {/* Reatribuir */}
            <div className="mb-3">
              <div className="text-xs font-medium text-[#374161] opacity-60 mb-1">Reatribuir para</div>
              <select
                value={mensagem.user_id || 'unassigned'}
                onChange={(e) => handleAssignUser(mensagem.id, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#dbe2ea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6374AD] text-[#374161] bg-white"
                disabled={loading || assigningMensagem === mensagem.id}
              >
                <option value="unassigned">Remover atribuição</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              {assigningMensagem === mensagem.id && (
                <div className="mt-1 text-xs text-[#6374AD] font-medium">Atualizando...</div>
              )}
            </div>

            {/* Data */}
            <div className="pt-3 border-t border-[#dbe2ea]">
              <div className="text-xs text-[#6374AD]">
                Criada em: {mensagem.created_at ? new Date(mensagem.created_at).toLocaleDateString('pt-BR') : '-'}
              </div>
            </div>
          </div>
        ))}

        {filteredMensagens.length === 0 && !loading && (
          <div className="text-center py-8 bg-white rounded-lg border border-[#dbe2ea]">
            <p className="text-[#6374AD]">Nenhuma mensagem encontrada com os filtros aplicados.</p>
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      {showEditModal && editingMensagem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start md:items-center justify-center z-50 p-0 md:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-4 md:p-6 max-w-2xl w-full min-h-full md:min-h-0 md:my-8">
            <h3 className="text-base md:text-lg font-bold text-[#374161] mb-4">Editar Mensagem</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm font-semibold text-[#374161] mb-1">Nome</label>
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
                <label className="block text-xs md:text-sm font-semibold text-[#374161] mb-1">Telefone</label>
                <input
                  type="text"
                  value={editingMensagem.telefone || ''}
                  onChange={(e) => setEditingMensagem({ ...editingMensagem, telefone: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#dbe2ea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6374AD] text-[#374161] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-semibold text-[#374161] mb-1">Empresa/Fazenda</label>
                <input
                  type="text"
                  value={editingMensagem.empresa_fazenda}
                  onChange={(e) => setEditingMensagem({ ...editingMensagem, empresa_fazenda: e.target.value })}
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
                    <option value="">Selecionar status</option>
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
              <label className="block text-xs md:text-sm font-semibold text-[#374161] mb-1">Mensagem</label>
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
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-[#6374AD] text-white rounded-lg hover:bg-[#4f5a8f] transition-colors font-medium"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start md:items-center justify-center z-50 p-0 md:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-4 md:p-6 max-w-2xl w-full min-h-full md:min-h-0 md:my-8">
            <h3 className="text-base md:text-lg font-bold text-[#374161] mb-4">Criar Nova Mensagem</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm font-semibold text-[#374161] mb-1">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newMensagem.nome}
                  onChange={(e) => setNewMensagem({ ...newMensagem, nome: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#dbe2ea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6374AD] text-[#374161] bg-white"
                  placeholder="Nome do cliente"
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
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-semibold text-[#374161] mb-1">Telefone</label>
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
                  Empresa/Fazenda <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newMensagem.empresa_fazenda}
                  onChange={(e) => setNewMensagem({ ...newMensagem, empresa_fazenda: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#dbe2ea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6374AD] text-[#374161] bg-white"
                  placeholder="Nome da sua empresa ou fazenda"
                />
              </div>
            </div>

            <div className="mt-3 md:mt-4">
              <label className="block text-xs md:text-sm font-semibold text-[#374161] mb-1">
                Mensagem <span className="text-red-500">*</span>
              </label>
              <textarea
                value={newMensagem.mensagem}
                onChange={(e) => setNewMensagem({ ...newMensagem, mensagem: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 text-sm border border-[#dbe2ea] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6374AD] text-[#374161] bg-white"
                placeholder="Descreva como podemos ajudar você"
              />
            </div>

            <div className="mt-4 md:mt-6 p-3 md:p-4 bg-[#6374AD]/10 border border-[#6374AD]/30 rounded-lg">
              <div className="flex items-start">
                <div className="text-[#6374AD] text-base md:text-lg mr-3">ℹ️</div>
                <div>
                  <p className="text-[#374161] font-semibold text-sm md:text-base">Nova mensagem sem atribuição</p>
                  <p className="text-[#6374AD] text-xs md:text-sm mt-1">
                    Esta mensagem será criada com status "Pendente" e sem usuário atribuído.
                    Você poderá atribuí-la posteriormente através da tabela.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-3 mt-4 md:mt-6">
              <button
                onClick={handleCloseCreateModal}
                className="px-4 py-2 text-[#374161] bg-[#dbe2ea] rounded-lg hover:bg-[#c5cdd9] transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateMensagem}
                disabled={!newMensagem.nome || !newMensagem.email || !newMensagem.empresa_fazenda || !newMensagem.mensagem || loading}
                className="px-4 py-2 bg-[#71B399] text-white rounded-lg hover:bg-[#5fa085] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <span>▲</span>
                <span>Enviar Mensagem</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 max-w-md w-full">
            <h3 className="text-base md:text-lg font-bold text-[#374161] mb-3 md:mb-4">Confirmar Exclusão</h3>
            <p className="text-sm md:text-base text-[#6374AD] mb-4 md:mb-6">
              Tem certeza que deseja excluir a mensagem de "{mensagemToDelete?.nome}"?
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-[#374161] bg-[#dbe2ea] rounded-lg hover:bg-[#c5cdd9] transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
