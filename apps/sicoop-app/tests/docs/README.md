# 📚 Documentação dos Testes Semi-Automatizados

## 🎯 Objetivo

Testes semi-automatizados de interface usando Playwright para validar fluxos de autenticação e gestão de usuários em produção.

## 📁 Estrutura Atual

```
tests/
├── config.test.example              # Template de configuração (versionado)
├── config.test                      # Credenciais reais (NÃO versionado - .gitignore)
├── helpers/
│   ├── test-config.ts              # 📦 Helper para carregar configurações de teste
│   └── test-data-generator.ts      # 🎲 Gerador de dados aleatórios e contador de testes
├── auth/                            # 🔐 Testes de Autenticação
│   ├── user-creation/              # 👤 Criação de Usuário
│   │   ├── create-user.spec.ts     # Criação de usuário
│   │   └── confirm-user.spec.ts   # Confirmação via email
│   ├── authentication/             # 🔑 Autenticação
│   │   ├── login-logout.spec.ts    # Login e logout
│   │   └── login-inspect.spec.ts   # Login para inspeção manual
│   └── password-recovery/          # 🔄 Recuperação e Troca de Senha/Email
│       ├── request-reset-password.spec.ts  # Solicitar reset
│       ├── reset-password.spec.ts  # Confirmar reset e trocar senha
│       ├── change-password.spec.ts  # Trocar senha na página "Gerenciar Minha Conta"
│       ├── change-email.spec.ts    # Trocar email na página "Gerenciar Minha Conta"
│       └── confirm-email-change.spec.ts  # Confirmar troca de email através dos dois links
├── user-management/                 # 👥 Testes de Gestão de Usuário
│   ├── delete-user.spec.ts         # Exclusão de usuário
│   └── change-profile.spec.ts      # Mudança de perfil
├── messages/                        # 📝 Testes de Mensagens
│   ├── create-technical-message.spec.ts  # Criação de mensagem técnica no Sicoop ✅
│   └── generate-clipboard-data.js  # 🛠️ Gerador de dados para clipboard - Mensagens
├── analyses/                        # 🔬 Testes de Análises
│   ├── create-technical-analysis.spec.ts  # Criação de análise técnica no Sicoop ✅
│   └── generate-clipboard-analysis-data.js  # 🛠️ Gerador de dados para clipboard - Análises
├── notifications/                   # 🔔 Testes de Notificações
│   ├── create-category-messages.spec.ts     # Criação de categoria de notificação - Mensagens ✅
│   ├── create-category-analyses.spec.ts     # Criação de categoria de notificação - Análises ✅
│   ├── create-setting-messages.spec.ts      # Criação de configuração de notificação - Mensagens ✅
│   ├── create-setting-analyses.spec.ts      # Criação de configuração de notificação - Análises ✅
│   └── process-manual-notifications.spec.ts  # Processamento manual de notificações pendentes ✅
└── docs/                            # 📚 Esta documentação
    └── README.md                   # Documento atual
```

## 🔧 Como Funciona

### Configuração

1. **Criar arquivo de configuração:**
   ```bash
   cp tests/config.test.example tests/config.test
   ```

2. **Preencher credenciais:**
   ```bash
   # Edite tests/config.test com suas credenciais reais
   ACTUAL_TEST_USER=01                    # Usuário para teste atual
   ACTUAL_TEST_SECOND_USER=02             # Usuário secundário (para testes que requerem dois usuários)
   TEST_ADMIN_USER=02                     # Usuário administrador (opcional)
   TEMPORARY_LINK=                        # Link temporário do usuário principal (preenchido manualmente)
   TEMPORARY_SECOND_USER_LINK=            # Link temporário do usuário secundário (para troca de email)
   TEST_BASE_URL=https://seusite.com      # URL base
   
   # Configuração de cada usuário (01, 02, 03, ...)
   TEST_USER_01_EMAIL=email01@example.com
   TEST_USER_01_CURRENT_PASSWORD=senha_atual
   TEST_USER_01_NEXT_PASSWORD=proxima_senha
   
   # Configuração de categoria de notificação (para testes de notificações)
   NOTIFICATION_CATEGORY_DISPLAY_NAME=Novas Mensagens
   NOTIFICATION_CATEGORY_DESCRIPTION=Notificação quando uma nova mensagem é recebida no sistema
   NOTIFICATION_CATEGORY_SUBJECT=Nova mensagem recebida - Sicoop
   NOTIFICATION_CATEGORY_BODY=Você recebeu uma nova mensagem no sistema Sicoop.\n\n**Detalhes:**\n• Nome: {{nome}}\n• Email: {{email}}\n• Empresa/Fazenda: {{empresa_fazenda}}\n• Mensagem: {{mensagem}}\n\nAcesse o sistema para visualizar e responder.
   ```

### Execução

Cada teste pode ser executado independentemente:

```bash
# Criação de usuário
npm run test:auth:create:headed

# Confirmação (requer link de email colado em config.test)
npm run test:auth:confirm:headed

# Login e logout
npm run test:auth:login:headed

# Login para inspeção manual (pausa e faz logout ao continuar)
npm run test:auth:login:inspect              # Executa todos (desktop, tablet, mobile)
npm run test:auth:login:inspect:desktop     # Modo desktop (1920x1080)
npm run test:auth:login:inspect:tablet      # Modo tablet (768x1024)
npm run test:auth:login:inspect:mobile      # Modo mobile (375x667)

# Reset de senha
npm run test:auth:reset:request:headed      # Solicitar reset
npm run test:auth:reset:confirm:headed      # Confirmar reset

# Troca de senha (requer login)
npm run test:auth:change:password:headed    # Trocar senha na página "Gerenciar Minha Conta"

# Troca de email (requer login e usuário secundário configurado)
npm run test:auth:change:email:headed       # Trocar email na página "Gerenciar Minha Conta"
npm run test:auth:change:email:confirm:headed  # Confirmar troca de email através dos dois links

# Exclusão de usuário
npm run test:user:delete:headed

# Mudança de perfil
npm run test:user:profile:headed

# Criação de categoria de notificação
npm run test:notifications:create:category:headed

# Criação de configuração de notificação
npm run test:notifications:create:setting:headed

# Criação de mensagem técnica no Sicoop
npm run test:messages:create:technical:headed

# Gerar dados para clipboard (sem Playwright) - Mensagens
npm run test:messages:generate:clipboard

# Criação de análise técnica no Sicoop
npm run test:analyses:create:technical:headed

# Gerar dados para clipboard (sem Playwright) - Análises
npm run test:analyses:generate:clipboard

# Criação de categoria de notificação - Mensagens
npm run test:notifications:create:category:messages:headed

# Criação de categoria de notificação - Análises
npm run test:notifications:create:category:analyses:headed

# Criação de configuração de notificação - Mensagens
npm run test:notifications:create:setting:messages:headed

# Criação de configuração de notificação - Análises
npm run test:notifications:create:setting:analyses:headed

# Processamento manual de notificações pendentes
npm run test:notifications:process:manual:headed

# Gerar dados para clipboard (sem Playwright) - Mensagens
npm run test:messages:generate:clipboard

# Gerar dados para clipboard (sem Playwright) - Análises
npm run test:analyses:generate:clipboard

# Comandos adicionais
npm run test:auth:*:headed                  # Executar todos os testes de autenticação em modo visual
npm run test:auth:login                     # Executar teste de login em modo headless (sem interface)
```

## 📦 Componentes Principais

### `helpers/test-config.ts`

**Função:** Carregar configurações de teste do arquivo `config.test` com suporte a múltiplos usuários.

**Por que é importante:**
- ✅ Evita credenciais hardcoded no código
- ✅ Centraliza configurações em um único lugar
- ✅ Suporta múltiplos usuários de teste
- ✅ Arquivo `config.test` está no `.gitignore` (não versionado)
- ✅ Permite selecionar usuário atual via `ACTUAL_TEST_USER`

**Como funciona:**
```typescript
import { getActualUser, getSecondUser, loadTestConfig } from '../helpers/test-config';

test('meu teste', async ({ page }) => {
  const user = getActualUser(); // Obtém usuário configurado em ACTUAL_TEST_USER
  const secondUser = getSecondUser(); // Obtém usuário secundário (se configurado)
    
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.currentPassword);
});
```

**Funções disponíveis:**
- `loadTestConfig()`: Carrega toda a configuração
- `getActualUser()`: Retorna o usuário atual (configurado em `ACTUAL_TEST_USER`)
- `getSecondUser()`: Retorna o usuário secundário (se configurado em `ACTUAL_TEST_SECOND_USER`)
- `getAdminUser()`: Retorna o usuário administrador (se configurado em `TEST_ADMIN_USER`)
- `getUser(userId)`: Retorna um usuário específico por ID
- `getNotificationCategoryConfig()`: Retorna as configurações de categoria de notificação
- `generateMessageData()`: Gera dados únicos aleatórios para mensagens de teste (com contador)
- `getCurrentCounter()`: Retorna o contador atual de testes sem incrementar
- `resetCounter()`: Reseta o contador de testes (útil para testes)

**Interfaces:**
- `TestUser`: Email, senha atual, próxima senha
- `TestConfig`: Usuário atual, usuário secundário, admin, link temporário, link temporário do usuário secundário, usuários disponíveis, configuração de categoria de notificação, configuração de mensagem do website, URL do website
- `NotificationCategoryConfig`: Nome, descrição, assunto e corpo do email da categoria
- `GeneratedMessageData`: Dados gerados aleatoriamente para mensagem de teste, incluindo contador de testes

### Testes de Autenticação (`auth/`)

#### `user-creation/` - Criação de Usuário
- **Objetivo:** Testar o fluxo completo de criação e confirmação de usuário
- **Testes:**
  - `create-user.spec.ts`: Criação de novo usuário e geração de link de confirmação
  - `confirm-user.spec.ts`: Confirmação via email e login subsequente

#### `authentication/` - Autenticação
- **Objetivo:** Testar login e logout
- **Testes:**
  - `login-logout.spec.ts`: Login, modal de confirmação e logout
  - `login-inspect.spec.ts`: Login com pausa para inspeção manual usando Playwright Inspector. Após inspecionar, clique em "Resume" e o teste fará logout automaticamente

**Teste de Inspeção (`login-inspect.spec.ts`):**
- **Uso:** Inspecionar a interface após login sem precisar fazer logout manualmente
- **Como funciona:**
  1. Faz login automaticamente
  2. Configura o viewport apropriado (desktop/tablet/mobile)
  3. Pausa a execução e abre o Playwright Inspector
  4. Você pode inspecionar elementos, ver console, navegar manualmente
  5. Ao clicar em "Resume" no Inspector, o teste continua
  6. Faz logout automaticamente através do perfil no header e finaliza
- **Comandos disponíveis:**
  - `npm run test:auth:login:inspect` - Executa todos os modos (desktop, tablet, mobile)
  - `npm run test:auth:login:inspect:desktop` - Modo desktop (1920x1080)
  - `npm run test:auth:login:inspect:tablet` - Modo tablet (768x1024)
  - `npm run test:auth:login:inspect:mobile` - Modo mobile (375x667)
- **Encerramento:** Clique em "Resume" no Inspector ou feche o Inspector para interromper
- **Viewports configurados:**
  - Desktop: 1920x1080
  - Tablet: 768x1024
  - Mobile: 375x667

#### `password-recovery/` - Recuperação e Troca de Senha/Email
- **Objetivo:** Testar fluxo completo de recuperação e troca de senha/email
- **Testes:**
  - `request-reset-password.spec.ts`: Solicitar link de recuperação
  - `reset-password.spec.ts`: Confirmar reset, trocar senha, login e logout
  - `change-password.spec.ts`: Trocar senha através da página "Gerenciar Minha Conta"
  - `change-email.spec.ts`: Trocar email através da página "Gerenciar Minha Conta"

