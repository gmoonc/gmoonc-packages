import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabaseEnv = Boolean(supabaseUrl?.trim() && supabaseAnonKey?.trim());

// Singleton pattern para evitar múltiplas instâncias
let supabaseInstance: SupabaseClient<Database> | null = null;

const createMissingEnvClient = () => {
  const missingEnvMessage = 'Supabase environment variables are missing or empty.';

  // Criar um objeto com a interface mínima necessária para evitar que a aplicação quebre
  const notConfigured = () => Promise.reject(new Error(missingEnvMessage));

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: new Error(missingEnvMessage) }),
      signInWithPassword: notConfigured,
      signUp: notConfigured,
      signOut: notConfigured,
      resend: notConfigured,
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      startAutoRefresh: () => Promise.resolve(),
      stopAutoRefresh: () => {},
    },
    from: () => ({
      select: () => notConfigured(),
      eq: () => ({ single: () => notConfigured() }),
    }),
  } as unknown as SupabaseClient<Database>;
};

export const supabase = (() => {
  if (supabaseInstance) return supabaseInstance;

  if (!hasSupabaseEnv) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ Supabase env vars ausentes. O app continuará rodando sem autenticação.');
    }
    supabaseInstance = createMissingEnvClient();
    return supabaseInstance;
  }

  // Configuração otimizada para Next.js - sem verificações desnecessárias
  const authConfig = {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce' as const
    },
    global: {
      headers: {
        'X-Client-Info': 'sicoop-web'
      }
    }
  };

  supabaseInstance = createClient<Database>(supabaseUrl!, supabaseAnonKey!, authConfig);

  const client = supabaseInstance;

  // Garantir renovação automática do token
  client.auth.onAuthStateChange((event, session) => {
    // Iniciar o refresh tanto no primeiro carregamento quanto em novos logins
    if (event === 'INITIAL_SESSION' && session) {
      client.auth.startAutoRefresh().catch(console.error);
    } else if (event === 'SIGNED_IN') {
      client.auth.startAutoRefresh().catch(console.error);
    } else if (event === 'SIGNED_OUT') {
      client.auth.stopAutoRefresh();
    } else if (event === 'TOKEN_REFRESHED') {
      console.log('Token renovado automaticamente');
    }
  });

  return supabaseInstance;
})();

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      roles: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          is_system_role: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          is_system_role?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          is_system_role?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      modules: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          description: string | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          display_name: string;
          description?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          display_name?: string;
          description?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      permissions: {
        Row: {
          id: string;
          role_id: string;
          module_id: string;
          can_access: boolean | null;
          can_create: boolean | null;
          can_read: boolean | null;
          can_update: boolean | null;
          can_delete: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          role_id: string;
          module_id: string;
          can_access?: boolean | null;
          can_create?: boolean | null;
          can_read?: boolean | null;
          can_update?: boolean | null;
          can_delete?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          role_id?: string;
          module_id?: string;
          can_access?: boolean | null;
          can_create?: boolean | null;
          can_read?: boolean | null;
          can_update?: boolean | null;
          can_delete?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      analises_cobertura: {
        Row: {
          id: string;
          user_id: string | null; // Corrigido para permitir null
          nome: string;
          email: string;
          telefone: string | null;
          nome_fazenda: string;
          area_fazenda_ha: number | null;
          latitude: number | null;
          longitude: number | null;
          observacoes: string | null;
          status: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          nome: string;
          email: string;
          telefone?: string | null;
          nome_fazenda: string;
          area_fazenda_ha?: number | null;
          latitude?: number | null;
          longitude?: number | null;
          observacoes?: string | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          nome?: string;
          email?: string;
          telefone?: string | null;
          nome_fazenda?: string;
          area_fazenda_ha?: number | null;
          latitude?: number | null;
          longitude?: number | null;
          observacoes?: string | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      mensagens: {
        Row: {
          id: string;
          user_id: string | null;
          nome: string;
          email: string;
          telefone: string | null;
          empresa_fazenda: string;
          mensagem: string;
          status: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          nome: string;
          email: string;
          telefone?: string | null;
          empresa_fazenda: string;
          mensagem: string;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          nome?: string;
          email?: string;
          telefone?: string | null;
          empresa_fazenda?: string;
          mensagem?: string;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      notification_categories: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          description: string | null;
          is_active: boolean | null;
          email_template_subject: string;
          email_template_body: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          display_name: string;
          description?: string | null;
          is_active?: boolean | null;
          email_template_subject: string;
          email_template_body: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          display_name?: string;
          description?: string | null;
          is_active?: boolean | null;
          email_template_subject?: string;
          email_template_body?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      notification_settings: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          is_enabled: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          is_enabled?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          is_enabled?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      notification_logs: {
        Row: {
          id: string;
          category_id: string;
          user_id: string;
          entity_type: string;
          entity_id: string;
          email_sent: boolean | null;
          email_error: string | null;
          sent_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          category_id: string;
          user_id: string;
          entity_type: string;
          entity_id: string;
          email_sent?: boolean | null;
          email_error?: string | null;
          sent_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          category_id?: string;
          user_id?: string;
          entity_type?: string;
          entity_id?: string;
          email_sent?: boolean | null;
          email_error?: string | null;
          sent_at?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      update_profile_name: {
        Args: {
          user_id: string;
          new_name: string;
        };
        Returns: undefined;
      };
      update_profile_role: {
        Args: {
          user_id: string;
          new_role: string;
        };
        Returns: undefined;
      };
      check_permission: {
        Args: {
          user_id: string;
          module_name: string;
          permission_type?: string;
        };
        Returns: boolean;
      };
      get_user_permissions: {
        Args: {
          user_id: string;
        };
        Returns: {
          module_name: string;
          module_display_name: string;
          can_access: boolean;
          can_create: boolean;
          can_read: boolean;
          can_update: boolean;
          can_delete: boolean;
        }[];
      };
      can_delete_role: {
        Args: {
          role_name: string;
        };
        Returns: boolean;
      };
      get_role_usage_stats: {
        Args: Record<PropertyKey, never>;
        Returns: {
          role_name: string;
          user_count: number;
        }[];
      };
      validate_role_exists: {
        Args: {
          role_name: string;
        };
        Returns: boolean;
      };
      get_notification_recipients: {
        Args: {
          category_name: string;
        };
        Returns: {
          user_id: string;
          email: string;
          name: string;
        }[];
      };
      log_notification: {
        Args: {
          p_category_name: string;
          p_user_id: string;
          p_entity_type: string;
          p_entity_id: string;
          p_email_sent?: boolean;
          p_email_error?: string | null;
        };
        Returns: string;
      };
      process_pending_notifications: {
        Args: Record<PropertyKey, never>;
        Returns: {
          processed_count: number;
          success_count: number;
          error_count: number;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
