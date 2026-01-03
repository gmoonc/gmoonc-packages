# Migração: Correção das Políticas RLS da Tabela Permissions

**Data:** 20 de Novembro de 2025  
**Migração:** `20251120152924_fix_permissions_rls_policies.sql`  
**Status:** ✅ Aplicada

## 📋 Resumo

Esta migração corrige um problema crítico nas políticas RLS (Row Level Security) da tabela `permissions` que impedia administradores de salvar permissões no sistema Sicoop.

## 🔍 Problema Identificado

### Sintoma
Ao tentar salvar permissões na tela de Gerenciamento de Permissões, o sistema retornava o erro:
```
Erro ao salvar permissões: {
  code: '42501', 
  message: 'new row violates row-level security policy for table "permissions"'
}
```

### Causa Raiz
1. A tabela `permissions` tinha apenas uma política RLS para SELECT (`Unified permissions access`)
2. A política de gerenciamento (`Admin permissions management`) usava `auth.jwt() ->> 'role'` que não funciona corretamente
3. O sistema Sicoop usa `profiles.role = 'administrador'` para verificar se um usuário é administrador
4. Faltavam políticas específicas para INSERT, UPDATE e DELETE

### Impacto
- Administradores não conseguiam criar, atualizar ou deletar permissões
- O sistema de gerenciamento de permissões estava completamente bloqueado

## ✅ Solução Implementada

### Mudanças Realizadas

#### Correção 1: Políticas RLS no Banco de Dados

#### 1. Remoção de Política Incorreta
```sql
DROP POLICY IF EXISTS "Admin permissions management" ON public.permissions;
```
- Remove a política que usava `auth.jwt() ->> 'role'` (incorreta)

#### 2. Criação de Política de INSERT
```sql
CREATE POLICY "Admin permissions insert" ON public.permissions
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'administrador'
        )
    );
```
- Permite que administradores insiram novas permissões
- Verifica corretamente através de `profiles.role = 'administrador'`

#### 3. Criação de Política de UPDATE
```sql
CREATE POLICY "Admin permissions update" ON public.permissions
    FOR UPDATE 
    USING (...)
    WITH CHECK (...);
```
- Permite que administradores atualizem permissões existentes
- Inclui tanto `USING` (para verificar linha existente) quanto `WITH CHECK` (para validar novos valores)

#### 4. Criação de Política de DELETE
```sql
CREATE POLICY "Admin permissions delete" ON public.permissions
    FOR DELETE 
    USING (...);
```
- Permite que administradores deletem permissões

### Política Mantida (Não Modificada)
- `Unified permissions access` (SELECT) - Mantida intacta, permite que todos vejam permissões

#### Correção 2: Código TypeScript (PermissionsManager.tsx)

**Problema Adicional Identificado:**
Após aplicar as políticas RLS, foi identificado um segundo problema: quando novas permissões eram criadas, o código estava incluindo `id: ''` (string vazia), o que causava erro `23502` (null value in column "id").

**Solução:**
Modificado o método `savePermissions` para:
- **Permissões existentes:** Incluir `id` no objeto para UPDATE
- **Novas permissões:** NÃO incluir o campo `id` para que o banco gere automaticamente via `gen_random_uuid()`

**Código Corrigido (Versão Final):**
```typescript
// Separar permissões existentes e novas em arrays diferentes
const permissionsToUpdate = []; // Com id
const permissionsToInsert = [];  // Sem id

// Para permissões existentes (com id válido)
if (hasValidId) {
  permissionsToUpdate.push({
    id: permission.id,
    role_id: permission.role_id,
    // ... outros campos
  });
} else {
  // Para novas permissões (sem id)
  permissionsToInsert.push({
    // id NÃO incluído aqui
    role_id: permission.role_id,
    // ... outros campos
  });
}

// Executar UPDATEs usando upsert com onConflict no id
if (permissionsToUpdate.length > 0) {
  await supabase
    .from('permissions')
    .upsert(permissionsToUpdate, { onConflict: 'id' });
}

// Executar INSERTs usando insert() diretamente (não upsert)
// Isso evita que o Supabase tente incluir id como null
if (permissionsToInsert.length > 0) {
  await supabase
    .from('permissions')
    .insert(permissionsToInsert);
}
```

**Por que separar INSERT e UPDATE?**
- `upsert()` pode tentar incluir campos opcionais como `null` mesmo quando não especificados
- `insert()` é mais seguro para novas linhas, garantindo que campos não especificados usem os defaults do banco
- Separar as operações evita problemas de serialização JSON onde `undefined` pode virar `null`

## 🛡️ Proteções Implementadas

### Tabelas NÃO Afetadas (Mantidas Intactas)
Esta migração foi cuidadosamente projetada para **NÃO** modificar outras tabelas críticas:

