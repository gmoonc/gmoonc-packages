# Correção Necessária no Website Goalmoon.com

## 🚨 Problema Identificado

O formulário do website `goalmoon.com` que insere dados nas tabelas `analises_cobertura` e `mensagens` está falhando após a unificação dos status no banco de dados.

### Erro Atual:
```
Erro ao criar análise: {
  code: '23514', 
  message: 'new row for relation "analises_cobertura" violates check constraint "analises_cobertura_status_check"'
}
```

## 📋 O Que Mudou no Banco de Dados

### Status Antigos (NÃO EXISTEM MAIS):
- ❌ `solicitada` (análises)
- ❌ `enviada` (análises e mensagens)
- ❌ `respondida` (mensagens)
- ❌ `fechada` (mensagens)

### Status Novos (UNIFICADOS):
- ✅ `rascunho` - Rascunho
- ✅ `pendente` - Pendente (substitui `solicitada` e `enviada`)
- ✅ `em_analise` - Em Análise
- ✅ `concluida` - Concluída (substitui `respondida` em mensagens)
- ✅ `cancelada` - Cancelada (substitui `fechada` em mensagens)

## ✅ Correção Aplicada no Banco de Dados

Os valores DEFAULT das tabelas foram atualizados:
- `analises_cobertura.status` → DEFAULT agora é `'pendente'` (antes era `'solicitada'`)
- `mensagens.status` → DEFAULT agora é `'pendente'` (antes era `'enviada'`)

**Isso significa que se o website omitir o campo `status` ou passar `null`, o banco aplicará automaticamente `'pendente'`.**

## 🔧 Correções Necessárias no Website

### ⚠️ PROBLEMA PRINCIPAL

O website está tentando inserir com status antigos (`'solicitada'` ou `'enviada'`) que **não existem mais** na constraint do banco.

### 1. Tabela `analises_cobertura` (Formulário de Análises)

**ANTES (NÃO FUNCIONA MAIS):**
```javascript
// ❌ Status padrão antigo - CAUSA ERRO
status: 'solicitada'  // ou 'enviada'
```

**DEPOIS (CORRETO):**
```javascript
// ✅ Opção 1: Usar 'pendente' explicitamente
status: 'pendente'

// ✅ Opção 2: Omitir o campo (recomendado - usa DEFAULT)
// Não incluir o campo 'status' no insert
```

**Valores aceitos:**
- `null` (será convertido para `pendente` automaticamente)
- `'pendente'`
- `'rascunho'`
- `'em_analise'`
- `'concluida'`
- `'cancelada'`

### 2. Tabela `mensagens` (Formulário de Mensagens)

**ANTES (NÃO FUNCIONA MAIS):**
```javascript
// ❌ Status padrão antigo - CAUSA ERRO
status: 'enviada'
```

**DEPOIS (CORRETO):**
```javascript
// ✅ Opção 1: Usar 'pendente' explicitamente
status: 'pendente'

// ✅ Opção 2: Omitir o campo (recomendado - usa DEFAULT)
// Não incluir o campo 'status' no insert
```

**Valores aceitos:**
- `null` (será convertido para `pendente` automaticamente)
- `'pendente'`
- `'rascunho'`
- `'em_analise'`
- `'concluida'`
- `'cancelada'`

## 📝 Exemplo de Código Corrigido

### Para Formulário de Análises:

**Opção 1: Omitir o campo status (RECOMENDADO - mais simples)**
```javascript
// ✅ Exemplo de inserção no Supabase - SEM campo status
const { data, error } = await supabase
  .from('analises_cobertura')
  .insert({
    nome: formData.nome,
    email: formData.email,
    telefone: formData.telefone || null,
    nome_fazenda: formData.nome_fazenda,
    area_fazenda_ha: formData.area_fazenda_ha || null,
    latitude: formData.latitude || null,
    longitude: formData.longitude || null,
    observacoes: formData.observacoes || null
    // ✅ status não incluído - será 'pendente' automaticamente pelo DEFAULT
  })
  .select();
```