**Teste de Troca de Senha (`change-password.spec.ts`):**
- **Uso:** Testar a funcionalidade de troca de senha na página de gerenciamento de conta
- **Como funciona:**
  1. Faz login automaticamente com o usuário configurado
  2. Acessa "Gerenciar Minha Conta" através do dropdown do perfil no header
  3. Preenche os campos de senha:
     - Senha Atual: usa `currentPassword` do usuário
     - Nova Senha: usa `nextPassword` do usuário
     - Confirmar Nova Senha: usa `nextPassword` do usuário
  4. Clica em "Atualizar Senha"
  5. Verifica mensagem de sucesso
  6. Rotaciona automaticamente as senhas no `config.test`:
     - `currentPassword` recebe o valor de `nextPassword`
     - `nextPassword` recebe uma nova senha gerada aleatoriamente
  7. Faz logout automaticamente
- **Rotação de Senhas:** O teste rotaciona automaticamente as senhas após a troca, garantindo que o próximo teste use a nova senha
- **Requisitos:** Usuário deve estar logado e ter acesso à página "Gerenciar Minha Conta"

**Teste de Troca de Email (`change-email.spec.ts`):**
- **Uso:** Testar a funcionalidade de troca de email na página de gerenciamento de conta
- **Como funciona:**
  1. Faz login automaticamente com o usuário atual (configurado em `ACTUAL_TEST_USER`)
  2. Acessa "Gerenciar Minha Conta" através do dropdown do perfil no header
  3. Preenche o campo "Novo Email" com o email do usuário secundário (configurado em `ACTUAL_TEST_SECOND_USER`)
  4. Clica em "Solicitar Alteração"
  5. Verifica redirecionamento para a página de instruções de troca de email
  6. O sistema desloga automaticamente o usuário por segurança
- **Requisitos:** 
  - Usuário deve estar logado e ter acesso à página "Gerenciar Minha Conta"
  - `ACTUAL_TEST_SECOND_USER` deve estar configurado no `config.test`
  - O email do usuário secundário deve ser diferente do email atual
- **Nota:** Após a troca, é necessário confirmar o novo email através do link enviado por email

**Teste de Confirmação de Troca de Email (`confirm-email-change.spec.ts`):**
- **Uso:** Confirmar a troca de email através dos dois links de confirmação (um para cada email)
- **Como funciona:**
  1. Cria duas sessões separadas do Playwright para evitar problemas de cache
  2. **Sessão 1:** Acessa o link de confirmação do usuário principal (`TEMPORARY_LINK`)
  3. Verifica que a confirmação foi bem-sucedida
  4. Encerra a primeira sessão
  5. **Sessão 2:** Acessa o link de confirmação do usuário secundário (`TEMPORARY_SECOND_USER_LINK`)
  6. Verifica que a confirmação foi bem-sucedida
  7. Encerra a segunda sessão
- **Requisitos:**
  - `TEMPORARY_LINK` deve estar configurado com o link recebido pelo usuário principal
  - `TEMPORARY_SECOND_USER_LINK` deve estar configurado com o link recebido pelo usuário secundário
  - Ambos os links devem ser válidos e não expirados
- **Nota:** Este teste deve ser executado após o teste de troca de email, quando os links de confirmação já foram recebidos

### Testes de Gestão (`user-management/`)

#### 1. Exclusão de Usuário (`delete-user.spec.ts`)
- **Objetivo:** Testar remoção de conta via interface administrativa
- **Fluxo:**
  1. Login como administrador
  2. Navegação para Menu → Administrativo → Usuários
  3. Localização do usuário na lista
  4. Clique no botão de excluir
  5. Confirmação no modal
  6. Verificação de exclusão bem-sucedida
  7. Logout automático
- **Status:** ✅ Implementado e funcionando

#### 2. Mudança de Perfil (`change-profile.spec.ts`)
- **Objetivo:** Testar alteração de role/perfil do usuário
- **Fluxo:**
  1. Login como administrador
  2. Navegação para Menu → Administrativo → Gerenciamento de Autorizações
  3. Localização do usuário na lista
  4. Alteração do role através do select
  5. Confirmação da mudança
  6. Verificação de sucesso
  7. Logout automático
- **Status:** ✅ Implementado e funcionando

### Testes de Notificações (`notifications/`)

#### 1. Criação de Categoria de Notificação - Mensagens (`create-category-messages.spec.ts`)
- **Objetivo:** Testar criação de categoria de notificação para mensagens via interface administrativa
- **Fluxo:**
  1. Login como administrador
  2. Navegação para Menu → Administrativo → Gerenciamento de Notificações
  3. Clicar no botão "Nova Categoria"
  4. Preencher formulário com dados do `config.test`:
     - Display Name da Categoria (`NOTIFICATION_CATEGORY_DISPLAY_NAME` - o sistema gera automaticamente o "name")
     - Descrição (`NOTIFICATION_CATEGORY_DESCRIPTION`)
     - Assunto do Email (`NOTIFICATION_CATEGORY_SUBJECT`)
     - Corpo do Email (`NOTIFICATION_CATEGORY_BODY` - com variáveis dinâmicas)
     - Status (ativa/inativa)
  5. Clicar em "Criar"
  6. Verificação de criação bem-sucedida (categoria aparece na lista)
- **Requisitos:**
  - `TEST_ADMIN_USER` deve estar configurado no `config.test`
  - Configurações de categoria de mensagens devem estar no `config.test`:
    - `NOTIFICATION_CATEGORY_DISPLAY_NAME` (o sistema gera automaticamente o "name" a partir deste)
    - `NOTIFICATION_CATEGORY_DESCRIPTION`
    - `NOTIFICATION_CATEGORY_SUBJECT`
    - `NOTIFICATION_CATEGORY_BODY`
- **Comandos disponíveis:**
  ```bash
  npm run test:notifications:create:category:messages:headed
  ```
