'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Lock, ArrowLeft, Save, Key } from 'lucide-react';

interface UserEditProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string | null;
    created_at: string | null;
    updated_at: string | null;
  };
  onBack: () => void;
  onUserUpdated: () => void;
}

export default function UserEdit({ user, onBack, onUserUpdated }: UserEditProps) {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email
  });
  const [newEmail, setNewEmail] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });

  // Verificar se está editando o próprio perfil
  const isEditingSelf = currentUser?.id === user.id;

  // Resetar status quando componente montar
  useEffect(() => {
    setMessage('');
    setError('');
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculatePasswordStrength = (password: string) => {
    if (!password) {
      return { score: 0, label: '', color: '' };
    }

    let score = 0;
    
    // Critério 1: Comprimento
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Critério 2: Maiúsculas
    if (/[A-Z]/.test(password)) score += 1;
    
    // Critério 3: Minúsculas
    if (/[a-z]/.test(password)) score += 1;
    
    // Critério 4: Números
    if (/[0-9]/.test(password)) score += 1;
    
    // Critério 5: Símbolos
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    // Penalizar sequências óbvias
    if (/(.)\1{2,}/.test(password) || /123|abc|qwerty|password/i.test(password)) {
      score = Math.max(0, score - 2);
    }

    // Definir força baseada no score
    if (score <= 2) return { score, label: 'Fraca', color: '#ef4444' };
    if (score <= 4) return { score, label: 'Média', color: '#f59e0b' };
    return { score, label: 'Forte', color: '#71b399' };
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    // Calcular força apenas para o campo de nova senha
    if (name === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      // Atualizar nome usando função RPC
      const { error } = await supabase
        .rpc('update_profile_name', {
          user_id: user.id,
          new_name: formData.name
        });

      if (error) {
        throw error;
      }

      setMessage('✅ Perfil atualizado com sucesso!');
      onUserUpdated();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setError('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPasswordLoading) return;

    setIsPasswordLoading(true);
    setPasswordError('');
    setPasswordMessage('');

    try {
      // Validações
      if (!passwordData.currentPassword) {
        setPasswordError('Por favor, digite sua senha atual.');
        setIsPasswordLoading(false);
        return;
      }

      if (passwordData.newPassword.length < 8) {
        setPasswordError('A nova senha deve ter pelo menos 8 caracteres.');
        setIsPasswordLoading(false);
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError('As senhas não coincidem.');
        setIsPasswordLoading(false);
        return;
      }

      // Validar se a senha é forte o suficiente
      if (passwordStrength.score < 3) {
        setPasswordError('Por favor, escolha uma senha mais forte seguindo as recomendações.');
        setIsPasswordLoading(false);
        return;
      }

      // Primeiro, verificar a senha atual tentando fazer login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordData.currentPassword
      });

      if (signInError) {
        setPasswordError('Senha atual incorreta.');
        setIsPasswordLoading(false);
        return;
      }

      // Atualizar senha
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) {
        throw error;
      }

      setPasswordMessage('✅ Senha atualizada com sucesso!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordStrength({ score: 0, label: '', color: '' });
      
      setTimeout(() => setPasswordMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      setPasswordError('Erro ao atualizar senha. Tente novamente.');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleEmailChange = useCallback(async () => {
    console.log('🚀 handleEmailChange iniciado');
    
    if (!newEmail || newEmail === user.email) {
      setError('Por favor, insira um novo email diferente do atual.');
      return;
    }

    // Validação de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setError('Por favor, insira um email válido.');
      return;
    }

    try {
      console.log('Iniciando processo de troca de email...');
      
      // Verificar se o usuário está autenticado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não está autenticado. Faça login novamente.');
      }

      // Chamar updateUser para solicitar alteração de email
      console.log('📧 Solicitando alteração para:', newEmail);
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });
      
      if (error) {
        throw error;
      }
      
      // Deslogar o usuário IMEDIATAMENTE para garantir segurança
      try {
        await supabase.auth.signOut();
      } catch (logoutError) {
        console.error('Erro no logout:', logoutError);
      }
      
      // Redirecionar para página de instruções
      const instructionsUrl = `/auth/email-change-instructions?email=${encodeURIComponent(newEmail)}`;
      
      // Timeout de segurança para garantir redirecionamento
      setTimeout(() => {
        window.location.href = instructionsUrl;
      }, 1000);
      
      // Tentar redirecionamento imediato
      window.location.href = instructionsUrl;
      
    } catch (error) {
      console.error('Erro ao alterar email:', error);
      setError(error instanceof Error ? error.message : 'Erro inesperado ao alterar email.');
    }
  }, [newEmail, user.email]);

  return (
    <div className="user-edit-page">
      {/* Header */}
      <div className="user-edit-header">
        <button onClick={onBack} className="back-button" aria-label="Voltar">
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
        <div className="header-content">
          <h1 className="page-title">Gerenciar Minha Conta</h1>
          <p className="page-subtitle">Configure suas informações pessoais e preferências de segurança</p>
        </div>
      </div>

      {/* Grid de Cards */}
      <div className="user-edit-grid">
        {/* Card: Informações Pessoais */}
        <div className="user-edit-card">
          <div className="card-header">
            <div className="card-icon">
              <User size={24} />
            </div>
            <div>
              <h2 className="card-title">Informações Pessoais</h2>
              <p className="card-description">Atualize seu nome e informações básicas</p>
            </div>
          </div>

          {message && (
            <div className="alert alert-success">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="card-form">
            <div className="form-field">
              <label htmlFor="name" className="form-label">
                <User size={16} />
                Nome Completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Seu nome completo"
                required
                minLength={2}
                disabled={!isEditingSelf}
              />
            </div>

            <div className="form-field">
              <label htmlFor="email" className="form-label">
                <Mail size={16} />
                Email Atual
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                className="form-input disabled"
                disabled
              />
              <small className="form-hint">
                O email atual não pode ser editado diretamente. Use a seção "Trocar Email" abaixo.
              </small>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading || !isEditingSelf}
            >
              <Save size={18} />
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        </div>

        {/* Card: Alterar Senha */}
        <div className="user-edit-card">
          <div className="card-header">
            <div className="card-icon">
              <Lock size={24} />
            </div>
            <div>
              <h2 className="card-title">Segurança da Conta</h2>
              <p className="card-description">Altere sua senha para manter sua conta segura</p>
            </div>
          </div>

          {passwordMessage && (
            <div className="alert alert-success">
              {passwordMessage}
            </div>
          )}

          {passwordError && (
            <div className="alert alert-error">
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="card-form">
            <div className="form-field">
              <label htmlFor="currentPassword" className="form-label">
                <Lock size={16} />
                Senha Atual
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="form-input"
                placeholder="Digite sua senha atual"
                required
                disabled={isPasswordLoading}
              />
            </div>

            <div className="form-field">
              <label htmlFor="newPassword" className="form-label">
                <Key size={16} />
                Nova Senha
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="form-input"
                placeholder="Digite sua nova senha"
                required
                minLength={8}
                disabled={isPasswordLoading}
              />
              
              {/* Indicador de Força da Senha */}
              {passwordData.newPassword && (
                <div className="password-strength-container">
                  <div className="password-strength-bar">
                    <div 
                      className="password-strength-fill"
                      style={{
                        width: `${(passwordStrength.score / 6) * 100}%`,
                        backgroundColor: passwordStrength.color
                      }}
                    />
                  </div>
                  <span 
                    className="password-strength-label"
                    style={{ color: passwordStrength.color }}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="confirmPassword" className="form-label">
                <Lock size={16} />
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="form-input"
                placeholder="Confirme sua nova senha"
                required
                minLength={8}
                disabled={isPasswordLoading}
              />
            </div>

            {/* Dicas de Senha */}
            <div className="password-tips">
              <h4 className="password-tips-title">Recomendações de Senha:</h4>
              <ul className="password-tips-list">
                <li className={passwordData.newPassword.length >= 8 ? 'tip-met' : ''}>
                  Mínimo: 8 caracteres (recomendado: 12+)
                </li>
                <li className={/[A-Z]/.test(passwordData.newPassword) && /[a-z]/.test(passwordData.newPassword) && /[0-9]/.test(passwordData.newPassword) && /[^A-Za-z0-9]/.test(passwordData.newPassword) ? 'tip-met' : ''}>
                  Combine: maiúsculas, minúsculas, números e símbolos
                </li>
                <li>
                  Evite: informações pessoais e sequências óbvias
                </li>
                <li>
                  Use: senha única para esta conta
                </li>
              </ul>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isPasswordLoading}
            >
              <Lock size={18} />
              {isPasswordLoading ? 'Atualizando...' : 'Atualizar Senha'}
            </button>
          </form>
        </div>

        {/* Card: Trocar Email */}
        <div className="user-edit-card">
          <div className="card-header">
            <div className="card-icon">
              <Mail size={24} />
            </div>
            <div>
              <h2 className="card-title">Alterar Email</h2>
              <p className="card-description">Atualize seu endereço de email principal</p>
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleEmailChange(); }} className="card-form">
            <div className="form-field">
              <label htmlFor="newEmail" className="form-label">
                <Mail size={16} />
                Novo Email
              </label>
              <input
                type="email"
                id="newEmail"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="form-input"
                placeholder="Digite o novo email"
                required
              />
              <small className="form-hint">
                Um email de confirmação será enviado para o novo endereço.
              </small>
            </div>

            <button
              type="submit"
              className="btn btn-secondary"
              disabled={!newEmail || newEmail === user.email}
            >
              <Mail size={18} />
              Solicitar Alteração
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}