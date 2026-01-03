# 📚 Documentação do Projeto Sicoop

Bem-vindo à documentação completa do projeto Sicoop! Esta pasta contém toda a documentação técnica, guias de instalação, configuração e desenvolvimento do sistema.

## 📋 Índice da Documentação

### 🚀 Configuração e Instalação
- [**INSTALACAO.md**](./INSTALACAO.md) - Guia completo de instalação e configuração inicial
- [**SETUP-COMPLETO.md**](./SETUP-COMPLETO.md) - Setup detalhado do ambiente de desenvolvimento
- [**SUPABASE-SETUP.md**](./SUPABASE-SETUP.md) - Configuração do Supabase e banco de dados

### 🧪 Testes e Qualidade
- [**📁 Testes/**](./Testes/) - **Pasta completa de documentação de testes**
  - [TESTING.md](./Testes/TESTING.md) - Documentação completa de testes unitários
  - [EXEMPLOS_TESTES.md](./Testes/EXEMPLOS_TESTES.md) - Exemplos práticos de testes
  - [GUIA_RAPIDO_TESTES.md](./Testes/GUIA_RAPIDO_TESTES.md) - Referência rápida
  - [MAPEAMENTO_TESTES.md](./Testes/MAPEAMENTO_TESTES.md) - **Mapeamento e planejamento de testes**

### 🔧 Desenvolvimento
- [**MIGRATIONS.md**](./MIGRATIONS.md) - Gerenciamento de migrações do banco de dados
- [**EDGE_FUNCTION_SETUP.md**](./EDGE_FUNCTION_SETUP.md) - Configuração de Edge Functions
- [**EXEMPLOS.md**](./EXEMPLOS.md) - Exemplos de uso e implementação

### 🔐 Segurança e Permissões
- [**SECURITY.md**](./SECURITY.md) - Políticas de segurança e boas práticas
- [**PERMISSOES-README.md**](./PERMISSOES-README.md) - Sistema de permissões e autorizações

### 📊 Outros Documentos
- [**RESUMO.md**](./RESUMO.md) - Resumo geral do projeto
- [**TESTE-EXCLUSAO.md**](./TESTE-EXCLUSAO.md) - Testes de funcionalidades de exclusão

## 🎯 Documentação de Testes (Nova!)

### 📁 [Testes/](./Testes/) - Pasta Completa de Documentação

A documentação de testes foi organizada em uma pasta dedicada com os seguintes arquivos:

#### 📖 [TESTING.md](./Testes/TESTING.md)
Documentação completa e unificada sobre como funcionam os testes no projeto Sicoop, incluindo:

- ✅ **Configuração do Jest** com Next.js e TypeScript
- ✅ **Estrutura de testes** e convenções de nomenclatura
- ✅ **Comandos de execução** (test, test:watch, test:coverage)
- ✅ **Mocks e utilitários** para Supabase e React
- ✅ **Cobertura de código** e thresholds configurados
- ✅ **Boas práticas** e troubleshooting
- ✅ **Exemplos práticos** de implementação

#### 📝 [EXEMPLOS_TESTES.md](./Testes/EXEMPLOS_TESTES.md)
Exemplos práticos e detalhados de como escrever testes para:

- 🧩 **Componentes React** (renderização, interações, formulários)
- 🎣 **Hooks customizados** (useMensagens, useAnalises, usePermissions)
- 🏗️ **Contextos** (AuthContext, providers)
- 🛠️ **Utilitários** (validação, formatação, helpers)
- 🌐 **API Routes** (GET, POST, validação de dados)
- 🎯 **Cenários avançados** (integração, performance, acessibilidade)

#### ⚡ [GUIA_RAPIDO_TESTES.md](./Testes/GUIA_RAPIDO_TESTES.md)
Referência rápida para desenvolvimento diário:

- 🚀 **Comandos essenciais** para execução de testes
- 📁 **Templates de teste** para diferentes tipos de código
- 🎭 **Mocks comuns** para Supabase, Contextos, Next.js
- 🔍 **Matchers úteis** do Jest e Testing Library
- ⚠️ **Troubleshooting rápido** para problemas comuns

#### 🗺️ [MAPEAMENTO_TESTES.md](./Testes/MAPEAMENTO_TESTES.md) - **NOVO!**
Mapa completo do status dos testes e planejamento:

- 📊 **Status atual** de todos os componentes, hooks, APIs
- 🎯 **Plano de implementação** dividido em 6 fases
- ⏱️ **Estimativas de tempo** para cada item
- 🏷️ **Prioridades e complexidade** de cada teste
- 📈 **Métricas de progresso** e objetivos por fase

## 🚀 Como Usar Esta Documentação

### Para Desenvolvedores Iniciantes
1. Comece com [INSTALACAO.md](./INSTALACAO.md) para configurar o ambiente
2. Leia [Testes/TESTING.md](./Testes/TESTING.md) para entender como testar o código
3. Consulte [Testes/EXEMPLOS_TESTES.md](./Testes/EXEMPLOS_TESTES.md) para exemplos práticos

### Para Desenvolvedores Experientes
1. Use [Testes/GUIA_RAPIDO_TESTES.md](./Testes/GUIA_RAPIDO_TESTES.md) como referência rápida
2. Consulte [Testes/EXEMPLOS_TESTES.md](./Testes/EXEMPLOS_TESTES.md) para padrões específicos
3. Revise [SECURITY.md](./SECURITY.md) para boas práticas de segurança

### Para Planejamento de Testes
1. Consulte [Testes/MAPEAMENTO_TESTES.md](./Testes/MAPEAMENTO_TESTES.md) para ver o status atual
2. Siga o plano de implementação por fases
3. Use as estimativas de tempo para planejamento

### Para DevOps/CI/CD
1. Consulte [SETUP-COMPLETO.md](./SETUP-COMPLETO.md) para configuração de produção
2. Use [Testes/TESTING.md](./Testes/TESTING.md) para configurar pipelines de teste
3. Revise [MIGRATIONS.md](./MIGRATIONS.md) para gerenciamento de banco

## 📊 Status dos Testes

### ✅ Configuração Atual
- **Framework**: Jest + React Testing Library
- **Cobertura**: 5.82% (meta: 70%)
- **Testes Passando**: 7/7 (100%)
- **Suites de Teste**: 2 ativas

### 🎯 Próximos Passos
- Expandir cobertura de testes para componentes existentes
- Adicionar testes para hooks adicionais
- Implementar testes de integração
- Configurar testes de acessibilidade

## 🔄 Atualizações Recentes

### Janeiro 2025
- ✅ **Nova documentação de testes** criada
- ✅ **Configuração do Jest** corrigida e otimizada
- ✅ **Mocks do Supabase** configurados adequadamente
- ✅ **Exemplos práticos** adicionados
- ✅ **Guia de troubleshooting** incluído

## 🤝 Contribuindo

Para contribuir com a documentação:

1. **Leia** a documentação existente
2. **Identifique** lacunas ou melhorias necessárias
3. **Crie** ou **atualize** os arquivos relevantes
4. **Teste** as instruções fornecidas
5. **Submeta** um pull request com as mudanças

## 📞 Suporte

Se você encontrar problemas ou tiver dúvidas:

1. Consulte a seção de [Troubleshooting](./TESTING.md#troubleshooting)
2. Verifique os [exemplos práticos](./EXEMPLOS_TESTES.md)
3. Abra uma issue no repositório do projeto
4. Entre em contato com a equipe de desenvolvimento

---

**Última atualização**: Janeiro 2025  
**Versão da documentação**: 1.0.0  
**Status**: ✅ Atualizada e completa
