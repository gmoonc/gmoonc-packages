import { join, relative, dirname } from 'path';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { execSync } from 'child_process';
import { ProjectInfo } from './detect.js';
import { ensureDirectoryExists, writeFileSafe } from './fs.js';
import { logInfo, logSuccess, logError, logWarning } from './logger.js';

export interface SupabaseSetupOptions {
  project: ProjectInfo;
  projectDir: string;
  platform: 'vite';
  dryRun: boolean;
}

export function setupSupabase(options: SupabaseSetupOptions): { success: boolean; message?: string } {
  const { project, projectDir, platform, dryRun } = options;

  try {
    // Validate platform
    if (platform !== 'vite') {
      logError('Missing platform flag. Use: gmoonc supabase --vite (Next will be added later).');
      return { success: false, message: 'Missing platform flag' };
    }

    // Check if gmoonc is installed
    const gmooncDir = join(projectDir, 'src/gmoonc');
    if (!existsSync(gmooncDir)) {
      logError('gmoonc is not installed. Run "npx gmoonc" first.');
      return { success: false, message: 'gmoonc not installed' };
    }

    // Check if supabase is already set up
    const supabaseDir = join(gmooncDir, 'supabase');
    if (existsSync(supabaseDir)) {
      logWarning('Supabase integration already exists at src/gmoonc/supabase/');
      logWarning('Remove the directory to reinstall.');
      return { success: false, message: 'Supabase already installed' };
    }

    // Note: SQL scripts are in the gmoonc package /docs directory
    // They will be referenced in the final message but not applied here
    logInfo('SQL scripts are available in gmoonc package /docs directory');

    // Install dependencies
    logInfo('\n📦 Installing Supabase dependencies...');
    const supabaseDeps = ['@supabase/supabase-js'];

    // Check existing dependencies
    const packageJsonPath = join(projectDir, 'package.json');
    let existingDeps: Record<string, string> = {};
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        existingDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      } catch {
        // Ignore
      }
    }

    const packagesToInstall = supabaseDeps.filter(dep => {
      const depName = dep.split('@')[0];
      return !existingDeps[depName];
    });

    if (packagesToInstall.length > 0 && !dryRun) {
      const installCmd = project.packageManager === 'pnpm'
        ? `pnpm add ${packagesToInstall.join(' ')}`
        : project.packageManager === 'yarn'
        ? `yarn add ${packagesToInstall.join(' ')}`
        : `npm install ${packagesToInstall.join(' ')}`;

      try {
        logInfo(`Installing: ${packagesToInstall.join(', ')}`);
        execSync(installCmd, {
          stdio: 'inherit',
          cwd: projectDir
        });
        logSuccess('Dependencies installed');
      } catch (error) {
        logError('Failed to install dependencies');
        logError(`Try installing manually: ${installCmd}`);
        return { success: false, message: 'Failed to install dependencies' };
      }
    } else if (packagesToInstall.length === 0) {
      logSuccess('@supabase/supabase-js already installed');
    }

    // Generate Supabase files
    logInfo('\n📝 Generating Supabase integration files...');

    if (!dryRun) {
      // Create directory structure
      ensureDirectoryExists(join(supabaseDir, 'auth'));
      ensureDirectoryExists(join(supabaseDir, 'rbac'));

      // Generate env.ts
      generateEnvFile(projectDir, supabaseDir, platform);
      
      // Generate client.ts
      generateClientFile(projectDir, supabaseDir);
      
      // Generate GMooncSupabaseSessionProvider.tsx
      generateSessionProvider(projectDir, supabaseDir);
      
      // Generate RBAC helpers
      generateRbacHelpers(projectDir, supabaseDir);
      
      // Update .env.example
      updateEnvExample(projectDir);
      
      // Patch existing code to use Supabase provider
      patchExistingCode(projectDir, gmooncDir);
    }

    logSuccess('\n✅ Supabase integration setup complete!');
    logInfo('\n📋 Next steps:');
    logInfo('1. Create a Supabase project at https://supabase.com');
    logInfo('2. Copy .env.example to .env');
    logInfo('3. Fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
    logInfo('4. Restart dev server');
    logInfo('\n💡 Next step: gmoonc supabase-seed --vite (will apply /docs SQL to your project using service credentials)');

    return { success: true };
  } catch (error: any) {
    logError(`Error setting up Supabase: ${error.message}`);
    if (error.stack && process.env.DEBUG) {
      console.error(error.stack);
    }
    return { success: false, message: error.message };
  }
}