**Opção 2: Usar 'pendente' explicitamente**
```javascript
// ✅ Exemplo de inserção no Supabase - COM campo status explícito
const { data, error } = await supabase
  .from('analises_cobertura')
  .insert({
    nome: formData.nome,
    email: formData.email,
    telefone: formData.telefone || null,
    nome_fazenda: formData.nome_fazenda,
    area_fazenda_ha: formData.area_fazenda_ha || null,
    latitude: formData.latitude || null,
    longitude: formData.longitude || null,
    observacoes: formData.observacoes || null,
    status: 'pendente'  // ✅ NOVO: usar 'pendente' ao invés de 'solicitada' ou 'enviada'
  })
  .select();
```

### Para Formulário de Mensagens:

**Opção 1: Omitir o campo status (RECOMENDADO - mais simples)**
```javascript
// ✅ Exemplo de inserção no Supabase - SEM campo status
const { data, error } = await supabase
  .from('mensagens')
  .insert({
    nome: formData.nome,
    email: formData.email,
    telefone: formData.telefone || null,
    empresa_fazenda: formData.empresa_fazenda,
    mensagem: formData.mensagem
    // ✅ status não incluído - será 'pendente' automaticamente pelo DEFAULT
  })
  .select();
```

**Opção 2: Usar 'pendente' explicitamente**
```javascript
// ✅ Exemplo de inserção no Supabase - COM campo status explícito
const { data, error } = await supabase
  .from('mensagens')
  .insert({
    nome: formData.nome,
    email: formData.email,
    telefone: formData.telefone || null,
    empresa_fazenda: formData.empresa_fazenda,
    mensagem: formData.mensagem,
    status: 'pendente'  // ✅ NOVO: usar 'pendente' ao invés de 'enviada'
  })
  .select();
```

## 🎯 Opções de Implementação

### ✅ Opção 1: Omitir o Campo Status (MAIS SIMPLES - RECOMENDADO)

**Vantagem:** Não precisa alterar nada, apenas remover o campo `status` do insert.

```javascript
// Simplesmente não incluir o campo 'status' no insert
// O banco de dados aplicará 'pendente' automaticamente pelo DEFAULT
const insertData = {
  nome: formData.nome,
  email: formData.email,
  // ... outros campos
  // status não incluído - será 'pendente' por padrão
};
```

### ✅ Opção 2: Usar Status Explícito

**Vantagem:** Controle explícito sobre o status.

```javascript
status: 'pendente'
```

## 🔍 Onde Procurar no Código do Website

Procure por estas strings no código do website:

1. **Para análises:**
   - `status: 'solicitada'`
   - `status: 'enviada'`
   - `status: "solicitada"`
   - `status: "enviada"`
   - `'solicitada'`
   - `'enviada'`

2. **Para mensagens:**
   - `status: 'enviada'`
   - `status: "enviada"`
   - `'enviada'`

**Ação:** Remova essas linhas ou substitua por `'pendente'` ou simplesmente remova o campo `status` do objeto de inserção.

## ⚠️ Importante

1. **❌ NÃO USE MAIS os status antigos**: `solicitada`, `enviada`, `respondida`, `fechada`
2. **✅ Use `pendente`** para novos registros criados pelo website OU **omita o campo** para usar o DEFAULT
3. **✅ O campo `status` pode ser omitido** - o banco aplicará `pendente` automaticamente pelo DEFAULT
4. **✅ Teste após a correção** para garantir que os formulários funcionam

## 🚨 Checklist de Correção

- [ ] Localizar onde o formulário de análises insere dados no Supabase
- [ ] Remover ou substituir `status: 'solicitada'` ou `status: 'enviada'`
- [ ] Localizar onde o formulário de mensagens insere dados no Supabase  
- [ ] Remover ou substituir `status: 'enviada'`
- [ ] Testar inserção de análise pelo formulário
- [ ] Testar inserção de mensagem pelo formulário
- [ ] Verificar se os registros são criados com status `pendente`

## 🔍 Como Verificar se Está Funcionando

Após a correção, teste o formulário e verifique:

1. ✅ O formulário envia sem erros
2. ✅ O registro é criado no banco de dados
3. ✅ O status do registro criado é `pendente`

## 📞 Suporte

Se houver dúvidas ou problemas após a correção, entre em contato com a equipe de desenvolvimento do Sicoop.

---

**Data da Mudança:** 29/11/2025  
**Versão do Banco:** Unificação de Status v1.0

