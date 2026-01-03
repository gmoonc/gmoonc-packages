# Sistema de Permissões - Sicoop

## Visão Geral

O sistema de permissões do Sicoop permite que administradores gerenciem de forma granular o acesso dos usuários aos diferentes módulos do sistema. Em vez de usar apenas roles fixos (cliente, funcionário, administrador), o sistema agora oferece controle detalhado sobre o que cada usuário pode fazer em cada área.

## Características Principais

### 1. **Tabela de Permissões Matricial**
- **Linhas**: Roles (papéis/funções) - podem ser criadas pelo administrador
- **Colunas**: Módulos fixos do sistema (Administrativo, Financeiro, Help-Desk, etc.)
- **Interseções**: Checkboxes para diferentes tipos de permissão

### 2. **Tipos de Permissão**
- **Acesso**: Pode acessar o módulo
- **Criar**: Pode criar novos registros
- **Ler**: Pode visualizar dados
- **Atualizar**: Pode modificar registros existentes
- **Deletar**: Pode remover registros

### 3. **Roles Flexíveis**
- **Roles do Sistema**: `administrador`, `funcionario`, `cliente` (não podem ser deletadas)
- **Roles Customizadas**: Criadas pelo administrador conforme necessidade da empresa
- **Descrições**: Cada role pode ter uma descrição explicativa

## Estrutura do Banco de Dados

### Tabelas Criadas

#### `roles`
```sql
- id (UUID, PK)
- name (TEXT, UNIQUE)
- description (TEXT, NULLABLE)
- is_system_role (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `modules`
```sql
- id (UUID, PK)
- name (TEXT, UNIQUE)
- display_name (TEXT)
- description (TEXT, NULLABLE)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `permissions`
```sql
- id (UUID, PK)
- role_id (UUID, FK -> roles.id)
- module_id (UUID, FK -> modules.id)
- can_access (BOOLEAN)
- can_create (BOOLEAN)
- can_read (BOOLEAN)
- can_update (BOOLEAN)
- can_delete (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Funções do Banco

#### `check_permission(user_id, module_name, permission_type)`
Verifica se um usuário tem uma permissão específica.

#### `get_user_permissions(user_id)`
Retorna todas as permissões de um usuário.

## Como Usar

### 1. **Acessar o Sistema de Permissões**
- Menu: `Administrativo` → `Permissões`
- Apenas usuários com role `administrador` podem acessar

### 2. **Criar Nova Role**
- Clique no botão `+ Nova Role`
- Preencha nome e descrição
- A role será criada com todas as permissões desmarcadas por padrão

### 3. **Configurar Permissões**
- Use os checkboxes na tabela para definir permissões
- Cada role pode ter permissões diferentes para cada módulo
- Clique em `Salvar Permissões` para persistir as mudanças

### 4. **Deletar Role**
- Cliques no botão `Deletar` na coluna de ações
- Roles do sistema não podem ser deletadas
- Confirmação será solicitada antes da exclusão

## Integração com o Sistema

### 1. **Menu Dinâmico**
O menu lateral agora filtra itens baseado nas permissões do usuário:
- Se não tem acesso ao módulo, o item não aparece
- Submenus são filtrados automaticamente

### 2. **Proteção de Rotas**
Use o componente `ProtectedRoute` com verificação de módulo:
```tsx
<ProtectedRoute requiredModule="financeiro" requiredPermission="read">
  <FinanceiroComponent />
</ProtectedRoute>
```

### 3. **Hook de Permissões**
Use o hook `usePermissions` em componentes:
```tsx
const { hasPermission, checkPermission } = usePermissions();

if (hasPermission({ moduleName: 'financeiro', permissionType: 'create' })) {
  // Mostrar botão de criar
}
```

## Módulos Disponíveis

### Módulos Fixos (não podem ser alterados pelo administrador)
1. **Administrativo** - Gestão de usuários e permissões
2. **Financeiro** - Operações financeiras
3. **Help-Desk** - Suporte técnico
4. **Secretaria** - Gestão administrativa
5. **Técnico** - Operações técnicas
6. **Vendas** - Gestão de vendas
7. **Cliente** - Área do cliente

### Adicionando Novos Módulos
Novos módulos devem ser implementados pela equipe de desenvolvimento através de:
1. Criação da migração SQL
2. Atualização dos tipos TypeScript
3. Implementação dos componentes React
4. Atualização do menu

## Segurança

### 1. **Row Level Security (RLS)**
- Todas as tabelas têm RLS habilitado
- Políticas específicas para cada operação
- Apenas administradores podem gerenciar permissões

### 2. **Validação de Permissões**
- Verificação em tempo real via API
- Cache local para performance
- Fallback para role básico em caso de erro

### 3. **Auditoria**
- Timestamps de criação e atualização
- Logs de operações sensíveis
- Histórico de mudanças de permissões

## Exemplos de Uso

### 1. **Role de Gerente Financeiro**
```sql
-- Criar role
INSERT INTO roles (name, description) VALUES ('gerente_financeiro', 'Gerente do departamento financeiro');

-- Configurar permissões
-- Acesso total ao módulo financeiro
-- Acesso limitado ao administrativo (apenas leitura)
-- Sem acesso ao técnico
```

### 2. **Role de Supervisor de Vendas**
```sql
-- Criar role
INSERT INTO roles (name, description) VALUES ('supervisor_vendas', 'Supervisor da equipe de vendas');

-- Configurar permissões
-- Acesso total ao módulo de vendas
-- Acesso limitado ao helpdesk (apenas leitura)
-- Sem acesso ao financeiro
```

## Troubleshooting

### Problemas Comuns

#### 1. **Menu não aparece**
- Verificar se o usuário tem permissão de acesso ao módulo
- Verificar se as permissões foram salvas corretamente
- Recarregar a página após mudanças

#### 2. **Erro ao salvar permissões**
- Verificar se o usuário é administrador
- Verificar conexão com o banco
- Verificar logs do console

#### 3. **Permissões não funcionam**
- Verificar se a migração foi aplicada
- Verificar se as funções do banco foram criadas
- Verificar se as políticas RLS estão ativas

### Logs e Debug
- Console do navegador para erros de frontend
- Logs do Supabase para erros de banco
- Network tab para verificar chamadas da API

## Manutenção

### 1. **Backup de Permissões**
```sql
-- Exportar configuração atual
SELECT 
    r.name as role,
    m.display_name as module,
    p.can_access,
    p.can_create,
    p.can_read,
    p.can_update,
    p.can_delete
FROM permissions p
JOIN roles r ON p.role_id = r.id
JOIN modules m ON p.module_id = m.id
ORDER BY r.name, m.display_name;
```

### 2. **Reset de Permissões**
```sql
-- Resetar todas as permissões para false
UPDATE permissions SET 
    can_access = false,
    can_create = false,
    can_read = false,
    can_update = false,
    can_delete = false;
```

### 3. **Migração de Usuários**
```sql
-- Atualizar role de um usuário
UPDATE profiles SET role = 'nova_role' WHERE email = 'usuario@exemplo.com';
```

## Conclusão

O sistema de permissões do Sicoop oferece controle granular e flexível sobre o acesso dos usuários, permitindo que administradores criem roles customizadas conforme as necessidades específicas da empresa. A implementação é segura, performática e integrada ao sistema existente.