function generateEnvFile(projectDir: string, supabaseDir: string, platform: 'vite'): void {
  const envFilePath = join(supabaseDir, 'env.ts');
  const content = `/**
 * Supabase environment variables for Vite
 * 
 * This file reads environment variables from import.meta.env (Vite)
 * and validates their presence. Never throws - only logs warnings.
 */

const supabaseUrlValue = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKeyValue = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Safe trim with fallback to empty string
const url = typeof supabaseUrlValue === 'string' ? supabaseUrlValue.trim() : '';
const anonKey = typeof supabaseAnonKeyValue === 'string' ? supabaseAnonKeyValue.trim() : '';

export const supabaseUrl = url;
export const supabaseAnonKey = anonKey;
export const hasSupabaseEnv = Boolean(url && anonKey);

// Log warning once if env vars are missing (only in browser, only in dev)
if (!hasSupabaseEnv && typeof window !== 'undefined' && import.meta.env.DEV) {
  const missingVars: string[] = [];
  if (!url) missingVars.push('VITE_SUPABASE_URL');
  if (!anonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');
  
  console.warn(
    \`⚠️ Supabase environment variables missing: \${missingVars.join(', ')}.\\n\` +
    \`Please:\\n\` +
    \`1. Copy .env.example to .env\\n\` +
    \`2. Fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY\\n\` +
    \`3. Restart dev server\\n\` +
    \`The app will continue without authentication until configured.\`
  );
}
`;

  writeFileSafe(envFilePath, content);
  logSuccess('Generated src/gmoonc/supabase/env.ts');
}

