'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function ConfirmEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Simular processo de confirmação
        // Em um caso real, você faria uma chamada para a API
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setStatus('success');
        setMessage('✅ Seu email foi confirmado com sucesso!\n\n🎉 Sua conta está agora ativa e você pode fazer login.');
        
      } catch (error) {
        console.error('Erro ao confirmar email:', error);
        setStatus('error');
        setMessage('❌ Erro ao confirmar email. Tente novamente ou entre em contato com o suporte.');
      }
    };

    confirmEmail();
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <img
            src="/logo.png"
            alt="Logo Goalmoon - Sicoop"
            className="auth-logo"
          />
          <h1>Confirmação de Email</h1>
          <p>Sicoop - Sistema da Goalmoon</p>
        </div>

        <div className="auth-content">
          {status === 'loading' && (
            <div className="auth-loading">
              <div className="loading-spinner"></div>
              <p>Confirmando seu email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="auth-success">
              <div className="success-icon">🎉</div>
              <div className="success-message">
                {message.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
              <Link href="/auth/login" className="auth-button">
                Ir para Login
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="auth-error">
              <div className="error-icon">❌</div>
              <div className="error-message">
                {message.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
              <div className="auth-actions">
                <Link href="/auth/login" className="auth-link">
                  Tentar Login
                </Link>
                <Link href="/auth/register" className="auth-link">
                  Criar Nova Conta
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
