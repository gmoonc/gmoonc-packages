'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AnaliseCobertura, AnaliseCoberturaFormData } from '@/types/analises';

interface AnaliseFormProps {
  initialData?: AnaliseCobertura | null;
  onSubmit: (formData: AnaliseCoberturaFormData) => void;
  onCancel: () => void;
}

export default function AnaliseForm({ initialData, onSubmit, onCancel }: AnaliseFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<AnaliseCoberturaFormData>({
    nome: '',
    email: '',
    telefone: '',
    nome_fazenda: '',
    area_fazenda_ha: '',
    latitude: '',
    longitude: '',
    observacoes: ''
  });
  const [errors, setErrors] = useState<Partial<AnaliseCoberturaFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    
    if (initialData) {
      setFormData({
        nome: initialData.nome,
        email: initialData.email,
        telefone: initialData.telefone || '',
        nome_fazenda: initialData.nome_fazenda,
        area_fazenda_ha: initialData.area_fazenda_ha?.toString() || '',
        latitude: initialData.latitude?.toString() || '',
        longitude: initialData.longitude?.toString() || '',
        observacoes: initialData.observacoes || ''
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
    const newErrors: Partial<AnaliseCoberturaFormData> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.nome_fazenda.trim()) {
      newErrors.nome_fazenda = 'Nome da fazenda é obrigatório';
    }

    if (formData.area_fazenda_ha && isNaN(Number(formData.area_fazenda_ha))) {
      newErrors.area_fazenda_ha = 'Área deve ser um número válido';
    }

    // Validação melhorada para latitude
    if (formData.latitude) {
      const lat = Number(formData.latitude);
      if (isNaN(lat)) {
        newErrors.latitude = 'Latitude deve ser um número válido';
      } else if (lat < -90 || lat > 90) {
        newErrors.latitude = 'Latitude deve estar entre -90 e +90 graus';
      }
    }

    // Validação melhorada para longitude
    if (formData.longitude) {
      const lng = Number(formData.longitude);
      if (isNaN(lng)) {
        newErrors.longitude = 'Longitude deve ser um número válido';
      } else if (lng < -180 || lng > 180) {
        newErrors.longitude = 'Longitude deve estar entre -180 e +180 graus';
      }
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

  const handleInputChange = (field: keyof AnaliseCoberturaFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="analise-form-container">
      <form onSubmit={handleSubmit} className="analise-form">
        <div className="form-grid-compact">
          {/* Nome - Ocupa 2 colunas */}
          <div className="form-group span-2">
            <label htmlFor="nome" className="form-label">
              Nome <span className="required">*</span>
            </label>
            <input
              id="nome"
              type="text"
              placeholder="Seu nome completo"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              className={`form-input ${errors.nome ? 'error' : ''}`}
            />
            {errors.nome && <span className="error-message">{errors.nome}</span>}
          </div>

          {/* Email - Ocupa 2 colunas */}
          <div className="form-group span-2">
            <label htmlFor="email" className="form-label">
              E-mail <span className="required">*</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`form-input ${errors.email ? 'error' : ''}`}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* Telefone - Ocupa 1 coluna */}
          <div className="form-group">
            <label htmlFor="telefone" className="form-label">
              Telefone
            </label>
            <input
              id="telefone"
              type="tel"
              placeholder="(00) 00000-0000"
              value={formData.telefone}
              onChange={(e) => handleInputChange('telefone', e.target.value)}
              className="form-input"
            />
          </div>

          {/* Nome da Fazenda - Ocupa 2 colunas */}
          <div className="form-group span-2">
            <label htmlFor="nome_fazenda" className="form-label">
              Nome da Fazenda <span className="required">*</span>
            </label>
            <input
              id="nome_fazenda"
              type="text"
              placeholder="Nome da propriedade"
              value={formData.nome_fazenda}
              onChange={(e) => handleInputChange('nome_fazenda', e.target.value)}
              className={`form-input ${errors.nome_fazenda ? 'error' : ''}`}
            />
            {errors.nome_fazenda && <span className="error-message">{errors.nome_fazenda}</span>}
          </div>

          {/* Área da Fazenda - Ocupa 1 coluna */}
          <div className="form-group">
            <label htmlFor="area_fazenda_ha" className="form-label">
              Área da Fazenda (ha)
            </label>
            <input
              id="area_fazenda_ha"
              type="number"
              step="0.01"
              min="0"
              placeholder="Digite a área em hectares"
              value={formData.area_fazenda_ha}
              onChange={(e) => handleInputChange('area_fazenda_ha', e.target.value)}
              className={`form-input ${errors.area_fazenda_ha ? 'error' : ''}`}
            />
            {errors.area_fazenda_ha && <span className="error-message">{errors.area_fazenda_ha}</span>}
          </div>

          {/* Latitude - Ocupa 1 coluna */}
          <div className="form-group">
            <label htmlFor="latitude" className="form-label">
              Latitude
            </label>
            <input
              id="latitude"
              type="number"
              step="0.00000001"
              placeholder="Ex: -15.7801 (entre -90 e +90)"
              value={formData.latitude}
              onChange={(e) => handleInputChange('latitude', e.target.value)}
              className={`form-input ${errors.latitude ? 'error' : ''}`}
            />
            {errors.latitude && <span className="error-message">{errors.latitude}</span>}
          </div>

          {/* Longitude - Ocupa 1 coluna */}
          <div className="form-group">
            <label htmlFor="longitude" className="form-label">
              Longitude
            </label>
            <input
              id="longitude"
              type="number"
              step="0.00000001"
              placeholder="Ex: -47.9292 (entre -180 e +180)"
              value={formData.longitude}
              onChange={(e) => handleInputChange('longitude', e.target.value)}
              className={`form-input ${errors.longitude ? 'error' : ''}`}
            />
            {errors.longitude && <span className="error-message">{errors.longitude}</span>}
          </div>

          {/* Observações - Ocupa todas as 3 colunas */}
          <div className="form-group span-3">
            <label htmlFor="observacoes" className="form-label">
              Observações
            </label>
            <textarea
              id="observacoes"
              rows={3}
              placeholder="Informações adicionais sobre a análise..."
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              className="form-textarea"
            />
          </div>
        </div>

        {/* Ações do formulário */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-button"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {initialData ? 'Atualizar Análise' : 'Criar Análise'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