- **Status:** ✅ Implementado e funcionando

#### 2. Criação de Categoria de Notificação - Análises (`create-category-analyses.spec.ts`)
- **Objetivo:** Testar criação de categoria de notificação para análises via interface administrativa
- **Fluxo:** Similar ao teste de mensagens, mas usando configurações de análises
- **Requisitos:**
  - `TEST_ADMIN_USER` deve estar configurado no `config.test`
  - Configurações de categoria de análises devem estar no `config.test`:
    - `ANALYSIS_CATEGORY_DISPLAY_NAME` (o sistema gera automaticamente o "name" a partir deste)
    - `ANALYSIS_CATEGORY_DESCRIPTION`
    - `ANALYSIS_CATEGORY_SUBJECT`
    - `ANALYSIS_CATEGORY_BODY`
- **Comandos disponíveis:**
  ```bash
  npm run test:notifications:create:category:analyses:headed
  ```
- **Status:** ✅ Implementado e funcionando

#### 3. Criação de Configuração de Notificação - Mensagens (`create-setting-messages.spec.ts`)
- **Objetivo:** Testar criação de configuração de notificação para mensagens (relacionar usuário com categoria) via interface administrativa
- **Fluxo:**
  1. Login como administrador
  2. Navegação para Menu → Administrativo → Gerenciamento de Notificações
  3. Clicar na aba "Configurações"
  4. Clicar no botão "Nova Configuração"
  5. Preencher formulário:
     - Selecionar usuário administrador (do select de usuários)
     - Selecionar categoria de notificação de mensagens (do select de categorias ativas)
     - Marcar checkbox "Notificação ativa" (se necessário)
  6. Clicar em "Criar"
  7. Verificação de criação bem-sucedida (configuração aparece na lista ou modal fecha)
- **Requisitos:**
  - `TEST_ADMIN_USER` deve estar configurado no `config.test`
  - Deve existir pelo menos uma categoria de notificação de mensagens ativa (criada anteriormente)
  - O usuário administrador deve estar disponível na lista de usuários
- **Nota:** Este teste depende de uma categoria de mensagens existente. Execute `create-category-messages.spec.ts` primeiro.
- **Comandos disponíveis:**
  ```bash
  npm run test:notifications:create:setting:messages:headed
  ```
- **Status:** ✅ Implementado e funcionando

#### 4. Criação de Configuração de Notificação - Análises (`create-setting-analyses.spec.ts`)
- **Objetivo:** Testar criação de configuração de notificação para análises (relacionar usuário com categoria) via interface administrativa
- **Fluxo:** Similar ao teste de mensagens, mas usando categoria de análises
- **Requisitos:**
  - `TEST_ADMIN_USER` deve estar configurado no `config.test`
  - Deve existir pelo menos uma categoria de notificação de análises ativa (criada anteriormente)
  - O usuário administrador deve estar disponível na lista de usuários
- **Nota:** Este teste depende de uma categoria de análises existente. Execute `create-category-analyses.spec.ts` primeiro.
- **Comandos disponíveis:**
  ```bash
  npm run test:notifications:create:setting:analyses:headed
  ```
- **Status:** ✅ Implementado e funcionando

### Testes de Mensagens (`messages/`)

#### 1. Criação de Mensagem Técnica no Sicoop (`create-technical-message.spec.ts`)

✅ **RECOMENDADO:** Este teste cria mensagens diretamente no sistema Sicoop, evitando problemas de automação.

**Como funciona:**
1. Faz login como administrador
2. Navega para Menu -> Técnico -> Mensagens
3. Clica no botão "+ Nova Mensagem"
4. Preenche o formulário com dados gerados automaticamente:
   - Nome (aleatório único)
   - Email (aleatório único)
   - Telefone (aleatório)
   - Empresa/Fazenda (aleatório)
   - Mensagem (com contador de testes)
5. Envia a mensagem
6. Verifica se a mensagem foi criada com sucesso

**Comandos disponíveis:**
```bash
# Executar teste
npm run test:messages:create:technical

# Executar em modo headed (visual)
npm run test:messages:create:technical:headed
```

- **Objetivo:** Testar criação de mensagem através do formulário de gerenciamento técnico no Sicoop
- **Fluxo:**
  1. Login como administrador
  2. Navegar para Menu -> Técnico -> Mensagens
  3. Clicar em "+ Nova Mensagem"
  4. Preencher formulário com dados gerados:
     - Nome (aleatório único)
     - Email (aleatório único)
     - Telefone (aleatório)
     - Empresa/Fazenda (aleatório)
     - Mensagem (com contador de testes)
  5. Enviar mensagem
  6. Verificar criação na tabela
- **Requisitos:**
  - `TEST_ADMIN_USER` configurado no `config.test`
  - Usuário deve ter permissão de acesso ao módulo técnico
- **Características:**
  - **Dados únicos:** Cada execução gera dados completamente únicos e aleatórios
  - **Contador persistente:** Mantém contador de testes em `tests/.test-counter`
  - **Rastreabilidade:** Cada mensagem inclui o número do teste no conteúdo
  - **Sem captcha:** Não depende do Cloudflare Turnstile, funcionamento completo automatizado
  - **Validação completa:** Verifica criação na tabela e atualização do total de mensagens
- **Vantagens:**
  - ✅ Funciona completamente automatizado (sem necessidade de interação manual)
  - ✅ Não depende do Cloudflare Turnstile
  - ✅ Mais rápido e confiável
  - ✅ Validação completa da criação
- **Status:** ✅ Implementado e funcionando perfeitamente

#### 2. Criação de Análise Técnica no Sicoop (`create-technical-analysis.spec.ts`)

✅ **RECOMENDADO:** Este teste cria análises diretamente no sistema Sicoop, evitando problemas de automação.

