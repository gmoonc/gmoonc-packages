'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'cliente' | 'funcionario' | 'administrador';
  requiredModule?: string; // Novo: módulo específico necessário
  requiredPermission?: 'access' | 'create' | 'read' | 'update' | 'delete'; // Novo: tipo de permissão
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  requiredModule, 
  requiredPermission = 'access' 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    // Só redirecionar se não estiver carregando e não estiver autenticado
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Verificar permissões específicas do módulo
  useEffect(() => {
    const checkModulePermission = async () => {
      if (!user || !requiredModule) {
        setHasPermission(true);
        return;
      }

      try {
        // Se for administrador, sempre permitir
        if (user.role === 'administrador') {
          setHasPermission(true);
          return;
        }

        // Verificar permissão específica usando a função do banco
        const {
          data: { session }
        } = await supabase.auth.getSession();

        const { data, error } = await fetch('/api/check-permission', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token
              ? { Authorization: `Bearer ${session.access_token}` }
              : {})
          },
          body: JSON.stringify({
            userId: user.id,
            moduleName: requiredModule,
            permissionType: requiredPermission
          })
        }).then(res => res.json());

        if (error) {
          console.error('Erro ao verificar permissão:', error);
          setHasPermission(false);
        } else {
          setHasPermission(data);
        }
      } catch (error) {
        console.error('Erro ao verificar permissão:', error);
        setHasPermission(false);
      }
    };

    checkModulePermission();
  }, [user, requiredModule, requiredPermission]);

  // Mostrar loading apenas na primeira verificação
  if (isLoading || (requiredModule && hasPermission === null)) {
    return (
      <div className="loading-container">
        <h1>Carregando...</h1>
        <p>Verificando autenticação e permissões...</p>
      </div>
    );
  }

  // Se não estiver autenticado, mostrar loading até redirecionar
  if (!isAuthenticated) {
    return (
      <div className="loading-container">
        <h1>Redirecionando...</h1>
        <p>Você será redirecionado para o login...</p>
      </div>
    );
  }

  // Se tiver role específica, verificar permissão
  if (requiredRole && user?.role !== requiredRole) {
    router.push('/');
    return null;
  }

  // Se tiver módulo específico, verificar permissão
  if (requiredModule && !hasPermission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">
            Você não tem permissão para acessar este módulo.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  // Se tudo estiver ok, renderizar o conteúdo
  return <>{children}</>;
}
