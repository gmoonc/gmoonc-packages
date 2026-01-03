import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  NotificationCategory, 
  NotificationSetting, 
  NotificationLog, 
  NotificationFormData,
  NotificationSettingFormData,
  SupabaseNotificationCategory,
  convertSupabaseCategory,
  RawSupabaseSetting,
  convertRawSupabaseSetting
} from '@/types/notifications';

interface UseNotificationsReturn {
  // Categorias
  categories: NotificationCategory[];
  loadingCategories: boolean;
  errorCategories: string | null;
  fetchCategories: () => Promise<void>;
  createCategory: (data: NotificationFormData) => Promise<boolean>;
  updateCategory: (id: string, data: Partial<NotificationFormData>) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;

  // Configurações
  settings: NotificationSetting[];
  loadingSettings: boolean;
  errorSettings: string | null;
  fetchSettings: () => Promise<void>;
  createSetting: (data: NotificationSettingFormData) => Promise<boolean>;
  updateSetting: (id: string, data: Partial<NotificationSettingFormData>) => Promise<boolean>;
  deleteSetting: (id: string) => Promise<boolean>;

  // Logs
  logs: NotificationLog[];
  loadingLogs: boolean;
  errorLogs: string | null;
  fetchLogs: () => Promise<void>;
  processPendingNotifications: () => Promise<boolean>;

  // Usuários administradores
  adminUsers: Array<{ id: string; name: string; email: string; role: string }>;
  loadingUsers: boolean;
  fetchAdminUsers: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth();
  
