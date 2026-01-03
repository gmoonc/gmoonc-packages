import React from 'react';
import { render, screen } from '@testing-library/react';
import SicoopAbout from '@/components/SicoopAbout';

describe('SicoopAbout', () => {
  it('deve renderizar o componente SicoopAbout', () => {
    render(<SicoopAbout />);
    
    expect(screen.getByText('Goalmoon')).toBeInTheDocument();
    expect(screen.getByText(/Sistema de Controle de Operações/)).toBeInTheDocument();
  });

  it('deve exibir informações da empresa Goalmoon', () => {
    render(<SicoopAbout />);
    
    expect(screen.getByText('Goalmoon')).toBeInTheDocument();
    expect(screen.getByAltText('Logo Goalmoon')).toBeInTheDocument();
    expect(screen.getByText(/A Goalmoon é uma empresa especializada/)).toBeInTheDocument();
  });

  it('deve exibir descrição do sistema Sicoop', () => {
    render(<SicoopAbout />);
    
    expect(screen.getByRole('heading', { name: /O que é o Sicoop\?/ })).toBeInTheDocument();
    expect(screen.getByText('Sicoop')).toBeInTheDocument();
    expect(screen.getByText(/plataforma integrada desenvolvida pela Goalmoon/)).toBeInTheDocument();
  });

  it('deve exibir os recursos principais do sistema', () => {
    render(<SicoopAbout />);
    
    // Verificar se os recursos estão presentes
    expect(screen.getByText('🔐')).toBeInTheDocument();
    expect(screen.getByText('Controle de Acesso')).toBeInTheDocument();
    
    expect(screen.getByText('📊')).toBeInTheDocument();
    expect(screen.getByText('Gestão Financeira')).toBeInTheDocument();
    
    expect(screen.getByText('👥')).toBeInTheDocument();
    expect(screen.getByText('Gestão de Pessoas')).toBeInTheDocument();
    
    expect(screen.getByText('🛠️')).toBeInTheDocument();
    expect(screen.getByText('Suporte Técnico')).toBeInTheDocument();
  });

  it('deve exibir informações técnicas', () => {
    render(<SicoopAbout />);
    
    expect(screen.getByRole('heading', { name: /Tecnologia/ })).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
    
    // Verificar tecnologias específicas
    expect(screen.getByText('Next.js 14 com App Router')).toBeInTheDocument();
    expect(screen.getByText('React 18 com TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Supabase para autenticação')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL para banco de dados')).toBeInTheDocument();
  });

  it('deve exibir informações de contato', () => {
    render(<SicoopAbout />);
    
    expect(screen.getByRole('heading', { name: /Contato/ })).toBeInTheDocument();
    expect(screen.getByText(/Para mais informações sobre o Sicoop/)).toBeInTheDocument();
  });

  it('deve ter estrutura HTML correta', () => {
    render(<SicoopAbout />);
    
    // Verificar se os elementos principais estão presentes
    expect(screen.getByRole('heading', { name: /Goalmoon/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /O que é o Sicoop\?/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Tecnologia/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Contato/ })).toBeInTheDocument();
  });

  it('deve exibir descrições dos recursos', () => {
    render(<SicoopAbout />);
    
    // Verificar se as descrições dos recursos estão presentes
    expect(screen.getByText(/Sistema de permissões baseado em roles/)).toBeInTheDocument();
    expect(screen.getByText(/Controle completo de operações financeiras/)).toBeInTheDocument();
    expect(screen.getByText(/Sistema completo para cadastro e gestão de pessoas/)).toBeInTheDocument();
    expect(screen.getByText(/Help-desk integrado para gestão de ocorrências/)).toBeInTheDocument();
  });

  it('deve ter layout responsivo', () => {
    render(<SicoopAbout />);
    
    // Verificar se as classes de grid responsivo estão presentes
    const featuresGrid = screen.getByText('Controle de Acesso').closest('.features-grid');
    expect(featuresGrid).toHaveClass('grid', 'md:grid-cols-2');
    
    const technicalInfo = screen.getByText('Frontend').closest('.grid');
    expect(technicalInfo).toHaveClass('grid', 'md:grid-cols-2');
  });
});
