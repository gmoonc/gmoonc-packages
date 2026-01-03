'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { hasSupabaseEnv, supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface Profile {
  id: string;
  email: string;
  name: string;
  role: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface AuthContextType {
  user: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: { name: string; email: string; password: string; confirmPassword: string }) => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<void>;
  emergencyReset: () => void;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Verificar sessão apenas uma vez na inicialização
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!hasSupabaseEnv) {
          setError('Variáveis do Supabase não configuradas. Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.');
          setIsLoading(false);
          return;
        }

        // Verificar se estamos no browser
        if (typeof window === 'undefined') {
          setIsLoading(false);
          return;
        }
        
        // Aguardar um pouco para o Supabase inicializar
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verificar sessão atual
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Erro ao verificar sessão inicial:', error);
        } else if (session?.user) {
          await loadUserProfile(session.user);
        }
        
        setIsLoading(false);
        
      } catch (error) {
        console.error('❌ Erro ao verificar autenticação:', error);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Listener simples apenas para eventos essenciais
  useEffect(() => {
    if (!hasSupabaseEnv) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Garantir que o perfil seja carregado quando já houver sessão
        if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN') && session?.user) {
          await loadUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          router.push('/auth/login');
        } else if (event === 'USER_UPDATED' && session?.user) {
          // Email alterado detectado - o trigger SQL irá sincronizar automaticamente
          if (session.user.email && user?.email && session.user.email !== user.email) {
            // Trigger SQL irá sincronizar automaticamente
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, user?.email]);

  // Carregar perfil do usuário
  const loadUserProfile = async (supabaseUser: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('❌ Erro ao carregar perfil:', error);
        throw error;
      }

      setUser(profile);
      return profile;
    } catch (error) {
      console.error('❌ Erro ao carregar perfil:', error);
      throw error;
    }
  };

    // Função removida - agora a sincronização é automática via trigger

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!hasSupabaseEnv) {
        setError('Configuração do Supabase ausente. Adicione NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.');
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Erro no login:', error);
        
        // Tratamento específico para diferentes tipos de erro
        let errorMessage = 'Erro ao fazer login. Tente novamente.';
        
        if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email não confirmado. Verifique sua caixa de entrada e confirme o email antes de fazer login.';
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos. Verifique suas credenciais.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'Usuário não encontrado. Verifique se o email está correto.';
        }
        
        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Buscar perfil do usuário
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('❌ Erro ao buscar perfil:', profileError);
          // Mesmo com erro no perfil, permitir login com dados básicos
          const defaultProfile: Profile = {
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.name || 'Usuário',
            role: 'cliente',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setUser(defaultProfile);
        } else if (profile) {
          setUser(profile);
        }

        setIsLoading(false);
        router.push('/');
      }
    } catch (error) {
      console.error('❌ Erro inesperado no login:', error);
      setError('Erro inesperado. Tente novamente.');
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (!hasSupabaseEnv) {
        setUser(null);
        setIsLoading(false);
        router.push('/auth/login');
        return;
      }

      // Fazer logout no Supabase primeiro
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Erro no logout do Supabase:', error);
        throw error;
      }

      console.log('✅ Logout realizado, redirecionando...');
      
      // Limpar estado imediatamente
      setUser(null);
      setIsLoading(false);
      
      // Redirecionar para login
      router.push('/auth/login');
      
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      // Mesmo com erro, limpar estado e redirecionar
      setUser(null);
      setIsLoading(false);
      router.push('/auth/login');
    }
  };

  // Função de emergência para reset completo
  const emergencyReset = () => {
    console.log('🚨 Reset de emergência ativado!');
    setUser(null);
    setIsLoading(false);
    window.location.href = '/auth/login';
  };

  const register = async (userData: { name: string; email: string; password: string; confirmPassword: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!hasSupabaseEnv) {
        setError('Configuração do Supabase ausente. Adicione NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.');
        setIsLoading(false);
        return;
      }

      // Definir role padrão como 'cliente' se não fornecido
      const defaultRole: 'cliente' | 'funcionario' | 'administrador' = 'cliente';
      
      // Criar usuário no Supabase Auth
      // O trigger handle_new_user criará automaticamente o perfil na tabela profiles
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: defaultRole,
          }
        }
      });

      if (authError) {
        console.error('❌ Erro no registro:', authError);
        throw authError;
      }

      if (authData.user) {
        
        // ✅ CORREÇÃO: NÃO fazer login automático
        // ✅ CORREÇÃO: NÃO carregar perfil
        // ✅ CORREÇÃO: NÃO redirecionar para área restrita
        
        // Em vez disso, mostrar mensagem de sucesso e redirecionar para login
        setError(`✅ Conta criada com sucesso!\n\n📧 Um email de confirmação foi enviado para ${userData.email}.\n\n⚠️ IMPORTANTE: Você deve clicar no link do email para ativar sua conta antes de fazer login.`);
        
        // Aguardar um momento para o usuário ver a mensagem
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Redirecionar para a tela de login
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('❌ Erro inesperado no registro:', error);
      setError(error instanceof Error ? error.message : 'Erro inesperado ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!hasSupabaseEnv) {
        setError('Configuração do Supabase ausente. Adicione NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.');
        setIsLoading(false);
        return;
      }

        const { error } = await supabase.auth.resend({
          type: 'signup',
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/confirm-email`,
          },
        });

      if (error) {
        console.error('❌ Erro ao reenviar email de confirmação:', error);
        setError('Erro ao reenviar email de confirmação. Tente novamente.');
      } else {
        setError('Email de confirmação reenviado com sucesso. Verifique sua caixa de entrada.');
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao reenviar email de confirmação:', error);
      setError('Erro inesperado ao reenviar email de confirmação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    logout,
    register,
    resendConfirmationEmail,
    emergencyReset,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