function generateClientFile(projectDir: string, supabaseDir: string): void {
  const clientFilePath = join(supabaseDir, 'client.ts');
  const content = `import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey, hasSupabaseEnv } from './env';

// Database types (minimal - extend as needed)
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
      messages: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          email: string;
          phone: string | null;
          company: string;
          message: string;
          status: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          email: string;
          phone?: string | null;
          company: string;
          message: string;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          email?: string;
          phone?: string | null;
          company?: string;
          message?: string;
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
      check_user_permission: {
        Args: {
          user_id: string;
          module_name: string;
          action: string;
        };
        Returns: boolean;
      };
      get_user_permissions: {
        Args: {
          user_id: string;
        };
        Returns: {
          module_name: string;
          can_access: boolean;
          can_create: boolean;
          can_read: boolean;
          can_update: boolean;
          can_delete: boolean;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Singleton pattern to avoid multiple instances
let supabaseInstance: SupabaseClient<Database> | null = null;

let warningLogged = false;

const createMissingEnvClient = (): SupabaseClient<Database> => {
  const missingEnvMessage = 'Supabase environment variables are missing or empty.';

  // Log warning once
  if (!warningLogged && typeof window !== 'undefined') {
    console.warn('⚠️ Supabase env not configured. Authentication features will not work.');
    warningLogged = true;
  }

  const notConfigured = () => Promise.reject(new Error(missingEnvMessage));
  const emptyResult = () => Promise.resolve({ data: null, error: new Error(missingEnvMessage) });
  const emptyArray = () => Promise.resolve({ data: [], error: new Error(missingEnvMessage) });

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: notConfigured,
      signUp: notConfigured,
      signOut: async () => ({ error: null }),
      resend: notConfigured,
      onAuthStateChange: () => ({ 
        data: { subscription: { unsubscribe: () => {} } },
        error: null
      }),
      startAutoRefresh: () => Promise.resolve(),
      stopAutoRefresh: () => {},
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: () => emptyResult(),
          maybeSingle: () => emptyResult(),
        }),
        order: () => ({
          eq: () => emptyArray(),
        }),
      }),
      insert: () => notConfigured(),
      update: () => notConfigured(),
      delete: () => notConfigured(),
      upsert: () => notConfigured(),
    }),
    rpc: () => Promise.resolve({ data: null, error: new Error(missingEnvMessage) }),
  } as unknown as SupabaseClient<Database>;
};

export const supabase = (() => {
  if (supabaseInstance) return supabaseInstance;

  if (!hasSupabaseEnv) {
    supabaseInstance = createMissingEnvClient();
    return supabaseInstance;
  }

  // Configuration optimized for Vite/React
  const authConfig = {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce' as const
    },
    global: {
      headers: {
        'X-Client-Info': 'gmoonc-web'
      }
    }
  };

  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, authConfig);

  const client = supabaseInstance;

  // Ensure automatic token refresh
  client.auth.onAuthStateChange((event, session) => {
    if (event === 'INITIAL_SESSION' && session) {
      client.auth.startAutoRefresh().catch(console.error);
    } else if (event === 'SIGNED_IN') {
      client.auth.startAutoRefresh().catch(console.error);
    } else if (event === 'SIGNED_OUT') {
      client.auth.stopAutoRefresh();
    } else if (event === 'TOKEN_REFRESHED') {
      // Silent refresh - no console log needed
    }
  });

  return supabaseInstance;
})();
`;

  writeFileSafe(clientFilePath, content);
  logSuccess('Generated src/gmoonc/supabase/client.ts');
}

function generateSessionProvider(projectDir: string, supabaseDir: string): void {
  const providerPath = join(supabaseDir, 'auth/GMooncSupabaseSessionProvider.tsx');
  const content = `import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { supabase } from '../client';
import { hasSupabaseEnv } from '../env';

export interface GMooncUser {
  id: string;
  email: string;
  name: string;
  role: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface GMooncSession {
  isAuthenticated: boolean;
  roles: string[];
  user: GMooncUser | null;
}

interface GMooncSessionContextType extends GMooncSession {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const GMooncSessionContext = createContext<GMooncSessionContextType | undefined>(undefined);

export function GMooncSupabaseSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GMooncUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load user profile from Supabase
  const loadUserProfile = useCallback(async (supabaseUser: User) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profileError) {
        console.error('❌ Error loading profile:', profileError);
        throw profileError;
      }

      if (profile) {
        setUser(profile);
      }
      return profile;
    } catch (error) {
      console.error('❌ Error loading profile:', error);
      throw error;
    }
  }, []);

  // Check initial session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!hasSupabaseEnv) {
          setError('Supabase environment variables not configured. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
          setIsLoading(false);
          return;
        }

        if (typeof window === 'undefined') {
          setIsLoading(false);
          return;
        }

        // Check current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('❌ Error checking initial session:', sessionError);
        } else if (session?.user) {
          await loadUserProfile(session.user);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('❌ Error checking authentication:', error);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [loadUserProfile]);

  // Listen to auth state changes
  useEffect(() => {
    if (!hasSupabaseEnv) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN') && session?.user) {
          await loadUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          navigate('/login');
        } else if (event === 'USER_UPDATED' && session?.user) {
          // Profile sync happens automatically via triggers
          await loadUserProfile(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, loadUserProfile]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!hasSupabaseEnv) {
        setError('Supabase configuration missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
        setIsLoading(false);
        return;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('❌ Login error:', authError);
        
        let errorMessage = 'Login failed. Please try again.';
        
        if (authError.message.includes('Email not confirmed')) {
          errorMessage = 'Email not confirmed. Check your inbox and confirm your email before logging in.';
        } else if (authError.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Check your credentials.';
        } else if (authError.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Wait a few minutes before trying again.';
        } else if (authError.message.includes('User not found')) {
          errorMessage = 'User not found. Check if the email is correct.';
        }
        
        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Profile will be loaded via onAuthStateChange
        // Navigate will happen after profile is loaded
        const profile = await loadUserProfile(data.user);
        if (profile) {
          navigate('/app');
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('❌ Unexpected login error:', error);
      setError('Unexpected error. Please try again.');
      setIsLoading(false);
    }
  }, [navigate, loadUserProfile]);

  const logout = useCallback(async () => {
    try {
      if (!hasSupabaseEnv) {
        setUser(null);
        setIsLoading(false);
        navigate('/login');
        return;
      }

      const { error: logoutError } = await supabase.auth.signOut();
      
      if (logoutError) {
        console.error('❌ Logout error:', logoutError);
      }

      setUser(null);
      setIsLoading(false);
      navigate('/login');
    } catch (error) {
      console.error('❌ Logout error:', error);
      setUser(null);
      setIsLoading(false);
      navigate('/login');
    }
  }, [navigate]);

  const roles = user?.role ? [user.role] : [];

  const value: GMooncSessionContextType = {
    isAuthenticated: !!user,
    roles,
    user,
    login,
    logout,
    isLoading,
    error
  };

  return (
    <GMooncSessionContext.Provider value={value}>
      {children}
    </GMooncSessionContext.Provider>
  );
}

export function useGMooncSession(): GMooncSessionContextType {
  const context = useContext(GMooncSessionContext);
  if (!context) {
    throw new Error('useGMooncSession must be used within GMooncSupabaseSessionProvider');
  }
  return context;
}
`;

  writeFileSafe(providerPath, content);
  logSuccess('Generated src/gmoonc/supabase/auth/GMooncSupabaseSessionProvider.tsx');
}

