import { useState, useCallback, useEffect } from 'react';
import { useGMooncSession } from '../session/GMooncSessionContext';

export interface GMooncNotificationCategory {
  id: string;
  display_name: string;
  description: string | null;
  email_template_subject: string;
  email_template_body: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface GMooncNotificationSetting {
  id: string;
  user_id: string;
  category_id: string;
  is_enabled: boolean;
  user?: { id: string; name: string; email: string };
  category?: GMooncNotificationCategory;
}

export interface GMooncNotificationLog {
  id: string;
  user_id: string;
  category_id: string;
  entity_type: string;
  entity_id: string;
  email_sent: boolean;
  email_error: string | null;
  created_at: string;
  user?: { id: string; name: string; email: string };
  category?: GMooncNotificationCategory;
}

interface UseGMooncNotificationsReturn {
  categories: GMooncNotificationCategory[];
  settings: GMooncNotificationSetting[];
  logs: GMooncNotificationLog[];
  loadingCategories: boolean;
  loadingSettings: boolean;
  loadingLogs: boolean;
  errorCategories: string | null;
  errorSettings: string | null;
  errorLogs: string | null;
  createCategory: (data: Omit<GMooncNotificationCategory, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateCategory: (id: string, data: Partial<GMooncNotificationCategory>) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  createSetting: (data: Omit<GMooncNotificationSetting, 'id' | 'user' | 'category'>) => Promise<boolean>;
  updateSetting: (id: string, data: Partial<GMooncNotificationSetting>) => Promise<boolean>;
  deleteSetting: (id: string) => Promise<boolean>;
  fetchLogs: () => Promise<void>;
  adminUsers: Array<{ id: string; name: string; email: string }>;
}

// Mock data
let mockCategories: GMooncNotificationCategory[] = [
  {
    id: '1',
    display_name: 'New Message',
    description: 'Notification when a new message is created',
    email_template_subject: 'New Message',
    email_template_body: 'A new message has been created.',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: null
  }
];

let mockSettings: GMooncNotificationSetting[] = [];
let mockLogs: GMooncNotificationLog[] = [];

export function useGMooncNotifications(): UseGMooncNotificationsReturn {
  const { user } = useGMooncSession();
  const [categories, setCategories] = useState<GMooncNotificationCategory[]>([]);
  const [settings, setSettings] = useState<GMooncNotificationSetting[]>([]);
  const [logs, setLogs] = useState<GMooncNotificationLog[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);
  const [errorSettings, setErrorSettings] = useState<string | null>(null);
  const [errorLogs, setErrorLogs] = useState<string | null>(null);

  const adminUsers = [
    { id: '1', name: 'Admin User', email: 'admin@gmoonc.com' }
  ];

  const fetchCategories = useCallback(async () => {
    if (!user) return;

    try {
      setLoadingCategories(true);
      setErrorCategories(null);
      await new Promise(resolve => setTimeout(resolve, 300));
      setCategories([...mockCategories]);
    } catch (err) {
      setErrorCategories(err instanceof Error ? err.message : 'Error fetching categories');
    } finally {
      setLoadingCategories(false);
    }
  }, [user]);

  const fetchSettings = useCallback(async () => {
    if (!user) return;

    try {
      setLoadingSettings(true);
      setErrorSettings(null);
      await new Promise(resolve => setTimeout(resolve, 300));
      setSettings([...mockSettings]);
    } catch (err) {
      setErrorSettings(err instanceof Error ? err.message : 'Error fetching settings');
    } finally {
      setLoadingSettings(false);
    }
  }, [user]);

  const fetchLogs = useCallback(async () => {
    if (!user) return;

    try {
      setLoadingLogs(true);
      setErrorLogs(null);
      await new Promise(resolve => setTimeout(resolve, 300));
      setLogs([...mockLogs]);
    } catch (err) {
      setErrorLogs(err instanceof Error ? err.message : 'Error fetching logs');
    } finally {
      setLoadingLogs(false);
    }
  }, [user]);

  const createCategory = useCallback(async (data: Omit<GMooncNotificationCategory, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoadingCategories(true);
      const newCategory: GMooncNotificationCategory = {
        ...data,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: null
      };
      mockCategories.push(newCategory);
      setCategories([...mockCategories]);
      return true;
    } catch (err) {
      setErrorCategories(err instanceof Error ? err.message : 'Error creating category');
      return false;
    } finally {
      setLoadingCategories(false);
    }
  }, [user]);

  const updateCategory = useCallback(async (id: string, data: Partial<GMooncNotificationCategory>): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoadingCategories(true);
      const index = mockCategories.findIndex(c => c.id === id);
      if (index === -1) return false;

      mockCategories[index] = {
        ...mockCategories[index],
        ...data,
        updated_at: new Date().toISOString()
      };
      setCategories([...mockCategories]);
      return true;
    } catch (err) {
      setErrorCategories(err instanceof Error ? err.message : 'Error updating category');
      return false;
    } finally {
      setLoadingCategories(false);
    }
  }, [user]);

  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoadingCategories(true);
      const index = mockCategories.findIndex(c => c.id === id);
      if (index === -1) return false;

      mockCategories.splice(index, 1);
      setCategories([...mockCategories]);
      return true;
    } catch (err) {
      setErrorCategories(err instanceof Error ? err.message : 'Error deleting category');
      return false;
    } finally {
      setLoadingCategories(false);
    }
  }, [user]);

  const createSetting = useCallback(async (data: Omit<GMooncNotificationSetting, 'id' | 'user' | 'category'>): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoadingSettings(true);
      const newSetting: GMooncNotificationSetting = {
        ...data,
        id: Date.now().toString()
      };
      mockSettings.push(newSetting);
      setSettings([...mockSettings]);
      return true;
    } catch (err) {
      setErrorSettings(err instanceof Error ? err.message : 'Error creating setting');
      return false;
    } finally {
      setLoadingSettings(false);
    }
  }, [user]);

  const updateSetting = useCallback(async (id: string, data: Partial<GMooncNotificationSetting>): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoadingSettings(true);
      const index = mockSettings.findIndex(s => s.id === id);
      if (index === -1) return false;

      mockSettings[index] = { ...mockSettings[index], ...data };
      setSettings([...mockSettings]);
      return true;
    } catch (err) {
      setErrorSettings(err instanceof Error ? err.message : 'Error updating setting');
      return false;
    } finally {
      setLoadingSettings(false);
    }
  }, [user]);

  const deleteSetting = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoadingSettings(true);
      const index = mockSettings.findIndex(s => s.id === id);
      if (index === -1) return false;

      mockSettings.splice(index, 1);
      setSettings([...mockSettings]);
      return true;
    } catch (err) {
      setErrorSettings(err instanceof Error ? err.message : 'Error deleting setting');
      return false;
    } finally {
      setLoadingSettings(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchCategories();
      fetchSettings();
      fetchLogs();
    }
  }, [user, fetchCategories, fetchSettings, fetchLogs]);

  return {
    categories,
    settings,
    logs,
    loadingCategories,
    loadingSettings,
    loadingLogs,
    errorCategories,
    errorSettings,
    errorLogs,
    createCategory,
    updateCategory,
    deleteCategory,
    createSetting,
    updateSetting,
    deleteSetting,
    fetchLogs,
    adminUsers
  };
}
