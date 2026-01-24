# 📊 De-Para: DER Sicoop-app → gmoonc

## 📋 Resumo Executivo

Este documento mapeia as tabelas do DER (Diagrama Entidade-Relacionamento) do **Sicoop-app** (português) para o **gmoonc** (inglês), servindo como referência para construção do schema SQL do gmoonc do zero.

**Importante:** O banco de dados do gmoonc será criado do zero, não há migração de dados. Este documento é um de-para para orientar a criação do schema correto.

Inclui:
- Tabelas mantidas
- Tabelas removidas (não fazem parte do gmoonc)
- Mudanças de nomenclatura (português → inglês)
- Mudanças de estrutura de campos

---

## ✅ Tabelas Mantidas (com possíveis ajustes)

### 1. `profiles` → `profiles` (mantém nome)

**Status:** ✅ Mantida  
**Mudanças:** Nenhuma mudança estrutural significativa

| Campo Sicoop-app | Tipo | Campo gmoonc | Tipo | Observações |
|-----------------|------|--------------|------|-------------|
| `id` | UUID (PK) | `id` | UUID (PK) | Mantém |
| `email` | TEXT (UNIQUE) | `email` | TEXT (UNIQUE) | Mantém |
| `name` | TEXT | `name` | TEXT | Mantém |
| `role` | TEXT | `role` | TEXT | Mantém (valores mudam para: `administrador` → `administrator`, `funcionario` → `employee`, `cliente` → `customer`) |
| `created_at` | TIMESTAMP | `created_at` | TIMESTAMP | Mantém |
| `updated_at` | TIMESTAMP | `updated_at` | TIMESTAMP | Mantém |

**Valores de `role` (português → inglês):**
- `administrador` → `administrator`
- `funcionario` → `employee`
- `cliente` → `customer`

---

### 2. `roles` → `roles` (mantém nome)

**Status:** ✅ Mantida  
**Mudanças:** Nenhuma mudança estrutural

| Campo Sicoop-app | Tipo | Campo gmoonc | Tipo | Observações |
|-----------------|------|--------------|------|-------------|
| `id` | UUID (PK) | `id` | UUID (PK) | Mantém |
| `name` | TEXT (UNIQUE) | `name` | TEXT (UNIQUE) | Mantém (valores em inglês) |
| `description` | TEXT (NULL) | `description` | TEXT (NULL) | Mantém |
| `is_system_role` | BOOLEAN | `is_system_role` | BOOLEAN | Mantém |
| `created_at` | TIMESTAMP | `created_at` | TIMESTAMP | Mantém |
| `updated_at` | TIMESTAMP | `updated_at` | TIMESTAMP | Mantém |

**Valores de `name` (português → inglês):**
- `administrador` → `administrator`
- `funcionario` → `employee`
- `cliente` → `customer`

---

### 3. `modules` → `modules` (mantém nome)

**Status:** ✅ Mantida  
**Mudanças:** Nenhuma mudança estrutural

| Campo Sicoop-app | Tipo | Campo gmoonc | Tipo | Observações |
|-----------------|------|--------------|------|-------------|
| `id` | UUID (PK) | `id` | UUID (PK) | Mantém |
| `name` | TEXT (UNIQUE) | `name` | TEXT (UNIQUE) | Mantém (valores em inglês) |
| `display_name` | TEXT | `display_name` | TEXT | Mantém |
| `description` | TEXT (NULL) | `description` | TEXT (NULL) | Mantém |
| `is_active` | BOOLEAN | `is_active` | BOOLEAN | Mantém |
| `created_at` | TIMESTAMP | `created_at` | TIMESTAMP | Mantém |
| `updated_at` | TIMESTAMP | `updated_at` | TIMESTAMP | Mantém |

**Valores de `name` (português → inglês):**
- `administrativo` → `admin`
- `financeiro` → `financial`
- `help-desk` → `technical`
- `cliente` → `customer`

---

### 4. `permissions` → `permissions` (mantém nome)

**Status:** ✅ Mantida  
**Mudanças:** Nenhuma mudança estrutural

| Campo Sicoop-app | Tipo | Campo gmoonc | Tipo | Observações |
|-----------------|------|--------------|------|-------------|
| `id` | UUID (PK) | `id` | UUID (PK) | Mantém |
| `role_id` | UUID (FK → roles.id) | `role_id` | UUID (FK → roles.id) | Mantém |
| `module_id` | UUID (FK → modules.id) | `module_id` | UUID (FK → modules.id) | Mantém |
| `can_access` | BOOLEAN | `can_access` | BOOLEAN | Mantém |
| `can_create` | BOOLEAN | `can_create` | BOOLEAN | Mantém |
| `can_read` | BOOLEAN | `can_read` | BOOLEAN | Mantém |
| `can_update` | BOOLEAN | `can_update` | BOOLEAN | Mantém |
| `can_delete` | BOOLEAN | `can_delete` | BOOLEAN | Mantém |
| `created_at` | TIMESTAMP | `created_at` | TIMESTAMP | Mantém |
| `updated_at` | TIMESTAMP | `updated_at` | TIMESTAMP | Mantém |

