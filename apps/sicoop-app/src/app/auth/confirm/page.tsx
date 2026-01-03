'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function ConfirmPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('🚀 PÁGINA DE CONFIRMAÇÃO CARREGADA');
    
    const handleEmailConfirmation = async () => {
      try {
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const code = searchParams.get('code');
        const next = searchParams.get('next') || '/auth/reset-password';

        // Debug temporário
        console.log('🔍 PARÂMETROS RECEBIDOS:', {
          token_hash: token_hash ? 'Presente' : 'Ausente',
          type: type || 'Ausente',
          code: code ? 'Presente' : 'Ausente',
          next: next
        });

        // PRIORIDADE 1: verifyOtp com token_hash (fluxo recovery/email signup)
        if (token_hash && type) {
          console.log('✅ Usando fluxo verifyOtp com token_hash');
          
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as 'recovery' | 'email',
          });

          if (error) {
            console.error('❌ Erro ao verificar OTP:', error);
            setError(`Erro ao verificar token: ${error.message}. Solicite um novo link de recuperação.`);
            return;
          }

          console.log('✅ OTP verificado com sucesso, redirecionando...');
          router.push(next);
          return;
        }

        // PRIORIDADE 2: exchangeCodeForSession com code (fluxo PKCE)
        if (code) {
          console.log('✅ Usando fluxo PKCE com code');
          
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);

            if (error) {
              console.error('❌ Erro ao trocar code por sessão:', error);
              const message =
                error.message.includes('code verifier')
                  ? 'Não foi possível validar este link automaticamente. Solicite um novo link de recuperação no dispositivo onde a solicitação foi feita.'
                  : error.message;
              setError(`Erro ao verificar link: ${message}. Solicite um novo link de recuperação.`);
              return;
            }

            if (!data || !data.session) {
              console.error('❌ Sessão não retornada após troca de code');
              setError('Erro ao verificar link: Resposta inválida do servidor. Solicite um novo link de recuperação.');
              return;
            }
            
            console.log('✅ Sessão criada com sucesso, redirecionando...');
            router.push(next);
            return;
          } catch (exchangeError) {
            console.error('❌ Erro ao trocar code:', exchangeError);
            setError(`Erro ao verificar link: ${exchangeError instanceof Error ? exchangeError.message : 'Erro desconhecido'}. Solicite um novo link de recuperação.`);
            return;
          }
        }

        console.error('❌ Nenhum parâmetro válido encontrado');
        setError('Link inválido. Parâmetros de recuperação ausentes. Solicite um novo link de recuperação.');
      } catch (err) {
        console.error('❌ Erro geral ao processar:', err);
        setError(`Erro ao processar link de recuperação: ${err instanceof Error ? err.message : 'Erro desconhecido'}. Tente novamente.`);
      } finally {
        setIsLoading(false);
      }
    };

    // Timeout de segurança para evitar loading infinito
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      setError('Timeout: O processamento do link demorou muito. Tente novamente.');
    }, 10000); // 10 segundos

    handleEmailConfirmation().finally(() => {
      clearTimeout(timeoutId);
    });
  }, [searchParams, router]);

  if (isLoading) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <img 
              src="/logo.png" 
              alt="Logo Goalmoon - Sicoop" 
              className="auth-logo" 
            />
            <h1>Verificando Link...</h1>
            <p>Aguarde enquanto verificamos seu link de recuperação</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <img
              src="/logo.png"
              alt="Logo Goalmoon - Sicoop"
              className="auth-logo"
            />
            <h1>Link Inválido</h1>
            <p>Não foi possível processar seu link de recuperação</p>
          </div>

          <div className="auth-error">
            <p>{error}</p>
          </div>

          <div className="auth-links">
            <a href="/auth/forgot-password" className="auth-link">
              Solicitar novo link de recuperação
            </a>
            <a href="/auth/login" className="auth-link">
              Voltar para o login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <img
              src="/logo.png"
              alt="Logo Goalmoon - Sicoop"
              className="auth-logo"
            />
            <h1>Carregando...</h1>
            <p>Aguarde enquanto processamos seu link</p>
          </div>
        </div>
      </div>
    }>
      <ConfirmPageContent />
    </Suspense>
  );
}