  // Estados para categorias
  const [categories, setCategories] = useState<NotificationCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);

  // Estados para configurações
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [errorSettings, setErrorSettings] = useState<string | null>(null);

  // Estados para logs
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [errorLogs, setErrorLogs] = useState<string | null>(null);

  // Estados para usuários
  const [adminUsers, setAdminUsers] = useState<Array<{ id: string; name: string; email: string; role: string }>>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Buscar categorias
  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      setErrorCategories(null);

      const { data, error } = await supabase
        .from('notification_categories')
        .select('*')
        .order('display_name');

      if (error) throw error;
      const convertedData = (data as SupabaseNotificationCategory[]).map(convertSupabaseCategory);
      setCategories(convertedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar categorias';
      setErrorCategories(errorMessage);
      console.error('Erro ao buscar categorias:', err);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  // Criar categoria
  const createCategory = useCallback(async (data: NotificationFormData): Promise<boolean> => {
    try {
      setErrorCategories(null);

      const { error } = await supabase
        .from('notification_categories')
        .insert([{
          name: data.display_name.toLowerCase().replace(/\s+/g, '_'),
          display_name: data.display_name,
          description: data.description,
          email_template_subject: data.email_template_subject,
          email_template_body: data.email_template_body,
          is_active: data.is_active
        }]);

      if (error) throw error;

      await fetchCategories();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar categoria';
      setErrorCategories(errorMessage);
      console.error('Erro ao criar categoria:', err);
      return false;
    }
  }, [fetchCategories]);

  // Atualizar categoria
  const updateCategory = useCallback(async (id: string, data: Partial<NotificationFormData>): Promise<boolean> => {
    try {
      setErrorCategories(null);

      const updateData: Partial<NotificationCategory> = { ...data };
      if (data.display_name) {
        updateData.name = data.display_name.toLowerCase().replace(/\s+/g, '_');
      }

      const { error } = await supabase
        .from('notification_categories')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      await fetchCategories();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar categoria';
      setErrorCategories(errorMessage);
      console.error('Erro ao atualizar categoria:', err);
      return false;
    }
  }, [fetchCategories]);

  // Deletar categoria
  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    try {
      setErrorCategories(null);

      const { error } = await supabase
        .from('notification_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchCategories();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar categoria';
      setErrorCategories(errorMessage);
      console.error('Erro ao deletar categoria:', err);
      return false;
    }
  }, [fetchCategories]);

  // Buscar configurações
  const fetchSettings = useCallback(async () => {
    try {
      setLoadingSettings(true);
      setErrorSettings(null);

      const { data, error } = await supabase
        .from('notification_settings')
        .select(`
          *,
          user:profiles(id, name, email, role),
          category:notification_categories(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Converter dados do Supabase, tratando erros de relacionamento
      const convertedData = (data as RawSupabaseSetting[]).map(convertRawSupabaseSetting);
      setSettings(convertedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar configurações';
      setErrorSettings(errorMessage);
      console.error('Erro ao buscar configurações:', err);
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  // Criar configuração
  const createSetting = useCallback(async (data: NotificationSettingFormData): Promise<boolean> => {
    try {
      setErrorSettings(null);

      const { error } = await supabase
        .from('notification_settings')
        .insert([data]);

      if (error) throw error;

      await fetchSettings();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar configuração';
      setErrorSettings(errorMessage);
      console.error('Erro ao criar configuração:', err);
      return false;
    }
  }, [fetchSettings]);

  // Atualizar configuração
  const updateSetting = useCallback(async (id: string, data: Partial<NotificationSettingFormData>): Promise<boolean> => {
    try {
      setErrorSettings(null);

      const { error } = await supabase
        .from('notification_settings')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      await fetchSettings();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar configuração';
      setErrorSettings(errorMessage);
      console.error('Erro ao atualizar configuração:', err);
      return false;
    }
  }, [fetchSettings]);

  // Deletar configuração
  const deleteSetting = useCallback(async (id: string): Promise<boolean> => {
    try {
      setErrorSettings(null);

      const { error } = await supabase
        .from('notification_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchSettings();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar configuração';
      setErrorSettings(errorMessage);
      console.error('Erro ao deletar configuração:', err);
      return false;
    }
  }, [fetchSettings]);

  // Buscar logs
  const fetchLogs = useCallback(async () => {
    try {
      setLoadingLogs(true);
      setErrorLogs(null);

      const { data, error } = await supabase
        .from('notification_logs')
        .select(`
          *,
          category:notification_categories(*),
          user:profiles(id, name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs((data as unknown as NotificationLog[]) || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar logs';
      setErrorLogs(errorMessage);
      console.error('Erro ao buscar logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  // Processar notificações pendentes
  const processPendingNotifications = useCallback(async (): Promise<boolean> => {
    try {
      setErrorLogs(null);

      const { error } = await supabase.rpc('process_pending_notifications');

      if (error) throw error;

      await fetchLogs();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar notificações';
      setErrorLogs(errorMessage);
      console.error('Erro ao processar notificações:', err);
      return false;
    }
  }, [fetchLogs]);

  // Buscar usuários administradores
  const fetchAdminUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role')
        .eq('role', 'administrador')
        .order('name');

      if (error) throw error;
      const convertedUsers = (data || []).map((user: unknown) => {
        const userData = user as { id: string; name: string; email: string; role: string | null };
        return {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role ?? 'user'
        };
      });
      setAdminUsers(convertedUsers);
    } catch (err) {
      console.error('Erro ao buscar usuários administradores:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    if (user) {
      fetchCategories();
      fetchSettings();
      fetchLogs();
      fetchAdminUsers();
    }
  }, [user, fetchCategories, fetchSettings, fetchLogs, fetchAdminUsers]);

  return {
    // Categorias
    categories,
    loadingCategories,
    errorCategories,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,

    // Configurações
    settings,
    loadingSettings,
    errorSettings,
    fetchSettings,
    createSetting,
    updateSetting,
    deleteSetting,

    // Logs
    logs,
    loadingLogs,
    errorLogs,
    fetchLogs,
    processPendingNotifications,

    // Usuários
    adminUsers,
    loadingUsers,
    fetchAdminUsers
  };
}