---

### 5. `mensagens` → `messages` (renomeada)

**Status:** ✅ Mantida (renomeada)  
**Mudanças:** Nome da tabela e campos renomeados

| Campo Sicoop-app | Tipo | Campo gmoonc | Tipo | Observações |
|-----------------|------|--------------|------|-------------|
| `id` | UUID (PK) | `id` | UUID (PK) | Mantém |
| `user_id` | UUID (FK → profiles.id, NULL) | `user_id` | UUID (FK → profiles.id, NULL) | Mantém |
| `nome` | TEXT | `name` | TEXT | **Renomeado** |
| `email` | TEXT | `email` | TEXT | Mantém |
| `telefone` | TEXT (NULL) | `phone` | TEXT (NULL) | **Renomeado** |
| `empresa_fazenda` | TEXT | `company_farm` | TEXT | **Renomeado** |
| `mensagem` | TEXT | `message` | TEXT | **Renomeado** |
| `status` | TEXT (NULL) | `status` | TEXT (NULL) | Mantém (valores mudam para inglês) |
| `created_at` | TIMESTAMP | `created_at` | TIMESTAMP | Mantém |
| `updated_at` | TIMESTAMP | `updated_at` | TIMESTAMP | Mantém |

**Valores de `status` (português → inglês):**
- `rascunho` → `draft`
- `pendente` → `pending`
- `em_analise` → `in_analysis`
- `concluida` → `completed`
- `cancelada` → `cancelled`

---

### 6. `notification_categories` → `notification_categories` (mantém nome)

**Status:** ✅ Mantida  
**Mudanças:** Nenhuma mudança estrutural

| Campo Sicoop-app | Tipo | Campo gmoonc | Tipo | Observações |
|-----------------|------|--------------|------|-------------|
| `id` | UUID (PK) | `id` | UUID (PK) | Mantém |
| `name` | TEXT (UNIQUE) | `name` | TEXT (UNIQUE) | Mantém |
| `display_name` | TEXT | `display_name` | TEXT | Mantém |
| `description` | TEXT (NULL) | `description` | TEXT (NULL) | Mantém |
| `is_active` | BOOLEAN | `is_active` | BOOLEAN | Mantém |
| `email_template_subject` | TEXT | `email_template_subject` | TEXT | Mantém |
| `email_template_body` | TEXT | `email_template_body` | TEXT | Mantém |
| `created_at` | TIMESTAMP | `created_at` | TIMESTAMP | Mantém |
| `updated_at` | TIMESTAMP | `updated_at` | TIMESTAMP | Mantém |

---

### 7. `notification_settings` → `notification_settings` (mantém nome)

**Status:** ✅ Mantida  
**Mudanças:** Nenhuma mudança estrutural

| Campo Sicoop-app | Tipo | Campo gmoonc | Tipo | Observações |
|-----------------|------|--------------|------|-------------|
| `id` | UUID (PK) | `id` | UUID (PK) | Mantém |
| `user_id` | UUID (FK → profiles.id) | `user_id` | UUID (FK → profiles.id) | Mantém |
| `category_id` | UUID (FK → notification_categories.id) | `category_id` | UUID (FK → notification_categories.id) | Mantém |
| `is_enabled` | BOOLEAN | `is_enabled` | BOOLEAN | Mantém |
| `created_at` | TIMESTAMP | `created_at` | TIMESTAMP | Mantém |
| `updated_at` | TIMESTAMP | `updated_at` | TIMESTAMP | Mantém |

---

### 8. `notification_logs` → `notification_logs` (mantém nome)

**Status:** ✅ Mantida  
**Mudanças:** Nenhuma mudança estrutural

| Campo Sicoop-app | Tipo | Campo gmoonc | Tipo | Observações |
|-----------------|------|--------------|------|-------------|
| `id` | UUID (PK) | `id` | UUID (PK) | Mantém |
| `category_id` | UUID (FK → notification_categories.id) | `category_id` | UUID (FK → notification_categories.id) | Mantém |
| `user_id` | UUID (FK → profiles.id) | `user_id` | UUID (FK → profiles.id) | Mantém |
| `entity_type` | TEXT | `entity_type` | TEXT | Mantém |
| `entity_id` | TEXT | `entity_id` | TEXT | Mantém |
| `email_sent` | BOOLEAN (NULL) | `email_sent` | BOOLEAN (NULL) | Mantém |
| `email_error` | TEXT (NULL) | `email_error` | TEXT (NULL) | Mantém |
| `sent_at` | TIMESTAMP (NULL) | `sent_at` | TIMESTAMP (NULL) | Mantém |
| `created_at` | TIMESTAMP | `created_at` | TIMESTAMP | Mantém |

