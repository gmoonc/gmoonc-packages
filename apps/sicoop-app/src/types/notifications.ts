export interface NotificationCategory {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  is_active: boolean;
  email_template_subject: string;
  email_template_body: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationSetting {
  id: string;
  user_id: string;
  category_id: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  category?: NotificationCategory;
}

export interface NotificationLog {
  id: string;
  category_id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  email_sent: boolean;
  email_error: string | null;
  sent_at: string | null;
  created_at: string | null;
  // Relacionamentos
  category?: NotificationCategory;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface NotificationFormData {
  display_name: string;
  description: string;
  email_template_subject: string;
  email_template_body: string;
  is_active: boolean;
}

export interface NotificationSettingFormData {
  user_id: string;
  category_id: string;
  is_enabled: boolean;
}

// Tipos para respostas do Supabase (com campos nullable)
export interface SupabaseNotificationCategory {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  is_active: boolean | null;
  email_template_subject: string;
  email_template_body: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface SupabaseNotificationSetting {
  id: string;
  user_id: string;
  category_id: string;
  is_enabled: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string | null;
  } | null;
  category?: SupabaseNotificationCategory | null;
}

// Tipo para dados brutos do Supabase (com possíveis erros de relacionamento)
export interface RawSupabaseSetting {
  id: string;
  user_id: string;
  category_id: string;
  is_enabled: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  user?: unknown; // Pode ser objeto válido ou erro de relacionamento
  category?: unknown; // Pode ser objeto válido ou erro de relacionamento
}

// Funções de conversão para transformar dados do Supabase em tipos limpos
export function convertSupabaseCategory(data: SupabaseNotificationCategory): NotificationCategory {
  return {
    id: data.id,
    name: data.name,
    display_name: data.display_name,
    description: data.description,
    is_active: data.is_active ?? true,
    email_template_subject: data.email_template_subject,
    email_template_body: data.email_template_body,
    created_at: data.created_at ?? new Date().toISOString(),
    updated_at: data.updated_at ?? new Date().toISOString(),
  };
}

export function convertSupabaseSetting(data: SupabaseNotificationSetting): NotificationSetting {
  return {
    id: data.id,
    user_id: data.user_id,
    category_id: data.category_id,
    is_enabled: data.is_enabled ?? true,
    created_at: data.created_at ?? new Date().toISOString(),
    updated_at: data.updated_at ?? new Date().toISOString(),
    user: data.user ? {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role ?? 'user',
    } : undefined,
    category: data.category ? convertSupabaseCategory(data.category) : undefined,
  };
}

// Função para converter dados brutos do Supabase (com tratamento de erros de relacionamento)
export function convertRawSupabaseSetting(data: RawSupabaseSetting): NotificationSetting {
  return {
    id: data.id,
    user_id: data.user_id,
    category_id: data.category_id,
    is_enabled: data.is_enabled ?? true,
    created_at: data.created_at ?? new Date().toISOString(),
    updated_at: data.updated_at ?? new Date().toISOString(),
    user: data.user && typeof data.user === 'object' && !Array.isArray(data.user) && !(data.user as { message?: string }).message ? {
      id: (data.user as { id: string }).id,
      name: (data.user as { name: string }).name,
      email: (data.user as { email: string }).email,
      role: (data.user as { role?: string }).role ?? 'user',
    } : undefined,
    category: data.category && typeof data.category === 'object' && !Array.isArray(data.category) && !(data.category as { message?: string }).message ? 
      convertSupabaseCategory(data.category as SupabaseNotificationCategory) : undefined,
  };
}