function generateRbacHelpers(projectDir: string, supabaseDir: string): void {
  // Generate getMyProfile.ts
  const getMyProfilePath = join(supabaseDir, 'rbac/getMyProfile.ts');
  const getMyProfileContent = `import { supabase } from '../client';
import type { Database } from '../client';

type Profile = Database['public']['Tables']['profiles']['Row'];

/**
 * Get the current user's profile from the database
 * @returns Profile or null if not found
 */
export async function getMyProfile(): Promise<Profile | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return null;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Error in getMyProfile:', error);
    return null;
  }
}
`;

  writeFileSafe(getMyProfilePath, getMyProfileContent);
  logSuccess('Generated src/gmoonc/supabase/rbac/getMyProfile.ts');

  // Generate hasPermission.ts
  const hasPermissionPath = join(supabaseDir, 'rbac/hasPermission.ts');
  const hasPermissionContent = `import { supabase } from '../client';

/**
 * Check if the current user has a specific permission
 * Uses the check_permission database function
 * 
 * @param moduleKey - Module name (e.g., 'admin', 'technical', 'customer')
 * @param permissionKey - Permission type (e.g., 'access', 'create', 'read', 'update', 'delete')
 * @returns Promise<boolean>
 */
export async function hasPermission(
  moduleKey: string,
  permissionKey: string = 'access'
): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return false;
    }

    // Note: The SQL function is check_user_permission, but we'll use a wrapper
    // For now, we'll use a direct query approach compatible with the SQL structure
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile?.role) {
      return false;
    }

    // Administrators always have access
    if (profile.role === 'administrator') {
      return true;
    }

    // Check permission via RPC function
    // The SQL has check_user_permission(user_id, module_name, action)
    // Map permissionKey: 'access' -> 'read', others stay the same
    const action = permissionKey === 'access' ? 'read' : permissionKey;
    const { data, error } = await supabase.rpc('check_user_permission', {
      user_id: session.user.id,
      module_name: moduleKey,
      action: action
    });

    if (error) {
      console.error('Error checking permission:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Error in hasPermission:', error);
    return false;
  }
}

/**
 * Check permission synchronously (for quick checks)
 * Note: This is a simplified check based on role only
 * For accurate permission checks, use the async hasPermission function
 * 
 * @param userRole - User's role from profile
 * @param moduleKey - Module name
 * @param permissionKey - Permission type
 * @returns boolean
 */
export function hasPermissionSync(
  userRole: string | null,
  moduleKey: string,
  permissionKey: string = 'access'
): boolean {
  // Administrators always have access
  if (userRole === 'administrator') {
    return true;
  }

  // For other roles, we need to check via database
  // This sync version returns false for non-admins
  // Use async hasPermission for accurate checks
  return false;
}
`;

  writeFileSafe(hasPermissionPath, hasPermissionContent);
  logSuccess('Generated src/gmoonc/supabase/rbac/hasPermission.ts');

  // Generate getUserPermissions.ts
  const getUserPermissionsPath = join(supabaseDir, 'rbac/getUserPermissions.ts');
  const getUserPermissionsContent = `import { supabase } from '../client';

export interface UserPermission {
  module_name: string;
  can_access: boolean;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
}

/**
 * Get all permissions for the current user
 * Uses the get_user_permissions database function
 * 
 * @returns Promise<UserPermission[]>
 */
export async function getUserPermissions(): Promise<UserPermission[]> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return [];
    }

    const { data, error } = await supabase.rpc('get_user_permissions', {
      user_id: session.user.id
    });

    if (error) {
      console.error('Error fetching user permissions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserPermissions:', error);
    return [];
  }
}
`;

  writeFileSafe(getUserPermissionsPath, getUserPermissionsContent);
  logSuccess('Generated src/gmoonc/supabase/rbac/getUserPermissions.ts');

  // Generate index.ts for rbac
  const rbacIndexPath = join(supabaseDir, 'rbac/index.ts');
  const rbacIndexContent = `export { getMyProfile } from './getMyProfile';
export { hasPermission, hasPermissionSync } from './hasPermission';
export { getUserPermissions } from './getUserPermissions';
export type { UserPermission } from './getUserPermissions';
`;

  writeFileSafe(rbacIndexPath, rbacIndexContent);
  logSuccess('Generated src/gmoonc/supabase/rbac/index.ts');
}