---

## ❌ Tabelas Removidas

### 1. `analises_cobertura` → **NÃO INCLUÍDA**

**Status:** ❌ Não faz parte do gmoonc  
**Motivo:** Funcionalidade de análises de cobertura é específica do Sicoop-app e não faz parte do gmoonc genérico.

**Campos que existiam no Sicoop-app (apenas para referência):**
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id, NULL)
- `nome` (TEXT)
- `email` (TEXT)
- `telefone` (TEXT, NULL)
- `nome_fazenda` (TEXT)
- `area_fazenda_ha` (NUMERIC, NULL)
- `latitude` (NUMERIC, NULL)
- `longitude` (NUMERIC, NULL)
- `observacoes` (TEXT, NULL)
- `status` (TEXT, NULL)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Nota:** Esta tabela não deve ser criada no schema do gmoonc.

---

## 📝 Resumo de Mudanças

### Mudanças de Nomenclatura (Português → Inglês)

#### Tabelas:
- `mensagens` → `messages` (nome da tabela no gmoonc)

#### Campos:
- `nome` → `name`
- `telefone` → `phone`
- `empresa_fazenda` → `company`
- `mensagem` → `message`

#### Valores de Enum/Status:

**Roles:**
- `administrador` → `administrator`
- `funcionario` → `employee`
- `cliente` → `customer`

**Status de Mensagens (valores no gmoonc):**
- `draft` (rascunho)
- `pending` (pendente)
- `in_analysis` (em análise)
- `completed` (concluída)
- `cancelled` (cancelada)

**Módulos (valores no gmoonc):**
- `admin` (administrativo)
- `financial` (financeiro)
- `technical` (help-desk)
- `customer` (cliente)

---

## 📝 Valores Padrão para Construção do Schema

Ao criar o schema do gmoonc do zero, use os seguintes valores padrão:

### Roles do Sistema (tabela `roles`):
- `administrator` - Administrador do sistema
- `employee` - Funcionário/Colaborador
- `customer` - Cliente/Usuário final

### Módulos Padrão (tabela `modules`):
- `admin` - Módulo administrativo
- `financial` - Módulo financeiro
- `technical` - Módulo técnico/help-desk
- `customer` - Módulo do cliente

### Status de Mensagens (tabela `messages`):
- `draft` - Rascunho
- `pending` - Pendente
- `in_analysis` - Em análise
- `completed` - Concluída
- `cancelled` - Cancelada

---

## 📊 Diagrama de Relacionamentos

### Sicoop-app (Referência):
```
profiles ──┐
           ├── permissions ── modules
roles ─────┘
           └── mensagens
           └── analises_cobertura (não incluída no gmoonc)
           └── notification_settings ── notification_categories
           └── notification_logs ── notification_categories
```

### gmoonc (Schema a ser criado):
```
profiles ──┐
           ├── permissions ── modules
roles ─────┘
           └── messages
           └── notification_settings ── notification_categories
           └── notification_logs ── notification_categories
```

---

## ✅ Checklist para Construção do Schema

- [ ] Criar tabela `profiles` com campos em inglês
- [ ] Criar tabela `roles` com valores em inglês (`administrator`, `employee`, `customer`)
- [ ] Criar tabela `modules` com valores em inglês (`admin`, `financial`, `technical`, `customer`)
- [ ] Criar tabela `permissions` com relacionamentos corretos
- [ ] Criar tabela `messages` (não `mensagens`) com campos renomeados (`name`, `phone`, `company`, `message`)
- [ ] Criar tabela `notification_categories`
- [ ] Criar tabela `notification_settings`
- [ ] Criar tabela `notification_logs`
- [ ] Definir constraints de status para `messages` (draft, pending, in_analysis, completed, cancelled)
- [ ] Configurar Foreign Keys (FKs) corretamente
- [ ] Configurar RLS (Row Level Security) policies
- [ ] Validar integridade referencial

---

## 📚 Referências

- `apps/sicoop-app/src/lib/supabase.ts` - Definição completa do schema Sicoop-app
- `packages/app/src/hooks/useGMoonc*.ts` - Interfaces TypeScript do gmoonc
- `packages/app/src/types/mensagens.ts` - Interface de mensagens
- `apps/sicoop-app/docs/PERMISSOES-README.md` - Documentação de permissões

---

**Última atualização:** 2026-01-23  
**Versão:** 1.0
