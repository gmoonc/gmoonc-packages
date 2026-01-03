'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError, resendConfirmationEmail } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError(); // Limpar erro anterior

    try {
      await login(email, password);
    } catch {
      // Erro já é tratado no contexto, não precisa fazer nada aqui
      console.log('Login falhou, erro tratado no contexto');
    }
  };

  const handleResendConfirmation = async () => {
    if (email) {
      await resendConfirmationEmail(email);
    }
  };

  const isEmailNotConfirmed = error && error.includes('Email não confirmado');

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <img
            src="/logo.png"
            alt="Logo Goalmoon - Sicoop"
            className="auth-logo"
          />
          <h1>Sicoop</h1>
          <p>Sistema de Controle de Operações da Goalmoon</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              {error}
              {isEmailNotConfirmed && (
                <div className="auth-error-actions">
                  <p className="auth-instructions">
                    📧 <strong>Para ativar sua conta:</strong>
                    <br />
                    1. Verifique sua caixa de entrada (e spam)
                    <br />
                    2. Clique no link de confirmação
                    <br />
                    3. Volte aqui e faça login
                  </p>
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={isLoading}
                    className="auth-resend-button"
                  >
                    {isLoading ? 'Enviando...' : 'Reenviar Email de Confirmação'}
                  </button>
                </div>
              )}
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
              autoComplete="username"
              data-lpignore="false"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              required
              disabled={isLoading}
              autoComplete="current-password"
              data-lpignore="false"
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="auth-links">
          <Link href="/auth/forgot-password" className="auth-link">
            Esqueceu sua senha?
          </Link>
          <Link href="/auth/register" className="auth-link">
            Criar conta
          </Link>
        </div>
      </div>
    </div>
  );
}