#### ✅ `mensagens`
- **Status:** Mantida intacta
- **Políticas atuais:** 
  - `Simple insert policy` - Permite inserções anônimas (necessário para website Goalmoon)
  - `Simple select policy` - Permite visualização
  - `Simple update policy` - Permite atualizações
  - `Simple delete policy` - Permite exclusões
- **Razão:** Essas políticas permissivas são necessárias para permitir que o website da Goalmoon insira mensagens sem autenticação

#### ✅ `analises_cobertura`
- **Status:** Mantida intacta
- **Políticas atuais:**
  - `Simple insert policy` - Permite inserções anônimas (necessário para website Goalmoon)
  - `Simple select policy` - Permite visualização
  - `Simple update policy` - Permite atualizações
  - `Simple delete policy` - Permite exclusões
- **Razão:** Essas políticas permissivas são necessárias para permitir que o website da Goalmoon insira análises sem autenticação

#### ✅ `roles`
- **Status:** Mantida intacta
- **Política atual:** `Unified roles access` (SELECT)

#### ✅ `modules`
- **Status:** Mantida intacta
- **Política atual:** `Unified modules access` (SELECT)

#### ✅ `profiles`
- **Status:** Mantida intacta
- **Políticas atuais:** Mantidas sem alterações

## 🔄 Como Reverter (Se Necessário)

Se for necessário reverter esta migração, execute:

```sql
-- Remover políticas criadas
DROP POLICY IF EXISTS "Admin permissions insert" ON public.permissions;
DROP POLICY IF EXISTS "Admin permissions update" ON public.permissions;
DROP POLICY IF EXISTS "Admin permissions delete" ON public.permissions;

-- Recriar política antiga (se necessário)
CREATE POLICY "Admin permissions management" ON public.permissions
    FOR ALL USING ((select auth.jwt() ->> 'role') = 'admin');
```

**⚠️ ATENÇÃO:** A reversão restaurará o problema original. Use apenas se houver necessidade crítica.

## 🧪 Testes Realizados

### Teste 1: Verificação de Políticas
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'permissions';
```
**Resultado Esperado:**
- `Unified permissions access` (SELECT)
- `Admin permissions insert` (INSERT)
- `Admin permissions update` (UPDATE)
- `Admin permissions delete` (DELETE)

### Teste 2: Inserção de Permissão (como administrador)
- ✅ Deve permitir inserir nova permissão
- ✅ Deve verificar `profiles.role = 'administrador'`

### Teste 3: Atualização de Permissão (como administrador)
- ✅ Deve permitir atualizar permissão existente
- ✅ Deve verificar `profiles.role = 'administrador'`

### Teste 4: Verificação de Tabelas Não Afetadas
- ✅ `mensagens` - Políticas mantidas intactas
- ✅ `analises_cobertura` - Políticas mantidas intactas
- ✅ Inserções anônimas do website Goalmoon continuam funcionando

## 📊 Impacto Esperado

### Positivo
- ✅ Administradores podem gerenciar permissões normalmente
- ✅ Sistema de permissões funcional novamente
- ✅ Nenhum impacto em outras funcionalidades

### Negativo
- ❌ Nenhum impacto negativo esperado

## 📝 Notas Técnicas

### Verificação de Administrador
A migração usa a verificação correta:
```sql
EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'administrador'
)
```

Isso é diferente da verificação incorreta anterior:
```sql
(select auth.jwt() ->> 'role') = 'admin'  -- ❌ INCORRETO
```

### Por que `WITH CHECK` é necessário?
- `USING`: Verifica se a operação pode ser executada na linha existente
- `WITH CHECK`: Valida os novos valores que serão inseridos/atualizados
- Para INSERT, apenas `WITH CHECK` é necessário
- Para UPDATE, ambos são necessários

## 👥 Responsáveis

- **Desenvolvimento:** Assistente AI (Composer)
- **Revisão:** Pendente
- **Aprovação:** Pendente

## 📅 Histórico

- **2025-11-20 15:29:** Migração criada e aplicada
- **2025-11-20 15:29:** Documentação criada
- **2025-11-20 15:35:** Primeira tentativa de correção no código TypeScript
- **2025-11-20 15:40:** Correção final: separação de INSERT e UPDATE usando `insert()` para novas permissões

## 🔗 Referências

- Arquivo de migração: `supabase/migrations/20251120152924_fix_permissions_rls_policies.sql`
- Componente afetado: `src/components/PermissionsManager.tsx`
- Erro original: `code: '42501'` - Row Level Security violation

---

**⚠️ IMPORTANTE:** Esta migração foi projetada com máxima atenção para não causar efeitos colaterais. Todas as outras tabelas foram mantidas intactas, especialmente `mensagens` e `analises_cobertura` que precisam de políticas permissivas para o website da Goalmoon.