function updateEnvExample(projectDir: string): void {
  const envExamplePath = join(projectDir, '.env.example');
  const envExampleContent = `# Supabase Configuration (Client-side)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Supabase Service Role Key (for admin operations - server-only, no VITE_ prefix)
# Get from: Supabase Dashboard → Settings → API → service_role key
SUPABASE_SERVICE_ROLE_KEY=

# Supabase Database Connection (Server-only, for seeding)
# Get this from Supabase Dashboard → Settings → Database → Connection string (URI)
SUPABASE_DB_URL=
`;

  // Check if .env.example exists
  if (existsSync(envExamplePath)) {
    const existing = readFileSync(envExamplePath, 'utf-8');
    // Only add if not already present
    if (!existing.includes('VITE_SUPABASE_URL')) {
      const updated = existing + '\n' + envExampleContent;
      writeFileSafe(envExamplePath, updated);
      logSuccess('Updated .env.example');
    } else {
      logInfo('.env.example already contains Supabase variables');
    }
  } else {
    writeFileSafe(envExamplePath, envExampleContent);
    logSuccess('Created .env.example');
  }
}

function patchExistingCode(projectDir: string, gmooncDir: string): void {
  // Patch createGmooncRoutes.tsx (Vite router template)
  const viteRoutesPath = join(gmooncDir, 'router/createGmooncRoutes.tsx');
  if (existsSync(viteRoutesPath)) {
    let content = readFileSync(viteRoutesPath, 'utf-8');
    
    // Replace import
    content = content.replace(
      /import\s+{\s*GMooncSessionProvider[^}]*}\s+from\s+['"][^'"]*session\/GMooncSessionContext['"]/g,
      "import { GMooncSupabaseSessionProvider } from '../supabase/auth/GMooncSupabaseSessionProvider'"
    );
    
    // Replace all GMooncSessionProvider with GMooncSupabaseSessionProvider
    content = content.replace(/GMooncSessionProvider/g, 'GMooncSupabaseSessionProvider');
    
    writeFileSafe(viteRoutesPath, content);
    logSuccess('Patched router/createGmooncRoutes.tsx to use GMooncSupabaseSessionProvider');
  }

  // Patch GMooncAppLayout.tsx to use GMooncSupabaseSessionProvider and add route protection
  const layoutPath = join(gmooncDir, 'layout/GMooncAppLayout.tsx');
  if (existsSync(layoutPath)) {
    let content = readFileSync(layoutPath, 'utf-8');
    
    // Replace import - handle both single and multiple imports
    content = content.replace(
      /import\s+{\s*GMooncSessionProvider[^}]*useGMooncSession[^}]*}\s+from\s+['"][^'"]*session\/GMooncSessionContext['"]/g,
      "import { GMooncSupabaseSessionProvider, useGMooncSession } from '../supabase/auth/GMooncSupabaseSessionProvider'"
    );
    
    // Also handle if only GMooncSessionProvider is imported
    content = content.replace(
      /import\s+{\s*GMooncSessionProvider[^}]*}\s+from\s+['"][^'"]*session\/GMooncSessionContext['"]/g,
      "import { GMooncSupabaseSessionProvider, useGMooncSession } from '../supabase/auth/GMooncSupabaseSessionProvider'"
    );
    
    // Replace usage
    content = content.replace(/GMooncSessionProvider/g, 'GMooncSupabaseSessionProvider');
    
      // Add route protection if not already present
      if (!content.includes('!isAuthenticated')) {
        // Find the line with const { roles, logout } = useGMooncSession();
        content = content.replace(
          /const\s+{\s*roles,\s*logout\s*}\s+=\s+useGMooncSession\(\);/,
          "const { roles, logout, isLoading, isAuthenticated } = useGMooncSession();"
        );
        
        // Add protection before return statement in GMooncAppLayoutInner
        // Order: isLoading first, then isAuthenticated
        content = content.replace(
          /(\s+}, \[navigate, getBasePath\]\);)\s+(\s+return\s+\()/,
          `$1

  // Show loading state while checking authentication (verificar primeiro)
  if (isLoading) {
    return (
      <div className="gmoonc-root">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: 'var(--gmoonc-font-size-base, 16px)',
          color: 'var(--gmoonc-color-text, #333)'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  // Route protection: redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

$2`
        );
      } else {
        // Fix order if protection already exists but order is wrong
        // Replace incorrect order (!isLoading && !isAuthenticated) with correct order
        content = content.replace(
          /\/\/ Route protection: redirect to login if not authenticated\s+if\s+\(!isLoading\s+&&\s+!isAuthenticated\)\s+\{[\s\S]*?return\s+<Navigate[^>]+>;[\s\S]*?\}\s+(\/\/ Show loading state)/,
          `// Show loading state while checking authentication (verificar primeiro)
  if (isLoading) {
    return (
      <div className="gmoonc-root">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: 'var(--gmoonc-font-size-base, 16px)',
          color: 'var(--gmoonc-color-text, #333)'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  // Route protection: redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

$1`
        );
      }
    
    // Add Navigate import AFTER all content modifications (especially after route protection is added)
    // Check if Navigate is used in the code but not imported
    const usesNavigate = /<Navigate\s+to=/.test(content);
    const hasNavigateImport = /import\s+{[^}]*\bNavigate\b[^}]*}\s+from\s+['"]react-router-dom['"]/.test(content);
    
    if (usesNavigate && !hasNavigateImport) {
      // Find the react-router-dom import and add Navigate
      const importRegex = /import\s+{\s*([^}]*)\s*}\s+from\s+['"]react-router-dom['"]/;
      const match = content.match(importRegex);
      
      if (match) {
        const imports = match[1];
        // Check if Navigate is already in the imports (double check)
        if (!/\bNavigate\b/.test(imports)) {
          // Remove trailing comma if present, then add Navigate
          const cleanImports = imports.trim().replace(/,\s*$/, '');
          const quote = match[0].includes("'") ? "'" : '"';
          content = content.replace(
            importRegex,
            `import { ${cleanImports}, Navigate } from ${quote}react-router-dom${quote}`
          );
        }
      } else {
        // If no react-router-dom import exists, add it (shouldn't happen, but handle it)
        content = `import { Navigate } from 'react-router-dom';\n${content}`;
      }
    }
    
    writeFileSafe(layoutPath, content);
    logSuccess('Patched layout/GMooncAppLayout.tsx to use GMooncSupabaseSessionProvider and add route protection');
  }

  // Update all imports from old session context to new Supabase provider
  updateAllSessionImports(gmooncDir);
}