**Como funciona:**
1. Faz login como administrador
2. Navega para Menu -> Técnico -> Análises
3. Clica no botão "+ Nova Análise"
4. Preenche o formulário com dados gerados automaticamente:
   - Nome (aleatório único)
   - Email (aleatório único)
   - Telefone (aleatório)
   - Nome da Fazenda (aleatório)
   - Área da Fazenda (hectares - aleatório)
   - Latitude (coordenada aleatória do Brasil)
   - Longitude (coordenada aleatória do Brasil)
   - Observações (com contador de testes)
5. Envia a análise
6. Verifica se a análise foi criada com sucesso

**Comandos disponíveis:**
```bash
# Executar teste
npm run test:analyses:create:technical

# Executar em modo headed (visual)
npm run test:analyses:create:technical:headed
```

- **Objetivo:** Testar criação de análise através do formulário de gerenciamento técnico no Sicoop
- **Fluxo:**
  1. Login como administrador
  2. Navegar para Menu -> Técnico -> Análises
  3. Clicar em "+ Nova Análise"
  4. Preencher formulário com dados gerados:
     - Nome (aleatório único)
     - Email (aleatório único)
     - Telefone (aleatório)
     - Nome da Fazenda (aleatório)
     - Área da Fazenda (hectares - aleatório)
     - Latitude (coordenada aleatória do Brasil)
     - Longitude (coordenada aleatória do Brasil)
     - Observações (com contador de testes)
  5. Enviar análise
  6. Verificar criação na tabela
- **Requisitos:**
  - `TEST_ADMIN_USER` configurado no `config.test`
  - Usuário deve ter permissão de acesso ao módulo técnico
- **Características:**
  - **Dados únicos:** Cada execução gera dados completamente únicos e aleatórios
  - **Contador persistente:** Mantém contador de testes em `tests/.test-counter` (mesmo contador de mensagens)
  - **Rastreabilidade:** Cada análise inclui o número do teste no conteúdo das observações
  - **Sem captcha:** Não depende do Cloudflare Turnstile, funcionamento completo automatizado
  - **Validação completa:** Verifica criação na tabela e atualização do total de análises
- **Vantagens:**
  - ✅ Funciona completamente automatizado (sem necessidade de interação manual)
  - ✅ Não depende do Cloudflare Turnstile
  - ✅ Mais rápido e confiável
  - ✅ Validação completa da criação
- **Status:** ✅ Implementado e funcionando perfeitamente

#### 3. Geração de Dados para Clipboard - Mensagens (`messages/generate-clipboard-data.js`)

**Ferramenta auxiliar sem Playwright** para gerar dados aleatórios e copiá-los para o clipboard do Windows.

**Como funciona:**
1. Gera dados únicos aleatórios usando a mesma lógica dos testes de mensagem
2. Copia cada campo para o clipboard em ordem reversa (Mensagem → Empresa/Fazenda → Telefone → Email → Nome)
3. Mantém o contador de testes persistente
4. Exibe um resumo no terminal

**Comando disponível:**
```bash
# Gerar dados e copiar para clipboard
npm run test:messages:generate:clipboard
```

**Como usar:**
1. Execute o comando: `npm run test:messages:generate:clipboard`
2. Abra o formulário no navegador
3. Use **Windows + V** para abrir o histórico do clipboard do Windows 11
4. Cole os campos na ordem desejada (o nome foi o último copiado)

**Características:**
- ✅ Gera dados únicos e aleatórios
- ✅ Mantém contador persistente (mesmo contador dos testes)
- ✅ Copia automaticamente para o clipboard do Windows
- ✅ Ordem reversa facilita preenchimento manual
- ✅ Exibe resumo completo no terminal

**Status:** ✅ Implementado e funcionando

#### 6. Geração de Dados para Clipboard - Análises (`analyses/generate-clipboard-analysis-data.js`)

**Ferramenta auxiliar sem Playwright** para gerar dados aleatórios de análises e copiá-los para o clipboard do Windows.

**Como funciona:**
1. Gera dados únicos aleatórios usando a mesma lógica dos testes de análise
2. Copia cada campo para o clipboard em ordem reversa (Observações → Longitude → Latitude → Área → Fazenda → Telefone → Email → Nome)
3. Mantém o contador de testes persistente (mesmo contador de mensagens)
4. Exibe um resumo no terminal

**Comando disponível:**
```bash
# Gerar dados e copiar para clipboard
npm run test:analyses:generate:clipboard
```

**Como usar:**
1. Execute o comando: `npm run test:analyses:generate:clipboard`
2. Abra o formulário no navegador
3. Use **Windows + V** para abrir o histórico do clipboard do Windows 11
4. Cole os campos na ordem desejada (o nome foi o último copiado)

**Características:**
- ✅ Gera dados únicos e aleatórios
- ✅ Mantém contador persistente (mesmo contador dos testes de mensagens)
- ✅ Copia automaticamente para o clipboard do Windows
- ✅ Ordem reversa facilita preenchimento manual
- ✅ Exibe resumo completo no terminal
- ✅ Suporta caracteres especiais em português (UTF-8)
- ✅ Inclui coordenadas geográficas do Brasil
- ✅ Gera área da fazenda em hectares

**Campos gerados:**
- Nome (aleatório único)
- Email (aleatório único)
- Telefone (formato brasileiro)
- Nome da Fazenda (aleatório)
- Área da Fazenda (hectares - entre 10 e 5000)
- Latitude (coordenada do Brasil)
- Longitude (coordenada do Brasil)
- Observações (com contador de testes)

**Status:** ✅ Implementado e funcionando

### Testes de Notificações (`notifications/`)

#### 4. Processamento Manual de Notificações (`process-manual-notifications.spec.ts`)

**Como funciona:**
1. Faz login como administrador
2. Navega para Menu -> Administrativo -> Gerenciamento de Notificações
3. Clica na aba "Logs"
4. Clica no botão "Notificação Manual" (ou "Email de Teste" se ainda não atualizado)
5. Aguarda o processamento das notificações pendentes
6. Verifica o resultado (sucesso ou mensagem de erro)

