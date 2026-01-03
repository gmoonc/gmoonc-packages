'use client';

import React, { useState, useMemo } from 'react';
import { useAnalises } from '@/hooks/useAnalises';
import AnaliseForm from './AnaliseForm';
import { AnaliseCoberturaFormData, AnaliseCoberturaFilters, STATUS_OPTIONS, STATUS_COLORS } from '@/types/analises';
import { FileText, Edit2, Trash2, RefreshCw } from 'lucide-react';

export default function AnalisesManager() {
  const {
    analises,
    loading,
    error,
    createAnalise,
    updateAnalise,
    deleteAnalise
  } = useAnalises();
  
  const [showForm, setShowForm] = useState(false);
  const [editingAnalise, setEditingAnalise] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnaliseCoberturaFilters>({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });

  // Estatísticas
  const stats = useMemo(() => {
    const total = analises.length;
    const pendentes = analises.filter(a => a.status === 'pendente').length;
    const emAnalise = analises.filter(a => a.status === 'em_analise').length;
    const concluidas = analises.filter(a => a.status === 'concluida').length;
    
    return { total, pendentes, emAnalise, concluidas };
  }, [analises]);

  // Filtros
  const filteredAnalises = useMemo(() => {
    return analises.filter(analise => {
      // Filtro de busca
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableFields = [
          analise.nome,
          analise.email,
          analise.nome_fazenda,
          analise.observacoes
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchableFields.includes(searchTerm)) {
          return false;
        }
      }

      // Filtro de status
      if (filters.status && analise.status !== filters.status) {
        return false;
      }

      // Filtro de data
      if (filters.dateFrom) {
        const dateFrom = new Date(filters.dateFrom);
        const analiseDate = analise.created_at ? new Date(analise.created_at) : null;
        if (!analiseDate || analiseDate < dateFrom) {
          return false;
        }
      }

      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo);
        const analiseDate = analise.created_at ? new Date(analise.created_at) : null;
        if (!analiseDate || analiseDate > dateTo) {
          return false;
        }
      }

      return true;
    });
  }, [analises, filters]);

  const handleFilterChange = (field: keyof AnaliseCoberturaFilters, value: string) => {
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

  const handleNewAnalise = () => {
    setEditingAnalise(null);
    setShowForm(true);
  };

  const handleEditAnalise = (id: string) => {
    setEditingAnalise(id);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: AnaliseCoberturaFormData) => {
    if (editingAnalise) {
      const updated = await updateAnalise(editingAnalise, data);
      if (updated) {
        setShowForm(false);
        setEditingAnalise(null);
      }
    } else {
      const created = await createAnalise(data);
      if (created) {
        setShowForm(false);
      }
    }
  };

  const handleDeleteAnalise = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta análise?')) {
      const success = await deleteAnalise(id);
      if (success) {
        // Análise removida com sucesso
      }
    }
  };

  const handleBackToList = () => {
    setShowForm(false);
    setEditingAnalise(null);
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
      <AnaliseForm
        onSubmit={handleFormSubmit}
        onCancel={handleBackToList}
        initialData={editingAnalise ? analises.find(a => a.id === editingAnalise) : undefined}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6374AD] mx-auto mb-4"></div>
          <p className="text-[#374161] font-medium">Carregando análises...</p>
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
              Gerencie suas análises de cobertura de sinal
            </p>
          </div>
          <button
            onClick={handleNewAnalise}
            className="bg-[#71B399] hover:bg-[#5fa085] text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm md:text-base"
          >
            <span>➕</span>
            <span>Nova Análise</span>
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

        {/* Pendentes - Azul Goalmoon (igual ao técnico) */}
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
              placeholder="Nome, email, fazenda..."
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
            className="px-4 py-2 text-xs sm:text-sm bg-white text-[#374161] border border-[#dbe2ea] rounded-lg hover:bg-[#eaf0f5] transition-colors font-medium"
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
        {filteredAnalises.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <FileText className="w-16 h-16 text-[#dbe2ea] mb-4" />
            <h3 className="text-lg font-semibold text-[#374161] mb-2">
              {filters.search || filters.status || filters.dateFrom || filters.dateTo 
                ? 'Nenhuma análise encontrada'
                : 'Nenhuma análise cadastrada'
              }
            </h3>
            <p className="text-[#6374AD] text-sm">
              {filters.search || filters.status || filters.dateFrom || filters.dateTo 
                ? 'Tente ajustar os filtros.'
                : 'Comece criando sua primeira análise.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#374161] to-[#293047]">
                <tr>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs xl:text-sm font-semibold text-white">Nome</th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs xl:text-sm font-semibold text-white">Email</th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs xl:text-sm font-semibold text-white">Fazenda</th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs xl:text-sm font-semibold text-white">Área (ha)</th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs xl:text-sm font-semibold text-white">Status</th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs xl:text-sm font-semibold text-white">Criada em</th>
                  <th className="px-4 xl:px-6 py-3 text-center text-xs xl:text-sm font-semibold text-white">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dbe2ea]">
                {filteredAnalises.map((analise) => (
                  <tr key={analise.id} className="hover:bg-[#eaf0f5] transition-colors">
                    <td className="px-4 xl:px-6 py-3">
                      <div className="text-xs xl:text-sm font-medium text-[#374161]">{analise.nome}</div>
                      {analise.telefone && (
                        <div className="text-xs text-[#6374AD]">{analise.telefone}</div>
                      )}
                    </td>
                    <td className="px-4 xl:px-6 py-3 text-xs xl:text-sm text-[#374161]">{analise.email}</td>
                    <td className="px-4 xl:px-6 py-3 text-xs xl:text-sm text-[#374161]">{analise.nome_fazenda}</td>
                    <td className="px-4 xl:px-6 py-3 text-xs xl:text-sm text-[#374161]">
                      {analise.area_fazenda_ha ? `${analise.area_fazenda_ha} ha` : '-'}
                    </td>
                    <td className="px-4 xl:px-6 py-3">
                      {getStatusBadge(analise.status)}
                    </td>
                    <td className="px-4 xl:px-6 py-3 text-xs xl:text-sm text-[#374161]">{formatDate(analise.created_at)}</td>
                    <td className="px-4 xl:px-6 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditAnalise(analise.id)}
                          className="p-2 text-[#6374AD] hover:bg-[#879FED] hover:text-white rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAnalise(analise.id)}
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
            Mostrando {filteredAnalises.length} de {analises.length} análises
          </p>
        </div>
      </div>

      {/* Tablet Portrait - Grid 2 Colunas */}
      <div className="hidden md:grid lg:hidden grid-cols-2 gap-3">
        {filteredAnalises.length === 0 ? (
          <div className="col-span-2 flex flex-col items-center justify-center py-12 px-4 bg-white rounded-lg shadow-md border border-[#dbe2ea]">
            <FileText className="w-16 h-16 text-[#dbe2ea] mb-4" />
            <h3 className="text-base font-semibold text-[#374161] mb-2">
              {filters.search || filters.status || filters.dateFrom || filters.dateTo 
                ? 'Nenhuma análise encontrada'
                : 'Nenhuma análise cadastrada'
              }
            </h3>
            <p className="text-[#6374AD] text-sm text-center">
              {filters.search || filters.status || filters.dateFrom || filters.dateTo 
                ? 'Tente ajustar os filtros.'
                : 'Comece criando sua primeira análise.'}
            </p>
          </div>
        ) : (
          filteredAnalises.map((analise) => (
            <div
              key={analise.id}
              className="bg-white rounded-lg shadow-md border border-[#dbe2ea] p-3 sm:p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[#374161] truncate">{analise.nome}</h3>
                  {analise.telefone && (
                    <p className="text-xs text-[#6374AD] truncate">{analise.telefone}</p>
                  )}
                </div>
                {getStatusBadge(analise.status)}
              </div>

              <div className="space-y-1 mb-3 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-[#6374AD] font-medium">Email:</span>
                  <span className="text-[#374161] truncate">{analise.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[#6374AD] font-medium">Fazenda:</span>
                  <span className="text-[#374161] truncate">{analise.nome_fazenda}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[#6374AD] font-medium">Área:</span>
                  <span className="text-[#374161]">
                    {analise.area_fazenda_ha ? `${analise.area_fazenda_ha} ha` : '-'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[#6374AD] font-medium">Criada:</span>
                  <span className="text-[#374161]">{formatDate(analise.created_at)}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#dbe2ea]">
                <button
                  onClick={() => handleEditAnalise(analise.id)}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-[#6374AD] text-white rounded-lg hover:bg-[#4d5a8d] transition-colors font-medium"
                >
                  <Edit2 className="w-3 h-3" />
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteAnalise(analise.id)}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] transition-colors font-medium"
                >
                  <Trash2 className="w-3 h-3" />
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mobile - Cards Verticais */}
      <div className="md:hidden space-y-3">
        {filteredAnalises.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-lg shadow-md border border-[#dbe2ea]">
            <FileText className="w-16 h-16 text-[#dbe2ea] mb-4" />
            <h3 className="text-base font-semibold text-[#374161] mb-2 text-center">
              {filters.search || filters.status || filters.dateFrom || filters.dateTo 
                ? 'Nenhuma análise encontrada'
                : 'Nenhuma análise cadastrada'
              }
            </h3>
            <p className="text-[#6374AD] text-sm text-center">
              {filters.search || filters.status || filters.dateFrom || filters.dateTo 
                ? 'Tente ajustar os filtros.'
                : 'Comece criando sua primeira análise.'}
            </p>
          </div>
        ) : (
          filteredAnalises.map((analise) => (
            <div
              key={analise.id}
              className="bg-white rounded-lg shadow-md border border-[#dbe2ea] p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-[#374161] mb-1">{analise.nome}</h3>
                  {analise.telefone && (
                    <p className="text-sm text-[#6374AD]">{analise.telefone}</p>
                  )}
                </div>
                {getStatusBadge(analise.status)}
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div>
                  <span className="text-[#6374AD] font-medium">Email: </span>
                  <span className="text-[#374161]">{analise.email}</span>
                </div>
                <div>
                  <span className="text-[#6374AD] font-medium">Fazenda: </span>
                  <span className="text-[#374161]">{analise.nome_fazenda}</span>
                </div>
                <div>
                  <span className="text-[#6374AD] font-medium">Área: </span>
                  <span className="text-[#374161]">
                    {analise.area_fazenda_ha ? `${analise.area_fazenda_ha} ha` : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[#6374AD] font-medium">Criada em: </span>
                  <span className="text-[#374161]">{formatDate(analise.created_at)}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#dbe2ea]">
                <button
                  onClick={() => handleEditAnalise(analise.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#6374AD] text-white rounded-lg hover:bg-[#4d5a8d] transition-colors font-medium text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteAnalise(analise.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] transition-colors font-medium text-sm"
                >
                  <Trash2 className="w-4 h-4" />
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