/**
 * Update all imports from session/GMooncSessionContext to supabase/auth/GMooncSupabaseSessionProvider
 * in all .ts and .tsx files within gmoonc directory
 */
function updateAllSessionImports(gmooncDir: string): void {
  const filesToUpdate: string[] = [];
  
  // Recursively find all .ts and .tsx files
  function findFiles(dir: string): void {
    if (!existsSync(dir)) return;
    
    const entries = readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      // Skip backup files and supabase directory (already correct)
      if (entry.name.includes('.bak-') || entry.name === 'supabase') {
        continue;
      }
      
      if (entry.isDirectory()) {
        findFiles(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        filesToUpdate.push(fullPath);
      }
    }
  }
  
  findFiles(gmooncDir);
  
  let updatedCount = 0;
  
  for (const filePath of filesToUpdate) {
    let content = readFileSync(filePath, 'utf-8');
    let modified = false;
    
    // Calculate relative path from file to supabase/auth/GMooncSupabaseSessionProvider
    const fileDir = dirname(filePath);
    const supabaseProviderPath = join(gmooncDir, 'supabase', 'auth', 'GMooncSupabaseSessionProvider');
    let relativePath = relative(fileDir, supabaseProviderPath).replace(/\\/g, '/');
    
    // Ensure path starts with ./ if it doesn't already
    if (!relativePath.startsWith('.')) {
      relativePath = './' + relativePath;
    }
    
    // Pattern 1: import { useGMooncSession } from '../session/GMooncSessionContext'
    // Pattern 2: import { GMooncSessionProvider, useGMooncSession } from '../session/GMooncSessionContext'
    // Pattern 3: import { useGMooncSession } from '../../session/GMooncSessionContext'
    // etc.
    const oldImportPattern = /from\s+['"](\.\.?\/)+session\/GMooncSessionContext['"]/g;
    
    if (oldImportPattern.test(content)) {
      // Replace the import path - preserve the import statement structure
      content = content.replace(
        /from\s+['"](\.\.?\/)+session\/GMooncSessionContext['"]/g,
        `from '${relativePath}'`
      );
      modified = true;
    }
    
    // Also handle if GMooncSessionProvider is imported (should be replaced with GMooncSupabaseSessionProvider)
    if (content.includes('GMooncSessionProvider') && !content.includes('GMooncSupabaseSessionProvider')) {
      content = content.replace(/GMooncSessionProvider/g, 'GMooncSupabaseSessionProvider');
      modified = true;
    }
    
    if (modified) {
      writeFileSafe(filePath, content);
      updatedCount++;
    }
  }
  
  if (updatedCount > 0) {
    logSuccess(`Updated ${updatedCount} file(s) to use GMooncSupabaseSessionProvider`);
  } else {
    logInfo('All files already use GMooncSupabaseSessionProvider');
  }
}