**Comandos disponíveis:**
```bash
# Executar teste
npm run test:notifications:process:manual

# Executar em modo headed (visual)
npm run test:notifications:process:manual:headed
```

- **Objetivo:** Testar o processamento manual de notificações pendentes através do botão "Notificação Manual"
- **Fluxo:**
  1. Login como administrador
  2. Navegar para Menu -> Administrativo -> Gerenciamento de Notificações
  3. Clicar na aba "Logs"
  4. Clicar no botão "Notificação Manual"
  5. Aguardar processamento (botão mostra "Processando...")
  6. Verificar resultado:
     - Mensagem de sucesso ou
     - Logs atualizados na tabela
- **Requisitos:**
  - `TEST_ADMIN_USER` configurado no `config.test`
  - Deve existir pelo menos uma mensagem ou análise recente sem notificação processada
  - Deve existir pelo menos uma configuração de notificação ativa
- **Características:**
  - **Processamento automático:** Cria logs para mensagens/análises recentes sem notificação
  - **Processamento de pendentes:** Processa todas as notificações pendentes encontradas
  - **Feedback visual:** Botão mostra estado "Processando..." durante execução
  - **Validação completa:** Verifica sucesso ou mensagens de erro
- **Nota:** Este teste aciona a API `/api/process-pending-notifications` que:
  - Cria logs de notificação para mensagens/análises recentes (últimos 7 dias) que ainda não têm logs
  - Processa todas as notificações pendentes (com `email_sent = false`)
  - Envia emails através da API `/api/send-notification`
- **Ambiente de Teste:**
  - Por padrão, usa a URL configurada em `TEST_BASE_URL` (produção)
  - Para testar em desenvolvimento, use a variável de ambiente `TEST_ENVIRONMENT=development`:
    ```bash
    # Testar em desenvolvimento
    TEST_ENVIRONMENT=development npm run test:notifications:process:manual:headed
    
    # Testar em produção (padrão)
    npm run test:notifications:process:manual:headed
    ```
  - A URL de desenvolvimento é configurada em `TEST_DEV_URL` (padrão: `http://localhost:3000`)
  - O ambiente atual é configurado em `TEST_ENVIRONMENT` (padrão: `production`)
- **Filtragem de Erros:**
  - O teste ignora erros esperados que não afetam o funcionamento:
    - 404 do Gravatar (avatar não encontrado é normal)
    - Erros CSP do Vercel Speed Insights
  - Apenas erros críticos (500+) são reportados
- **Status:** ✅ Implementado e funcionando

## 🚀 Estrutura Futura (Visão)

```
tests/
├── auth/                          # 🔐 Testes de Autenticação (CURRENT)
│   ├── user-creation/            # 👤 Criação de Usuário
│   │   ├── create-user.spec.ts   # ✅ Implementado
│   │   └── confirm-user.spec.ts  # ✅ Implementado
│   ├── authentication/           # 🔑 Autenticação
│   │   ├── login-logout.spec.ts  # ✅ Implementado
│   │   └── login-inspect.spec.ts # ✅ Implementado
│   └── password-recovery/        # 🔄 Recuperação e Troca de Senha/Email
│       ├── request-reset-password.spec.ts  # ✅ Implementado
│       ├── reset-password.spec.ts # ✅ Implementado
│       ├── change-password.spec.ts # ✅ Implementado
│       ├── change-email.spec.ts   # ✅ Implementado
│       └── confirm-email-change.spec.ts # ✅ Implementado
│
├── user-management/               # 👥 Testes de Gestão (COMPLETED)
│   ├── delete-user.spec.ts       # ✅ Implementado
│   └── change-profile.spec.ts    # ✅ Implementado
│
├── messages/                       # 📝 Testes de Mensagens (CURRENT)
│   └── create-technical-message.spec.ts  # ✅ Implementado
├── analyses/                       # 🔬 Testes de Análises (CURRENT)
│   └── create-technical-analysis.spec.ts  # ✅ Implementado
│
├── workflows/                     # 🔄 Testes de Fluxos de Negócio (FUTURE)
│   ├── approvals.spec.ts          # 📋 Aprovações
│   ├── notifications.spec.ts     # 🔔 Notificações
│   └── reports.spec.ts           # 📊 Relatórios
│
├── permissions/                   # 🛡️ Testes de Permissões (FUTURE)
│   ├── role-access.spec.ts       # 🔑 Acesso por role
│   └── policy-changes.spec.ts    # 📜 Mudanças de política
│
└── integration/                   # 🔗 Testes de Integração (FUTURE)
    ├── api-calls.spec.ts         # 🌐 Chamadas de API
    └── external-services.spec.ts # 🔌 Serviços externos
```

## 📊 Status dos Testes

### ✅ Implementados
- [x] Criação de usuário (`user-creation/create-user.spec.ts`)
- [x] Confirmação de usuário (`user-creation/confirm-user.spec.ts`)
- [x] Login e logout (`authentication/login-logout.spec.ts`)
- [x] Login para inspeção (`authentication/login-inspect.spec.ts`)
- [x] Solicitar reset de senha (`password-recovery/request-reset-password.spec.ts`)
- [x] Reset de senha completo (`password-recovery/reset-password.spec.ts`)
- [x] Troca de senha (`password-recovery/change-password.spec.ts`)
- [x] Troca de email (`password-recovery/change-email.spec.ts`)
- [x] Confirmação de troca de email (`password-recovery/confirm-email-change.spec.ts`)

