'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Mensagem, MensagemFormData } from '@/types/mensagens';

interface MensagemFormProps {
  initialData?: Mensagem | null;
  onSubmit: (formData: MensagemFormData) => void;
  onCancel: () => void;
}

export default function MensagemForm({ initialData, onSubmit, onCancel }: MensagemFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<MensagemFormData>({
    nome: '',
    email: '',
    telefone: '',
    empresa_fazenda: '',
    mensagem: ''
  });
  const [errors, setErrors] = useState<Partial<MensagemFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    
    if (initialData) {
      setFormData({
        nome: initialData.nome,
        email: initialData.email,
        telefone: initialData.telefone || '',
        empresa_fazenda: initialData.empresa_fazenda,
        mensagem: initialData.mensagem
      });
    } else if (user) {
      // Preencher com dados do usuário logado
      setFormData(prev => ({
        ...prev,
        nome: user.name || '',
        email: user.email || ''
      }));
    }
    
    hasInitialized.current = true;
  }, [initialData, user]);

  const validateForm = (): boolean => {
    const newErrors: Partial<MensagemFormData> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.empresa_fazenda.trim()) {
      newErrors.empresa_fazenda = 'Empresa/Fazenda é obrigatório';
    }

    if (!formData.mensagem.trim()) {
      newErrors.mensagem = 'Mensagem é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof MensagemFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="mensagem-form-container bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="mensagem-form">
        <div className="form-grid grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome */}
          <div className="form-group md:col-span-2">
            <label htmlFor="nome" className="form-label block text-sm font-medium text-gray-700 mb-2">
              Nome <span className="required text-red-500">*</span>
            </label>
            <input
              id="nome"
              type="text"
              placeholder="Seu nome completo"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              className={`form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-900 ${errors.nome ? 'border-red-500' : ''}`}
            />
            {errors.nome && <span className="error-message text-red-600 text-sm mt-1 block">{errors.nome}</span>}
          </div>

          {/* Email */}
          <div className="form-group md:col-span-2">
            <label htmlFor="email" className="form-label block text-sm font-medium text-gray-700 mb-2">
              E-mail <span className="required text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-900 ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && <span className="error-message text-red-600 text-sm mt-1 block">{errors.email}</span>}
          </div>

          {/* Telefone */}
          <div className="form-group">
            <label htmlFor="telefone" className="form-label block text-sm font-medium text-gray-700 mb-2">
              Telefone
            </label>
            <input
              id="telefone"
              type="tel"
              placeholder="(00) 00000-0000"
              value={formData.telefone}
              onChange={(e) => handleInputChange('telefone', e.target.value)}
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-900"
            />
          </div>

          {/* Empresa/Fazenda */}
          <div className="form-group">
            <label htmlFor="empresa_fazenda" className="form-label block text-sm font-medium text-gray-700 mb-2">
              Empresa/Fazenda <span className="required text-red-500">*</span>
            </label>
            <input
              id="empresa_fazenda"
              type="text"
              placeholder="Nome da sua empresa ou fazenda"
              value={formData.empresa_fazenda}
              onChange={(e) => handleInputChange('empresa_fazenda', e.target.value)}
              className={`form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-900 ${errors.empresa_fazenda ? 'border-red-500' : ''}`}
            />
            {errors.empresa_fazenda && <span className="error-message text-red-600 text-sm mt-1 block">{errors.empresa_fazenda}</span>}
          </div>

          {/* Mensagem */}
          <div className="form-group md:col-span-2">
            <label htmlFor="mensagem" className="form-label block text-sm font-medium text-gray-700 mb-2">
              Mensagem <span className="required text-red-500">*</span>
            </label>
            <textarea
              id="mensagem"
              rows={6}
              placeholder="Descreva como podemos ajudar você"
              value={formData.mensagem}
              onChange={(e) => handleInputChange('mensagem', e.target.value)}
              className={`form-textarea w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical placeholder-gray-900 bg-white text-gray-900 ${errors.mensagem ? 'border-red-500' : ''}`}
              style={{
                minHeight: '120px',
                display: 'block',
                width: '100%'
              }}
            />
            {errors.mensagem && <span className="error-message text-red-600 text-sm mt-1 block">{errors.mensagem}</span>}
          </div>
        </div>

        {/* Ações do formulário */}
        <div className="form-actions flex gap-4 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-button px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-md transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="submit-button px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                {initialData ? 'Atualizar Mensagem' : 'Enviar Mensagem'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
