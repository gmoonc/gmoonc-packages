'use client';

import { useState } from 'react';
import Link from 'next/link';

async function sendPasswordRecoveryEmail(email: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Configuração do Supabase ausente.');
  }

  const redirectTo = `${window.location.origin}/auth/confirm`;
  const url = new URL(`${supabaseUrl}/auth/v1/recover`);
  url.searchParams.set('redirect_to', redirectTo);

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseAnonKey,
      'X-Client-Info': 'sicoop-web',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    let message = 'Erro ao enviar e-mail de recuperação. Verifique se o e-mail está correto.';

    try {
      const data = await response.json();
      if (data?.msg) {
        message = data.msg;
      } else if (data?.error_description) {
        message = data.error_description;
      } else if (data?.error) {
        message = data.error;
      }
    } catch (parseError) {
      console.error('Erro ao interpretar resposta do Supabase:', parseError);
    }

    throw new Error(message);
  }
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Recuperação de senha para:', email);
      
      // Implementar recuperação de senha com Supabase
      await sendPasswordRecoveryEmail(email);

      setIsSent(true);

    } catch (err) {
      console.error('Erro ao enviar e-mail de recuperação:', err);
      setError(err instanceof Error ? err.message : 'Erro ao enviar e-mail de recuperação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <img
              src="/logo.png"
              alt="Logo Goalmoon - Sicoop"
              className="auth-logo"
            />
            <h1>E-mail Enviado</h1>
            <p>Verifique sua caixa de entrada</p>
          </div>

          <div className="auth-success">
            <p>
              Enviamos um link de recuperação para <strong>{email}</strong>.
              Clique no link para redefinir sua senha.
            </p>
          </div>

          <div className="auth-links">
            <Link href="/auth/login" className="auth-link">
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <img
            src="/logo.png"
            alt="Logo Goalmoon - Sicoop"
            className="auth-logo"
          />
          <h1>Recuperar Senha</h1>
          <p>Digite seu e-mail para receber o link de recuperação</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
          </button>
        </form>

        <div className="auth-links">
          <Link href="/auth/login" className="auth-link">
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}
