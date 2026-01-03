'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { 
  Bell, 
  CheckCircle2, 
  XCircle, 
  Users, 
  Settings, 
  FileText,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Clock,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { 
  NotificationCategory, 
  NotificationSetting, 
  NotificationFormData,
  NotificationSettingFormData 
} from '@/types/notifications';

export default function NotificationsManager() {
  const {
    categories,
    loadingCategories,
    errorCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    settings,
    loadingSettings,
    errorSettings,
    createSetting,
    updateSetting,
    deleteSetting,
    logs,
    loadingLogs,
    errorLogs,
    fetchLogs,
    adminUsers
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'categories' | 'settings' | 'logs'>('categories');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSettingModal, setShowSettingModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<NotificationCategory | null>(null);
  const [editingSetting, setEditingSetting] = useState<NotificationSetting | null>(null);
  const [isProcessingNotifications, setIsProcessingNotifications] = useState(false);
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para formulários
  const [categoryForm, setCategoryForm] = useState<NotificationFormData>({
    display_name: '',
    description: '',
    email_template_subject: '',
    email_template_body: '',
    is_active: true
  });

  const [settingForm, setSettingForm] = useState<NotificationSettingFormData>({
    user_id: '',
    category_id: '',
    is_enabled: true
  });

  // Estatísticas computadas
  const stats = useMemo(() => {
    const activeCategories = categories.filter(c => c.is_active).length;
    const activeSettings = settings.filter(s => s.is_enabled).length;
    const successfulEmails = logs.filter(l => l.email_sent).length;
    const failedEmails = logs.filter(l => !l.email_sent).length;
    
    return {
      totalCategories: categories.length,
      activeCategories,
      inactiveCategories: categories.length - activeCategories,
      totalSettings: settings.length,
      activeSettings,
      inactiveSettings: settings.length - activeSettings,
      totalLogs: logs.length,
      successfulEmails,
      failedEmails
    };
  }, [categories, settings, logs]);

  // Filtros
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'active' && cat.is_active) ||
        (filterStatus === 'inactive' && !cat.is_active);
      const matchesSearch = cat.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [categories, filterStatus, searchTerm]);

  const filteredSettings = useMemo(() => {
    return settings.filter(setting => {
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'active' && setting.is_enabled) ||
        (filterStatus === 'inactive' && !setting.is_enabled);
      const matchesSearch = setting.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        setting.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        setting.category?.display_name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [settings, filterStatus, searchTerm]);

  // Handlers para categorias
  const handleCreateCategory = useCallback(async () => {
    const success = await createCategory(categoryForm);
    if (success) {
      setShowCategoryModal(false);
      setCategoryForm({
        display_name: '',
        description: '',
        email_template_subject: '',
        email_template_body: '',
        is_active: true
      });
    }
  }, [categoryForm, createCategory]);

  const handleUpdateCategory = useCallback(async () => {
    if (!editingCategory) return;
    
    const success = await updateCategory(editingCategory.id, categoryForm);
    if (success) {
      setShowCategoryModal(false);
      setEditingCategory(null);
      setCategoryForm({
        display_name: '',
        description: '',
        email_template_subject: '',
        email_template_body: '',
        is_active: true
      });
    }
  }, [editingCategory, categoryForm, updateCategory]);

  const handleEditCategory = useCallback((category: NotificationCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      display_name: category.display_name,
      description: category.description || '',
      email_template_subject: category.email_template_subject,
      email_template_body: category.email_template_body,
      is_active: category.is_active
    });
    setShowCategoryModal(true);
  }, []);

  const handleDeleteCategory = useCallback(async (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta categoria?')) {
      await deleteCategory(id);
    }
  }, [deleteCategory]);

  // Handlers para configurações
  const handleCreateSetting = useCallback(async () => {
    const success = await createSetting(settingForm);
    if (success) {
      setShowSettingModal(false);
      setSettingForm({
        user_id: '',
        category_id: '',
        is_enabled: true
      });
    }
  }, [settingForm, createSetting]);

  const handleUpdateSetting = useCallback(async () => {
    if (!editingSetting) return;
    
    const success = await updateSetting(editingSetting.id, settingForm);
    if (success) {
      setShowSettingModal(false);
      setEditingSetting(null);
      setSettingForm({
        user_id: '',
        category_id: '',
        is_enabled: true
      });
    }
  }, [editingSetting, settingForm, updateSetting]);

  const handleEditSetting = useCallback((setting: NotificationSetting) => {
    setEditingSetting(setting);
    setSettingForm({
      user_id: setting.user_id,
      category_id: setting.category_id,
      is_enabled: setting.is_enabled
    });
    setShowSettingModal(true);
  }, []);

  const handleDeleteSetting = useCallback(async (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta configuração?')) {
      await deleteSetting(id);
    }
  }, [deleteSetting]);

  const handleManualNotification = useCallback(async () => {
    setIsProcessingNotifications(true);
    setProcessingMessage(null);
    setProcessingError(null);
    
    try {
      const response = await fetch('/api/process-pending-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        // Recarregar os logs para mostrar as atualizações
        await fetchLogs();
        
        const processedCount = result.processedCount || 0;
        const message = result.message || `Processadas: ${processedCount} notificações`;
        
        setProcessingMessage(message);
        
        // Limpar mensagem após 5 segundos
        setTimeout(() => {
          setProcessingMessage(null);
        }, 5000);
      } else {
        const errorMessage = result.error || result.message || 'Erro desconhecido';
        setProcessingError(errorMessage);
        
        // Limpar erro após 5 segundos
        setTimeout(() => {
          setProcessingError(null);
        }, 5000);
      }
    } catch (error) {
      console.error('Erro ao processar notificações:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setProcessingError(errorMessage);
      
      // Limpar erro após 5 segundos
      setTimeout(() => {
        setProcessingError(null);
      }, 5000);
    } finally {
      setIsProcessingNotifications(false);
    }
  }, [fetchLogs]);

  return (
    <div className="w-full space-y-6 pb-6">
      {/* Tabs Navigation */}
      <div className="bg-white border-b border-[#dbe2ea]">
        <nav className="flex space-x-1 px-4" aria-label="Tabs">
          {[
            { id: 'categories', label: 'Categorias', icon: Bell, count: categories.length },
            { id: 'settings', label: 'Configurações', icon: Settings, count: settings.length },
            { id: 'logs', label: 'Logs', icon: FileText, count: logs.length }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as 'categories' | 'settings' | 'logs');
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className={`
                  flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-[#71b399] text-[#374161] bg-[#eaf0f5]'
                    : 'border-transparent text-[#6374AD] hover:text-[#374161] hover:border-[#dbe2ea]'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                <span className={`
                  ml-1 px-2 py-0.5 rounded-full text-xs font-semibold
                  ${activeTab === tab.id 
                    ? 'bg-[#71b399] text-white' 
                    : 'bg-[#dbe2ea] text-[#374161]'
                  }
                `}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="px-4 sm:px-6">
        {/* CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-[#374161] to-[#293047] rounded-lg p-5 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total de Categorias</p>
                    <p className="text-3xl font-bold mt-1">{stats.totalCategories}</p>
                  </div>
                  <Bell className="w-10 h-10 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#71b399] to-[#6374AD] rounded-lg p-5 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Categorias Ativas</p>
                    <p className="text-3xl font-bold mt-1">{stats.activeCategories}</p>
                  </div>
                  <CheckCircle2 className="w-10 h-10 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#6374AD] to-[#879FED] rounded-lg p-5 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Categorias Inativas</p>
                    <p className="text-3xl font-bold mt-1">{stats.inactiveCategories}</p>
                  </div>
                  <XCircle className="w-10 h-10 opacity-80" />
                </div>
              </div>
            </div>

            {/* Filters and Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-[#dbe2ea] p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  <div className="relative flex-1">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6374AD]" />
                    <input
                      type="text"
                      placeholder="Buscar categorias..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-[#dbe2ea] rounded-lg focus:ring-2 focus:ring-[#71b399] focus:border-transparent text-[#374161]"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                    className="px-4 py-2 border border-[#dbe2ea] rounded-lg focus:ring-2 focus:ring-[#71b399] focus:border-transparent text-[#374161] bg-white"
                  >
                    <option value="all">Todos os Status</option>
                    <option value="active">Apenas Ativas</option>
                    <option value="inactive">Apenas Inativas</option>
                  </select>
                </div>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryForm({
                      display_name: '',
                      description: '',
                      email_template_subject: '',
                      email_template_body: '',
                      is_active: true
                    });
                    setShowCategoryModal(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#71b399] text-white rounded-lg hover:bg-[#6374AD] transition-colors font-medium shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Nova Categoria
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorCategories && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Erro ao carregar categorias</p>
                  <p className="text-sm mt-1">{errorCategories}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loadingCategories ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#dbe2ea] border-t-[#71b399]"></div>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-[#dbe2ea] overflow-hidden">
                  <table className="min-w-full divide-y divide-[#dbe2ea]">
                    <thead className="bg-gradient-to-r from-[#374161] to-[#293047]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          Categoria
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          Descrição
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          Assunto do Email
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#dbe2ea]">
                      {filteredCategories.map((category) => (
                        <tr key={category.id} className="hover:bg-[#eaf0f5] transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Bell className="w-4 h-4 text-[#6374AD]" />
                              <span className="text-sm font-medium text-[#374161]">
                                {category.display_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-[#6374AD] line-clamp-2">
                              {category.description || 'Sem descrição'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-[#6374AD]">
                              {category.email_template_subject}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              category.is_active
                                ? 'bg-[#71b399] text-white'
                                : 'bg-[#FEE2E2] text-[#EF4444] border border-[#FECACA]'
                            }`}>
                              {category.is_active ? 'Ativa' : 'Inativa'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditCategory(category)}
                                className="p-2 text-[#6374AD] hover:bg-[#eaf0f5] rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category.id)}
                                className="p-2 text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors"
                                title="Deletar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredCategories.length === 0 && (
                    <div className="text-center py-12 text-[#6374AD]">
                      <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhuma categoria encontrada</p>
                    </div>
                  )}
                </div>

                {/* Tablet View - 2 Column Grid */}
                <div className="hidden md:grid lg:hidden grid-cols-2 gap-4">
                  {filteredCategories.map((category) => (
                    <div
                      key={category.id}
                      className="bg-white rounded-lg shadow-sm border border-[#dbe2ea] p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-[#6374AD] flex-shrink-0" />
                          <h3 className="font-semibold text-[#374161] text-sm line-clamp-1">
                            {category.display_name}
                          </h3>
                        </div>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          category.is_active
                            ? 'bg-[#71b399] text-white'
                            : 'bg-[#FEE2E2] text-[#EF4444] border border-[#FECACA]'
                        }`}>
                          {category.is_active ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                      <p className="text-xs text-[#6374AD] mb-2 line-clamp-2">
                        {category.description || 'Sem descrição'}
                      </p>
                      <p className="text-xs text-[#879FED] mb-3 line-clamp-1">
                        <strong>Assunto:</strong> {category.email_template_subject}
                      </p>
                      <div className="flex items-center gap-2 pt-3 border-t border-[#dbe2ea]">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-[#6374AD] bg-[#eaf0f5] hover:bg-[#dbe2ea] rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-[#EF4444] bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Deletar
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredCategories.length === 0 && (
                    <div className="col-span-2 text-center py-12 text-[#6374AD]">
                      <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhuma categoria encontrada</p>
                    </div>
                  )}
                </div>

                {/* Mobile View - Single Column */}
                <div className="md:hidden space-y-3">
                  {filteredCategories.map((category) => (
                    <div
                      key={category.id}
                      className="bg-white rounded-lg shadow-sm border border-[#dbe2ea] p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-1">
                          <Bell className="w-5 h-5 text-[#6374AD] flex-shrink-0" />
                          <h3 className="font-semibold text-[#374161] text-sm">
                            {category.display_name}
                          </h3>
                        </div>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                          category.is_active
                            ? 'bg-[#71b399] text-white'
                            : 'bg-[#FEE2E2] text-[#EF4444] border border-[#FECACA]'
                        }`}>
                          {category.is_active ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                      <p className="text-xs text-[#6374AD] mb-2">
                        {category.description || 'Sem descrição'}
                      </p>
                      <p className="text-xs text-[#879FED] mb-3">
                        <strong>Assunto:</strong> {category.email_template_subject}
                      </p>
                      <div className="flex items-center gap-2 pt-3 border-t border-[#dbe2ea]">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-[#6374AD] bg-[#eaf0f5] hover:bg-[#dbe2ea] rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-[#EF4444] bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Deletar
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredCategories.length === 0 && (
                    <div className="text-center py-12 text-[#6374AD]">
                      <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Nenhuma categoria encontrada</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-[#374161] to-[#293047] rounded-lg p-5 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total de Configurações</p>
                    <p className="text-3xl font-bold mt-1">{stats.totalSettings}</p>
                  </div>
                  <Settings className="w-10 h-10 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#71b399] to-[#6374AD] rounded-lg p-5 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Notificações Ativas</p>
                    <p className="text-3xl font-bold mt-1">{stats.activeSettings}</p>
                  </div>
                  <CheckCircle2 className="w-10 h-10 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#6374AD] to-[#879FED] rounded-lg p-5 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Notificações Inativas</p>
                    <p className="text-3xl font-bold mt-1">{stats.inactiveSettings}</p>
                  </div>
                  <XCircle className="w-10 h-10 opacity-80" />
                </div>
              </div>
            </div>

            {/* Filters and Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-[#dbe2ea] p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  <div className="relative flex-1">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6374AD]" />
                    <input
                      type="text"
                      placeholder="Buscar configurações..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-[#dbe2ea] rounded-lg focus:ring-2 focus:ring-[#71b399] focus:border-transparent text-[#374161]"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                    className="px-4 py-2 border border-[#dbe2ea] rounded-lg focus:ring-2 focus:ring-[#71b399] focus:border-transparent text-[#374161] bg-white"
                  >
                    <option value="all">Todos os Status</option>
                    <option value="active">Apenas Ativas</option>
                    <option value="inactive">Apenas Inativas</option>
                  </select>
                </div>
                <button
                  onClick={() => {
                    setEditingSetting(null);
                    setSettingForm({
                      user_id: '',
                      category_id: '',
                      is_enabled: true
                    });
                    setShowSettingModal(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#71b399] text-white rounded-lg hover:bg-[#6374AD] transition-colors font-medium shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Nova Configuração
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorSettings && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Erro ao carregar configurações</p>
                  <p className="text-sm mt-1">{errorSettings}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loadingSettings ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#dbe2ea] border-t-[#71b399]"></div>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-[#dbe2ea] overflow-hidden">
                  <table className="min-w-full divide-y divide-[#dbe2ea]">
                    <thead className="bg-gradient-to-r from-[#374161] to-[#293047]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          Usuário
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          Categoria
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#dbe2ea]">
                      {filteredSettings.map((setting) => (
                        <tr key={setting.id} className="hover:bg-[#eaf0f5] transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-[#6374AD]" />
                              <span className="text-sm font-medium text-[#374161]">
                                {setting.user?.name || 'Usuário não encontrado'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-[#6374AD]">
                              {setting.user?.email || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-[#6374AD]">
                              {setting.category?.display_name || 'Categoria não encontrada'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              setting.is_enabled
                                ? 'bg-[#71b399] text-white'
                                : 'bg-[#FEE2E2] text-[#EF4444] border border-[#FECACA]'
                            }`}>
                              {setting.is_enabled ? 'Ativa' : 'Inativa'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditSetting(setting)}
                                className="p-2 text-[#6374AD] hover:bg-[#eaf0f5] rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSetting(setting.id)}
                                className="p-2 text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors"
                                title="Deletar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredSettings.length === 0 && (
                    <div className="text-center py-12 text-[#6374AD]">
                      <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhuma configuração encontrada</p>
                    </div>
                  )}
                </div>

                {/* Tablet View - 2 Column Grid */}
                <div className="hidden md:grid lg:hidden grid-cols-2 gap-4">
                  {filteredSettings.map((setting) => (
                    <div
                      key={setting.id}
                      className="bg-white rounded-lg shadow-sm border border-[#dbe2ea] p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-[#6374AD] flex-shrink-0" />
                          <h3 className="font-semibold text-[#374161] text-sm line-clamp-1">
                            {setting.user?.name || 'Usuário não encontrado'}
                          </h3>
                        </div>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          setting.is_enabled
                            ? 'bg-[#71b399] text-white'
                            : 'bg-[#FEE2E2] text-[#EF4444] border border-[#FECACA]'
                        }`}>
                          {setting.is_enabled ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                      <p className="text-xs text-[#6374AD] mb-2">
                        <strong>Email:</strong> {setting.user?.email || 'N/A'}
                      </p>
                      <p className="text-xs text-[#879FED] mb-3">
                        <strong>Categoria:</strong> {setting.category?.display_name || 'Categoria não encontrada'}
                      </p>
                      <div className="flex items-center gap-2 pt-3 border-t border-[#dbe2ea]">
                        <button
                          onClick={() => handleEditSetting(setting)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-[#6374AD] bg-[#eaf0f5] hover:bg-[#dbe2ea] rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteSetting(setting.id)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-[#EF4444] bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Deletar
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredSettings.length === 0 && (
                    <div className="col-span-2 text-center py-12 text-[#6374AD]">
                      <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhuma configuração encontrada</p>
                    </div>
                  )}
                </div>

                {/* Mobile View - Single Column */}
                <div className="md:hidden space-y-3">
                  {filteredSettings.map((setting) => (
                    <div
                      key={setting.id}
                      className="bg-white rounded-lg shadow-sm border border-[#dbe2ea] p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-1">
                          <Users className="w-5 h-5 text-[#6374AD] flex-shrink-0" />
                          <h3 className="font-semibold text-[#374161] text-sm">
                            {setting.user?.name || 'Usuário não encontrado'}
                          </h3>
                        </div>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                          setting.is_enabled
                            ? 'bg-[#71b399] text-white'
                            : 'bg-[#FEE2E2] text-[#EF4444] border border-[#FECACA]'
                        }`}>
                          {setting.is_enabled ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                      <p className="text-xs text-[#6374AD] mb-2">
                        <strong>Email:</strong> {setting.user?.email || 'N/A'}
                      </p>
                      <p className="text-xs text-[#879FED] mb-3">
                        <strong>Categoria:</strong> {setting.category?.display_name || 'Categoria não encontrada'}
                      </p>
                      <div className="flex items-center gap-2 pt-3 border-t border-[#dbe2ea]">
                        <button
                          onClick={() => handleEditSetting(setting)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-[#6374AD] bg-[#eaf0f5] hover:bg-[#dbe2ea] rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteSetting(setting.id)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-[#EF4444] bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Deletar
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredSettings.length === 0 && (
                    <div className="text-center py-12 text-[#6374AD]">
                      <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Nenhuma configuração encontrada</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* LOGS TAB */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-[#374161] to-[#293047] rounded-lg p-5 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total de Logs</p>
                    <p className="text-3xl font-bold mt-1">{stats.totalLogs}</p>
                  </div>
                  <FileText className="w-10 h-10 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#71b399] to-[#6374AD] rounded-lg p-5 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Emails Enviados</p>
                    <p className="text-3xl font-bold mt-1">{stats.successfulEmails}</p>
                  </div>
                  <CheckCircle2 className="w-10 h-10 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#EF4444] to-[#DC2626] rounded-lg p-5 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Erros de Envio</p>
                    <p className="text-3xl font-bold mt-1">{stats.failedEmails}</p>
                  </div>
                  <XCircle className="w-10 h-10 opacity-80" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-[#dbe2ea] p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-[#374161] font-medium">
                    Sistema de Notificações por Email
                  </p>
                  <p className="text-xs text-[#6374AD] mt-1">
                    As notificações são processadas automaticamente quando novas mensagens ou análises são criadas. Use o botão abaixo para processar manualmente as notificações pendentes.
                  </p>
                </div>
                <button
                  onClick={handleManualNotification}
                  disabled={isProcessingNotifications}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#71b399] text-white rounded-lg hover:bg-[#6374AD] transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isProcessingNotifications ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Notificação Manual
                    </>
                  )}
                </button>
              </div>
              
              {/* Mensagens de processamento */}
              {processingMessage && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">Sucesso</p>
                    <p className="text-sm text-green-700 mt-1">{processingMessage}</p>
                  </div>
                </div>
              )}
              
              {processingError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">Erro ao processar</p>
                    <p className="text-sm text-red-700 mt-1">{processingError}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorLogs && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Erro ao carregar logs</p>
                  <p className="text-sm mt-1">{errorLogs}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loadingLogs ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#dbe2ea] border-t-[#71b399]"></div>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-[#dbe2ea] overflow-hidden">
                  <table className="min-w-full divide-y divide-[#dbe2ea]">
                    <thead className="bg-gradient-to-r from-[#374161] to-[#293047]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          Categoria
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          Destinatário
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          Detalhes
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                          Data/Hora
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#dbe2ea]">
                      {logs.slice(0, 50).map((log) => (
                        <tr key={log.id} className="hover:bg-[#eaf0f5] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Bell className="w-4 h-4 text-[#6374AD]" />
                              <span className="text-sm font-medium text-[#374161]">
                                {log.category?.display_name || 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="font-medium text-[#374161]">
                                {log.user?.name || 'N/A'}
                              </p>
                              <p className="text-xs text-[#6374AD]">
                                {log.user?.email || 'N/A'}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-[#6374AD]">
                              <p><strong>Tipo:</strong> {log.entity_type}</p>
                              <p><strong>ID:</strong> {log.entity_id}</p>
                              {log.email_error && log.email_error !== 'Processando...' && (
                                <p className="text-[#EF4444] mt-1">
                                  <strong>Erro:</strong> {log.email_error}
                                </p>
                              )}
                              {log.email_error === 'Processando...' && (
                                <p className="text-[#6374AD] mt-1">
                                  <strong>Status:</strong> Processando...
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              log.email_sent
                                ? 'bg-[#71b399] text-white'
                                : 'bg-[#FEE2E2] text-[#EF4444] border border-[#FECACA]'
                            }`}>
                              {log.email_sent ? 'Enviado' : 'Erro'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="text-xs text-[#6374AD]">
                              {log.created_at ? new Date(log.created_at).toLocaleString('pt-BR') : 'N/A'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {logs.length === 0 && (
                    <div className="text-center py-12 text-[#6374AD]">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhum log encontrado</p>
                    </div>
                  )}
                </div>

                {/* Tablet View - 2 Column Grid */}
                <div className="hidden md:grid lg:hidden grid-cols-2 gap-4">
                  {logs.slice(0, 50).map((log) => (
                    <div
                      key={log.id}
                      className="bg-white rounded-lg shadow-sm border border-[#dbe2ea] p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-[#6374AD] flex-shrink-0" />
                          <h3 className="font-semibold text-[#374161] text-sm line-clamp-1">
                            {log.category?.display_name || 'N/A'}
                          </h3>
                        </div>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          log.email_sent
                            ? 'bg-[#71b399] text-white'
                            : 'bg-[#FEE2E2] text-[#EF4444] border border-[#FECACA]'
                        }`}>
                          {log.email_sent ? 'Enviado' : 'Erro'}
                        </span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <p className="text-[#374161]">
                          <strong>Para:</strong> {log.user?.name || 'N/A'}
                        </p>
                        <p className="text-[#6374AD]">
                          {log.user?.email || 'N/A'}
                        </p>
                        <p className="text-[#6374AD]">
                          <strong>Tipo:</strong> {log.entity_type}
                        </p>
                        {log.email_error && log.email_error !== 'Processando...' && (
                          <p className="text-[#EF4444]">
                            <strong>Erro:</strong> {log.email_error}
                          </p>
                        )}
                        {log.email_error === 'Processando...' && (
                          <p className="text-[#6374AD]">
                            <strong>Status:</strong> Processando...
                          </p>
                        )}
                        <p className="text-[#879FED] pt-2 border-t border-[#dbe2ea]">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {log.created_at ? new Date(log.created_at).toLocaleString('pt-BR') : 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="col-span-2 text-center py-12 text-[#6374AD]">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhum log encontrado</p>
                    </div>
                  )}
                </div>

                {/* Mobile View - Single Column */}
                <div className="md:hidden space-y-3">
                  {logs.slice(0, 50).map((log) => (
                    <div
                      key={log.id}
                      className="bg-white rounded-lg shadow-sm border border-[#dbe2ea] p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-1">
                          <Bell className="w-5 h-5 text-[#6374AD] flex-shrink-0" />
                          <h3 className="font-semibold text-[#374161] text-sm">
                            {log.category?.display_name || 'N/A'}
                          </h3>
                        </div>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                          log.email_sent
                            ? 'bg-[#71b399] text-white'
                            : 'bg-[#FEE2E2] text-[#EF4444] border border-[#FECACA]'
                        }`}>
                          {log.email_sent ? 'Enviado' : 'Erro'}
                        </span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <p className="text-[#374161]">
                          <strong>Para:</strong> {log.user?.name || 'N/A'}
                        </p>
                        <p className="text-[#6374AD]">
                          {log.user?.email || 'N/A'}
                        </p>
                        <p className="text-[#6374AD]">
                          <strong>Tipo:</strong> {log.entity_type}
                        </p>
                        {log.email_error && log.email_error !== 'Processando...' && (
                          <p className="text-[#EF4444]">
                            <strong>Erro:</strong> {log.email_error}
                          </p>
                        )}
                        {log.email_error === 'Processando...' && (
                          <p className="text-[#6374AD]">
                            <strong>Status:</strong> Processando...
                          </p>
                        )}
                        <p className="text-[#879FED] pt-2 border-t border-[#dbe2ea]">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {log.created_at ? new Date(log.created_at).toLocaleString('pt-BR') : 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="text-center py-12 text-[#6374AD]">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Nenhum log encontrado</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal de Categoria */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-[#374161] to-[#293047] px-6 py-4 rounded-t-lg">
              <h3 className="text-xl font-semibold text-white">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Formulário */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#374161] mb-2">
                      Nome da Categoria *
                    </label>
                    <input
                      type="text"
                      value={categoryForm.display_name}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, display_name: e.target.value }))}
                      className="w-full px-4 py-2 border border-[#dbe2ea] rounded-lg focus:ring-2 focus:ring-[#71b399] focus:border-transparent text-[#374161]"
                      placeholder="Ex: Notificações de Novas Mensagens"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#374161] mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2 border border-[#dbe2ea] rounded-lg focus:ring-2 focus:ring-[#71b399] focus:border-transparent text-[#374161]"
                      placeholder="Descreva quando esta notificação será enviada"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#374161] mb-2">
                      Assunto do Email *
                    </label>
                    <input
                      type="text"
                      value={categoryForm.email_template_subject}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, email_template_subject: e.target.value }))}
                      className="w-full px-4 py-2 border border-[#dbe2ea] rounded-lg focus:ring-2 focus:ring-[#71b399] focus:border-transparent text-[#374161]"
                      placeholder="Ex: Nova mensagem recebida - Sicoop"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#374161] mb-2">
                      Corpo do Email *
                    </label>
                    <textarea
                      value={categoryForm.email_template_body}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, email_template_body: e.target.value }))}
                      rows={6}
                      className="w-full px-4 py-2 border border-[#dbe2ea] rounded-lg focus:ring-2 focus:ring-[#71b399] focus:border-transparent text-[#374161] font-mono text-sm"
                      placeholder="Use {{variavel}} para variáveis dinâmicas"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={categoryForm.is_active}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="w-4 h-4 text-[#71b399] focus:ring-[#71b399] border-[#dbe2ea] rounded"
                    />
                    <label htmlFor="is_active" className="text-sm text-[#374161] font-medium">
                      Categoria ativa
                    </label>
                  </div>
                </div>

                {/* Ajuda */}
                <div className="space-y-4">
                  <div className="bg-[#eaf0f5] border border-[#dbe2ea] rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-[#374161] mb-3 flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Variáveis Disponíveis
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="bg-white border border-[#dbe2ea] rounded p-3">
                        <h5 className="text-xs font-semibold text-[#374161] mb-2">Para Mensagens:</h5>
                        <div className="text-xs text-[#6374AD] space-y-1">
                          <div><code className="bg-[#eaf0f5] px-1.5 py-0.5 rounded">{'{{nome}}'}</code> - Nome do remetente</div>
                          <div><code className="bg-[#eaf0f5] px-1.5 py-0.5 rounded">{'{{email}}'}</code> - Email do remetente</div>
                          <div><code className="bg-[#eaf0f5] px-1.5 py-0.5 rounded">{'{{empresa_fazenda}}'}</code> - Empresa/Fazenda</div>
                          <div><code className="bg-[#eaf0f5] px-1.5 py-0.5 rounded">{'{{mensagem}}'}</code> - Conteúdo</div>
                          <div><code className="bg-[#eaf0f5] px-1.5 py-0.5 rounded">{'{{status}}'}</code> - Status</div>
                        </div>
                      </div>
                      
                      <div className="bg-white border border-[#dbe2ea] rounded p-3">
                        <h5 className="text-xs font-semibold text-[#374161] mb-2">Para Análises:</h5>
                        <div className="text-xs text-[#6374AD] space-y-1">
                          <div><code className="bg-[#eaf0f5] px-1.5 py-0.5 rounded">{'{{nome}}'}</code> - Nome do solicitante</div>
                          <div><code className="bg-[#eaf0f5] px-1.5 py-0.5 rounded">{'{{email}}'}</code> - Email</div>
                          <div><code className="bg-[#eaf0f5] px-1.5 py-0.5 rounded">{'{{nome_fazenda}}'}</code> - Nome da fazenda</div>
                          <div><code className="bg-[#eaf0f5] px-1.5 py-0.5 rounded">{'{{area_fazenda_ha}}'}</code> - Área em ha</div>
                          <div><code className="bg-[#eaf0f5] px-1.5 py-0.5 rounded">{'{{status}}'}</code> - Status</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#71b399] bg-opacity-10 border border-[#71b399] rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-[#374161] mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Dicas de Formatação
                    </h4>
                    <ul className="text-xs text-[#6374AD] space-y-1">
                      <li>• Use <code className="bg-white px-1.5 py-0.5 rounded">{'\\n'}</code> para quebras de linha</li>
                      <li>• O texto será convertido para HTML automaticamente</li>
                      <li>• Mantenha o texto claro e objetivo</li>
                      <li>• Inclua sempre um link para acessar o sistema</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-[#dbe2ea]">
                <button
                  onClick={() => {
                    setShowCategoryModal(false);
                    setEditingCategory(null);
                  }}
                  className="px-6 py-2 bg-[#dbe2ea] text-[#374161] rounded-lg hover:bg-[#6374AD] hover:text-white transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                  className="px-6 py-2 bg-[#71b399] text-white rounded-lg hover:bg-[#6374AD] transition-colors font-medium shadow-sm"
                >
                  {editingCategory ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuração */}
      {showSettingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="bg-gradient-to-r from-[#374161] to-[#293047] px-6 py-4 rounded-t-lg">
              <h3 className="text-xl font-semibold text-white">
                {editingSetting ? 'Editar Configuração' : 'Nova Configuração'}
              </h3>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#374161] mb-2">
                      Usuário Administrador *
                    </label>
                    <select
                      value={settingForm.user_id}
                      onChange={(e) => setSettingForm(prev => ({ ...prev, user_id: e.target.value }))}
                      className="w-full px-4 py-2 border border-[#dbe2ea] rounded-lg focus:ring-2 focus:ring-[#71b399] focus:border-transparent text-[#374161] bg-white"
                    >
                      <option value="">Selecione um usuário</option>
                      {adminUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#374161] mb-2">
                      Categoria de Notificação *
                    </label>
                    <select
                      value={settingForm.category_id}
                      onChange={(e) => setSettingForm(prev => ({ ...prev, category_id: e.target.value }))}
                      className="w-full px-4 py-2 border border-[#dbe2ea] rounded-lg focus:ring-2 focus:ring-[#71b399] focus:border-transparent text-[#374161] bg-white"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.filter(c => c.is_active).map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.display_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="is_enabled"
                      checked={settingForm.is_enabled}
                      onChange={(e) => setSettingForm(prev => ({ ...prev, is_enabled: e.target.checked }))}
                      className="w-4 h-4 text-[#71b399] focus:ring-[#71b399] border-[#dbe2ea] rounded"
                    />
                    <label htmlFor="is_enabled" className="text-sm text-[#374161] font-medium">
                      Notificação ativa
                    </label>
                  </div>
                </div>

                <div className="bg-[#eaf0f5] border border-[#dbe2ea] rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-[#374161] mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Informações
                  </h4>
                  <div className="text-xs text-[#6374AD] space-y-3">
                    <p>
                      <strong className="text-[#374161]">Usuário:</strong> Selecione qual administrador receberá esta notificação.
                    </p>
                    <p>
                      <strong className="text-[#374161]">Categoria:</strong> Escolha o tipo de notificação (mensagens, análises, etc.).
                    </p>
                    <p>
                      <strong className="text-[#374161]">Ativa:</strong> Quando marcada, o usuário receberá emails desta categoria.
                    </p>
                    <div className="mt-3 p-3 bg-white border border-[#dbe2ea] rounded">
                      <p className="text-xs font-medium text-[#374161] mb-1">💡 Dica:</p>
                      <p className="text-xs text-[#6374AD]">
                        Você pode configurar múltiplas notificações para o mesmo usuário, 
                        permitindo que ele receba diferentes tipos de alertas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-[#dbe2ea]">
                <button
                  onClick={() => {
                    setShowSettingModal(false);
                    setEditingSetting(null);
                  }}
                  className="px-6 py-2 bg-[#dbe2ea] text-[#374161] rounded-lg hover:bg-[#6374AD] hover:text-white transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={editingSetting ? handleUpdateSetting : handleCreateSetting}
                  className="px-6 py-2 bg-[#71b399] text-white rounded-lg hover:bg-[#6374AD] transition-colors font-medium shadow-sm"
                >
                  {editingSetting ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
