'use client';

import React, { useState, useMemo } from 'react';
import { useMensagens } from '@/hooks/useMensagens';
import MensagemForm from './MensagemForm';
import { MensagemFormData, MensagemFilters, STATUS_OPTIONS, STATUS_COLORS } from '@/types/mensagens';
import { MessageSquare, Edit2, Trash2, RefreshCw } from 'lucide-react';

export default function MensagensManager() {
  const {
    mensagens,
    loading,
    error,
    createMensagem,
    updateMensagem,
    deleteMensagem
  } = useMensagens();
  
  const [showForm, setShowForm] = useState(false);
  const [editingMensagem, setEditingMensagem] = useState<string | null>(null);
  const [filters, setFilters] = useState<MensagemFilters>({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });

  // Estatísticas
  const stats = useMemo(() => {
    const total = mensagens.length;
    const pendentes = mensagens.filter(m => m.status === 'pendente').length;
    const emAnalise = mensagens.filter(m => m.status === 'em_analise').length;
    const concluidas = mensagens.filter(m => m.status === 'concluida').length;
    
    return { total, pendentes, emAnalise, concluidas };
  }, [mensagens]);

  // Filtros
  const filteredMensagens = useMemo(() => {
    return mensagens.filter(mensagem => {
      // Filtro de busca
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableFields = [
          mensagem.nome,
          mensagem.email,
          mensagem.empresa_fazenda,
          mensagem.mensagem
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchableFields.includes(searchTerm)) {
          return false;
        }
      }

      // Filtro de status
      if (filters.status && mensagem.status !== filters.status) {
        return false;
      }

      // Filtro de data
      if (filters.dateFrom) {
        const dateFrom = new Date(filters.dateFrom);
        const mensagemDate = mensagem.created_at ? new Date(mensagem.created_at) : null;
        if (!mensagemDate || mensagemDate < dateFrom) {
          return false;
        }
      }

      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo);
        const mensagemDate = mensagem.created_at ? new Date(mensagem.created_at) : null;
        if (!mensagemDate || mensagemDate > dateTo) {
          return false;
        }
      }

      return true;
    });
  }, [mensagens, filters]);

  const handleFilterChange = (field: keyof MensagemFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const handleNewMensagem = () => {
    setEditingMensagem(null);
    setShowForm(true);
  };

  const handleEditMensagem = (id: string) => {
    setEditingMensagem(id);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: MensagemFormData) => {
    if (editingMensagem) {
      const updated = await updateMensagem(editingMensagem, data);
      if (updated) {
        setShowForm(false);
        setEditingMensagem(null);
      }
    } else {
      const created = await createMensagem(data);
      if (created) {
        setShowForm(false);
      }
    }
  };

  const handleDeleteMensagem = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta mensagem?')) {
      const success = await deleteMensagem(id);
      if (success) {
        // Mensagem removida com sucesso
      }
    }
  };

  const handleBackToList = () => {
    setShowForm(false);
    setEditingMensagem(null);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string | null) => {
    const statusKey = status as keyof typeof STATUS_COLORS;
    const colorClass = status && STATUS_COLORS[statusKey] 
      ? STATUS_COLORS[statusKey]
      : 'bg-gray-100 text-gray-700 border border-gray-300 font-semibold';
    
    const label = STATUS_OPTIONS.find(opt => opt.value === status)?.label || status || 'Sem status';
    
    // Aplicar estilo inline para pendente (igual ao técnico)
    const inlineStyle = status === 'pendente' ? {
      borderWidth: '1px',
      boxShadow: 'none',
      backgroundColor: '#eef2ff',
      color: '#879FED',
      borderColor: '#c7d2fe'
    } : { borderWidth: '1px', boxShadow: 'none' };
    
    return (
      <span 
        className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold ${colorClass}`}
        style={inlineStyle}
      >
        {label}
      </span>
    );
  };

  if (showForm) {
    return (
      <MensagemForm
        onSubmit={handleFormSubmit}
        onCancel={handleBackToList}
        initialData={editingMensagem ? mensagens.find(m => m.id === editingMensagem) : undefined}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6374AD] mx-auto mb-4"></div>
          <p className="text-[#374161] font-medium">Carregando mensagens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#374161] to-[#6374AD] text-white p-4 md:p-6 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <p className="text-[#dbe2ea] text-sm md:text-base lg:text-lg">
              Gerencie suas mensagens para o Sicoop
            </p>
          </div>
          <button
            onClick={handleNewMensagem}
            className="bg-[#71B399] hover:bg-[#5fa085] text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm md:text-base"
          >
            <span>➕</span>
            <span>Nova Mensagem</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">Erro: {error}</p>
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total - Laranja/Bege quente (igual ao "Não Atribuídas" do técnico) */}
        <div className="p-3 sm:p-4 rounded-lg shadow-sm" style={{
          backgroundColor: 'rgba(255, 152, 0, 0.08)',
          borderColor: 'rgba(255, 152, 0, 0.25)',
          borderWidth: '1px'
        }}>
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <span className="text-base sm:text-lg">📋</span>
            <div className="text-xs font-medium" style={{ color: '#856968' }}>Total</div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: '#FF9800' }}>
            {stats.total}
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
            {stats.pendentes}
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
            {stats.emAnalise}
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
            {stats.concluidas}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-[#dbe2ea]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
          <div>
            <label htmlFor="search" className="block text-[#374161] text-xs sm:text-sm font-medium mb-1 sm:mb-2">
              Buscar
            </label>
            <input
              id="search"
              type="text"
              placeholder="Nome, email, empresa..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-[#dbe2ea] rounded-lg focus:ring-2 focus:ring-[#6374AD] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-[#374161] text-xs sm:text-sm font-medium mb-1 sm:mb-2">
              Status
            </label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-[#dbe2ea] rounded-lg focus:ring-2 focus:ring-[#6374AD] focus:border-transparent transition-all"
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dateFrom" className="block text-[#374161] text-xs sm:text-sm font-medium mb-1 sm:mb-2">
              Data de
            </label>
            <input
              id="dateFrom"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-[#dbe2ea] rounded-lg focus:ring-2 focus:ring-[#6374AD] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label htmlFor="dateTo" className="block text-[#374161] text-xs sm:text-sm font-medium mb-1 sm:mb-2">
              Data até
            </label>
            <input
              id="dateTo"
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-[#dbe2ea] rounded-lg focus:ring-2 focus:ring-[#6374AD] focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Limpar Filtros
          </button>
          <button
            onClick={() => {}}
            className="px-4 py-2 text-xs sm:text-sm bg-[#6374AD] text-white rounded-lg hover:bg-[#4d5a8d] transition-colors font-medium flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Desktop/Tablet Landscape - Tabela */}
      <div className="hidden lg:block bg-white rounded-lg shadow-md border border-[#dbe2ea] overflow-hidden">
        {filteredMensagens.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <MessageSquare className="w-16 h-16 text-[#dbe2ea] mb-4" />
            <h3 className="text-lg font-semibold text-[#374161] mb-2">
              {filters.search || filters.status || filters.dateFrom || filters.dateTo 
                ? 'Nenhuma mensagem encontrada'
                : 'Nenhuma mensagem cadastrada'
              }
            </h3>
            <p className="text-[#6374AD] text-sm">
              {filters.search || filters.status || filters.dateFrom || filters.dateTo 
                ? 'Tente ajustar os filtros.'
                : 'Comece criando sua primeira mensagem.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#374161] to-[#293047]">
                <tr>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs xl:text-sm font-semibold text-white">Nome</th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs xl:text-sm font-semibold text-white">Email</th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs xl:text-sm font-semibold text-white">Telefone</th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs xl:text-sm font-semibold text-white">Empresa/Fazenda</th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs xl:text-sm font-semibold text-white">Status</th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs xl:text-sm font-semibold text-white">Criada em</th>
                  <th className="px-4 xl:px-6 py-3 text-center text-xs xl:text-sm font-semibold text-white">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dbe2ea]">
                {filteredMensagens.map((mensagem) => (
                  <tr key={mensagem.id} className="hover:bg-[#eaf0f5] transition-colors">
                    <td className="px-4 xl:px-6 py-3">
                      <div className="text-xs xl:text-sm font-medium text-[#374161]">{mensagem.nome}</div>
                    </td>
                    <td className="px-4 xl:px-6 py-3 text-xs xl:text-sm text-[#374161]">{mensagem.email}</td>
                    <td className="px-4 xl:px-6 py-3 text-xs xl:text-sm text-[#374161]">
                      {mensagem.telefone || '-'}
                    </td>
                    <td className="px-4 xl:px-6 py-3 text-xs xl:text-sm text-[#374161]">{mensagem.empresa_fazenda}</td>
                    <td className="px-4 xl:px-6 py-3">
                      {getStatusBadge(mensagem.status)}
                    </td>
                    <td className="px-4 xl:px-6 py-3 text-xs xl:text-sm text-[#374161]">{formatDate(mensagem.created_at)}</td>
                    <td className="px-4 xl:px-6 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditMensagem(mensagem.id)}
                          className="p-2 text-[#6374AD] hover:bg-[#879FED] hover:text-white rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMensagem(mensagem.id)}
                          className="p-2 text-[#EF4444] hover:bg-[#EF4444] hover:text-white rounded-lg transition-colors"
                          title="Excluir"
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
        )}
        <div className="bg-[#eaf0f5] px-6 py-3 border-t border-[#dbe2ea]">
          <p className="text-xs sm:text-sm text-[#374161] font-medium">
            Mostrando {filteredMensagens.length} de {mensagens.length} mensagens
          </p>
        </div>
      </div>

      {/* Tablet Portrait - Grid 2 Colunas */}
      <div className="hidden md:grid lg:hidden grid-cols-2 gap-3">
        {filteredMensagens.length === 0 ? (
          <div className="col-span-2 flex flex-col items-center justify-center py-12 px-4 bg-white rounded-lg shadow-md border border-[#dbe2ea]">
            <MessageSquare className="w-16 h-16 text-[#dbe2ea] mb-4" />
            <h3 className="text-base font-semibold text-[#374161] mb-2">
              {filters.search || filters.status || filters.dateFrom || filters.dateTo 
                ? 'Nenhuma mensagem encontrada'
                : 'Nenhuma mensagem cadastrada'
              }
            </h3>
            <p className="text-[#6374AD] text-sm text-center">
              {filters.search || filters.status || filters.dateFrom || filters.dateTo 
                ? 'Tente ajustar os filtros.'
                : 'Comece criando sua primeira mensagem.'}
            </p>
          </div>
        ) : (
          filteredMensagens.map((mensagem) => (
            <div
              key={mensagem.id}
              className="bg-white rounded-lg shadow-md border border-[#dbe2ea] p-3 sm:p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[#374161] truncate">{mensagem.nome}</h3>
                  <p className="text-xs text-[#6374AD] truncate">{mensagem.email}</p>
                </div>
                {getStatusBadge(mensagem.status)}
              </div>
              
              <div className="space-y-1 mb-3">
                <div className="flex items-center text-xs">
                  <span className="text-[#6374AD] font-medium w-20">Telefone:</span>
                  <span className="text-[#374161] truncate">{mensagem.telefone || '-'}</span>
                </div>
                <div className="flex items-center text-xs">
                  <span className="text-[#6374AD] font-medium w-20">Empresa:</span>
                  <span className="text-[#374161] truncate">{mensagem.empresa_fazenda}</span>
                </div>
                <div className="flex items-center text-xs">
                  <span className="text-[#6374AD] font-medium w-20">Criada:</span>
                  <span className="text-[#374161]">{formatDate(mensagem.created_at)}</span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2 border-t border-[#dbe2ea]">
                <button
                  onClick={() => handleEditMensagem(mensagem.id)}
                  className="flex-1 px-3 py-1.5 text-xs bg-[#6374AD] text-white rounded-lg hover:bg-[#4d5a8d] transition-colors font-medium"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteMensagem(mensagem.id)}
                  className="flex-1 px-3 py-1.5 text-xs bg-[#EF4444] text-white rounded-lg hover:bg-[#dc2626] transition-colors font-medium"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mobile - Cards Verticais */}
      <div className="md:hidden space-y-3">
        {filteredMensagens.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-lg shadow-md border border-[#dbe2ea]">
            <MessageSquare className="w-16 h-16 text-[#dbe2ea] mb-4" />
            <h3 className="text-base font-semibold text-[#374161] mb-2 text-center">
              {filters.search || filters.status || filters.dateFrom || filters.dateTo 
                ? 'Nenhuma mensagem encontrada'
                : 'Nenhuma mensagem cadastrada'
              }
            </h3>
            <p className="text-[#6374AD] text-sm text-center">
              {filters.search || filters.status || filters.dateFrom || filters.dateTo 
                ? 'Tente ajustar os filtros.'
                : 'Comece criando sua primeira mensagem.'}
            </p>
          </div>
        ) : (
          filteredMensagens.map((mensagem) => (
            <div
              key={mensagem.id}
              className="bg-white rounded-lg shadow-md border border-[#dbe2ea] p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-[#374161] mb-1">{mensagem.nome}</h3>
                  <p className="text-sm text-[#6374AD] break-words">{mensagem.email}</p>
                </div>
                <div className="ml-2">
                  {getStatusBadge(mensagem.status)}
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div>
                  <span className="text-xs text-[#6374AD] font-medium">Telefone</span>
                  <p className="text-sm text-[#374161]">{mensagem.telefone || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-[#6374AD] font-medium">Empresa/Fazenda</span>
                  <p className="text-sm text-[#374161]">{mensagem.empresa_fazenda}</p>
                </div>
                <div>
                  <span className="text-xs text-[#6374AD] font-medium">Mensagem</span>
                  <p className="text-sm text-[#374161] line-clamp-2">{mensagem.mensagem}</p>
                </div>
                <div>
                  <span className="text-xs text-[#6374AD] font-medium">Criada em</span>
                  <p className="text-sm text-[#374161]">{formatDate(mensagem.created_at)}</p>
                </div>
              </div>
              
              <div className="flex gap-2 pt-3 border-t border-[#dbe2ea]">
                <button
                  onClick={() => handleEditMensagem(mensagem.id)}
                  className="flex-1 px-4 py-2 text-sm bg-[#6374AD] text-white rounded-lg hover:bg-[#4d5a8d] transition-colors font-medium"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteMensagem(mensagem.id)}
                  className="flex-1 px-4 py-2 text-sm bg-[#EF4444] text-white rounded-lg hover:bg-[#dc2626] transition-colors font-medium"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