### ✅ Implementados e Funcionando
- [x] Exclusão de usuário (`user-management/delete-user.spec.ts`) ✅
- [x] Mudança de perfil (`user-management/change-profile.spec.ts`) ✅
- [x] Login para inspeção em múltiplos dispositivos (`authentication/login-inspect.spec.ts`) ✅
- [x] Troca de senha (`password-recovery/change-password.spec.ts`) ✅
- [x] Troca de email (`password-recovery/change-email.spec.ts`) ✅
- [x] Confirmação de troca de email (`password-recovery/confirm-email-change.spec.ts`) ✅
- [x] Criação de categoria de notificação - Mensagens (`notifications/create-category-messages.spec.ts`) ✅
- [x] Criação de categoria de notificação - Análises (`notifications/create-category-analyses.spec.ts`) ✅
- [x] Criação de configuração de notificação - Mensagens (`notifications/create-setting-messages.spec.ts`) ✅
- [x] Criação de configuração de notificação - Análises (`notifications/create-setting-analyses.spec.ts`) ✅
- [x] Criação de mensagem técnica no Sicoop (`messages/create-technical-message.spec.ts`) ✅
- [x] Criação de análise técnica no Sicoop (`analyses/create-technical-analysis.spec.ts`) ✅
- [x] Geração de dados para clipboard - Mensagens (`messages/generate-clipboard-data.js`) ✅
- [x] Geração de dados para clipboard - Análises (`analyses/generate-clipboard-analysis-data.js`) ✅
- [x] Processamento manual de notificações (`notifications/process-manual-notifications.spec.ts`) ✅

### 📋 Planejados
- [ ] Fluxos de aprovação
- [ ] Configuração de notificações por usuário
- [ ] Envio de emails de teste
- [ ] Geração de relatórios
- [ ] Testes de permissões
- [ ] Testes de integração

## 👥 Múltiplos Usuários

### Sistema de Usuários de Teste

O sistema agora suporta múltiplos usuários de teste, permitindo:

- **Trocar o usuário de teste:** Ajuste `ACTUAL_TEST_USER` no `config.test`
- **Testes com usuário secundário:** Configure `ACTUAL_TEST_SECOND_USER` para testes que requerem dois usuários (ex: troca de email)
- **Testes com administrador:** Configure `TEST_ADMIN_USER` para testes que requerem administrador
- **Rotação de senhas:** Testes de reset de senha e troca de senha rotacionam automaticamente as senhas
- **Links temporários:** 
  - Use `TEMPORARY_LINK` para links de confirmação/reset do usuário principal
  - Use `TEMPORARY_SECOND_USER_LINK` para links de confirmação do usuário secundário (troca de email)

### Como Trocar o Usuário Atual

Edite o arquivo `tests/config.test`:
```bash
# Para usar o usuário 01
ACTUAL_TEST_USER=01

# Para usar o usuário 03
ACTUAL_TEST_USER=03
```

Os testes lerão automaticamente as credenciais do usuário selecionado.

## ⚠️ Características

### Semi-Automatizados
- Requerem intervenção humana em etapas específicas
- Cada teste pode ser executado independentemente
- Foco em validação de fluxos completos

### Produção
- Testes executam em ambiente real (`https://sicoop.goalmoon.com`)
- Usuários de teste são criados mas não removidos automaticamente
- Limpeza manual necessária após testes

### Segurança
- ✅ Nenhum dado sensível hardcoded
- ✅ Todas as credenciais vêm de `config.test` (não versionado)
- ✅ Arquivo `config.test` está protegido no `.gitignore`

### Viewport e Responsividade
- ✅ Testes de gestão de usuários configuram viewport desktop (1920x1080) automaticamente
- ✅ Teste de inspeção suporta desktop, tablet e mobile
- ✅ Todos os testes usam a nova rotina de logout através do perfil no header
- ✅ Logout automático após cada teste para manter estado limpo

## 🔄 Evolução da Estrutura

### Fase 1 (ATUAL): Autenticação Básica ✅
- Criação de usuário
- Confirmação via email
- Login e logout

### Fase 2 (CONCLUÍDA): Gestão de Usuário ✅
- ✅ Reset de senha
- ✅ Troca de senha
- ✅ Troca de email
- ✅ Confirmação de troca de email
- ✅ Exclusão de usuário
- ✅ Mudança de perfil
- ✅ Login para inspeção manual

### Fase 3 (EM ANDAMENTO): Fluxos de Negócio
- ✅ Criação de categoria de notificação - Mensagens
- ✅ Criação de categoria de notificação - Análises
- ✅ Criação de configuração de notificação - Mensagens
- ✅ Criação de configuração de notificação - Análises
- ✅ Criação de mensagem técnica no Sicoop
- ✅ Criação de análise técnica no Sicoop
- ✅ Geração de dados para clipboard - Mensagens (ferramenta auxiliar)
- ✅ Geração de dados para clipboard - Análises (ferramenta auxiliar)
- ✅ Processamento manual de notificações pendentes
- [ ] Envio de emails de teste
- [ ] Aprovações
- [ ] Relatórios

### Fase 4 (FUTURO): Permissões e Integrações
- Testes de permissões
- Validação de roles
- Integração com APIs externas

## 📝 Como Contribuir

### Adicionar Novo Teste

1. Criar arquivo `.spec.ts` na pasta apropriada
2. Importar `loadTestConfig` do helper
3. Usar credenciais de `config.test`
4. Adicionar script npm em `package.json`
5. Documentar na seção apropriada do README

### Exemplo

```typescript
import { test, expect } from '@playwright/test';
import { getActualUser } from '../helpers/test-config';

test.describe('Meu Novo Teste', () => {
  test('deve fazer algo', async ({ page }) => {
    const user = getActualUser(); // Obtém usuário configurado
    
    await page.goto('/minha-rota');
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.currentPassword);
    // ... lógica do teste
  });
});
```

## 🔄 Rotina de Logout Atualizada

Todos os testes agora usam a nova rotina de logout que funciona através do perfil no header:

1. **Clica no perfil do usuário** no header (iniciais ou botão de perfil)
2. **Abre o dropdown** e clica em "Sair"
3. **Aguarda o modal de confirmação** aparecer
4. **Clica no botão de confirmação** do modal
5. **Verifica redirecionamento** para a página de login

Esta rotina foi implementada em todos os testes para garantir consistência e funcionar corretamente com a nova interface.

---

**Última atualização:** Janeiro 2025
**Versão:** 4.11 - Remoção de testes de website não viáveis e foco em scripts de clipboard

### Mudanças na Versão 4.11
- ❌ Removidos testes de criação de mensagem pelo website público (`create-website-message.spec.ts`) - não viável devido ao Cloudflare Turnstile
- ❌ Removidos testes de criação de análise pelo website público (`create-website-analysis.spec.ts`) - não viável devido ao Cloudflare Turnstile
- ✅ Foco mantido nos scripts de geração de dados para clipboard (`test:messages:generate:clipboard` e `test:analyses:generate:clipboard`)
- ✅ Scripts npm removidos do `package.json` relacionados aos testes de website
- ✅ Documentação atualizada removendo referências aos testes não viáveis

### Mudanças na Versão 4.10
- ✅ Script de geração de dados para clipboard para análises (`test:analyses:generate:clipboard`)
- ✅ Correção de encoding UTF-8 nos scripts de clipboard (caracteres especiais em português)
- ✅ Scripts de clipboard agora usam arquivo temporário e PowerShell com encoding UTF-8 explícito
- ✅ Documentação atualizada com seção sobre script de clipboard para análises
- ✅ Suporte completo a caracteres especiais (ç, ã, é, á, etc.) nos scripts de clipboard

### Mudanças na Versão 4.9
- ✅ Testes de categoria e configuração renomeados para especificar mensagens (`create-category-messages.spec.ts`, `create-setting-messages.spec.ts`)
- ✅ Novos testes de categoria e configuração para análises (`create-category-analyses.spec.ts`, `create-setting-analyses.spec.ts`)
- ✅ Novo teste de criação de análise técnica (`analyses/create-technical-analysis.spec.ts`)
- ✅ Função `generateAnalysisData()` adicionada ao gerador de dados
- ✅ Função `getAnalysisCategoryConfig()` adicionada ao helper de configuração
- ✅ Configurações de categoria de análises adicionadas ao `config.test.example` (`ANALYSIS_CATEGORY_*`)
- ✅ Scripts npm atualizados para novos testes (`test:analyses:*`, `test:notifications:create:*:messages`, `test:notifications:create:*:analyses`)
- ✅ Documentação atualizada com nova estrutura e testes de análises
- ✅ Separação clara entre testes de mensagens e análises em todas as categorias

### Mudanças na Versão 4.8
- ✅ Testes de mensagens movidos para ramo próprio (`tests/messages/`)
- ✅ Scripts npm atualizados para nova estrutura (`test:messages:*`)
- ✅ Novo script de geração de dados para clipboard (`test:messages:generate:clipboard`)
- ✅ Documentação atualizada com nova hierarquia
- ✅ Separação clara entre testes de mensagens e notificações

### Mudanças na Versão 4.7
- ✅ Suporte a ambiente de desenvolvimento para testes (`TEST_ENVIRONMENT` e `TEST_DEV_URL`)
- ✅ Função `getTestBaseUrl()` adicionada para selecionar URL base conforme ambiente
- ✅ Teste de processamento manual de notificações agora suporta ambiente de desenvolvimento
- ✅ Filtragem de erros esperados (Gravatar 404, Vercel Speed Insights CSP)
- ✅ Melhorias na robustez do teste de processamento manual
- ✅ Documentação atualizada com instruções de uso de ambiente de desenvolvimento

### Mudanças na Versão 4.6
- ✅ Novo teste de criação de mensagem técnica no Sicoop (`messages/create-technical-message.spec.ts`)
- ✅ Teste funciona completamente automatizado (sem Cloudflare Turnstile)
- ✅ Scripts npm `test:messages:create:technical` e `test:messages:create:technical:headed` adicionados
- ✅ Documentação atualizada com nova seção sobre criação de mensagem técnica
- ✅ Gerador de dados aleatórios para testes (`helpers/test-data-generator.ts`)
- ✅ Sistema de contador persistente de testes (`tests/.test-counter`)
- ✅ Função `generateMessageData()` adicionada para gerar dados únicos
- ✅ Interface `GeneratedMessageData` adicionada
- ✅ Arquivo de contador adicionado ao `.gitignore`

### Mudanças na Versão 4.3
- ✅ Novo teste de criação de categoria de notificação (`notifications/create-category.spec.ts`)
- ✅ Novo teste de criação de configuração de notificação (`notifications/create-setting.spec.ts`)
- ✅ Suporte para configurações de categoria de notificação no `config.test`
- ✅ Função `getNotificationCategoryConfig()` adicionada ao helper
- ✅ Interface `NotificationCategoryConfig` adicionada
- ✅ Documentação atualizada com nova seção de testes de notificações
- ✅ Scripts npm `test:notifications:create:category:headed` e `test:notifications:create:setting:headed` adicionados

### Mudanças na Versão 4.2
- ✅ Novo teste de troca de email (`change-email.spec.ts`)
- ✅ Novo teste de confirmação de troca de email (`confirm-email-change.spec.ts`)
- ✅ Suporte para usuário secundário (`ACTUAL_TEST_SECOND_USER`)
- ✅ Suporte para link temporário do usuário secundário (`TEMPORARY_SECOND_USER_LINK`)
- ✅ Teste de confirmação usa duas sessões separadas do Playwright para evitar cache
- ✅ Documentação atualizada com novos testes e variáveis

### Mudanças na Versão 4.1
- ✅ Novo teste de troca de senha (`change-password.spec.ts`)
- ✅ Rotação automática de senhas no teste de troca de senha
- ✅ Documentação atualizada com estrutura completa

### Mudanças na Versão 4.0
- ✅ Rotina de logout atualizada em todos os testes (perfil no header)
- ✅ Teste de inspeção com suporte a desktop, tablet e mobile
- ✅ Viewport desktop configurado automaticamente em testes de gestão
- ✅ Correção de timeout em testes de exclusão
- ✅ Todos os testes validados e funcionando em produção

