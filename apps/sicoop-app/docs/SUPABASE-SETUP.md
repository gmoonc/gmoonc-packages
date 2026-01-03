# Configuração do Supabase para o Sistema Sicoop

## Variáveis de Ambiente Necessárias

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase Service Role Key (para operações de admin)
# ⚠️ IMPORTANTE: Esta chave deve ser mantida em segredo e nunca exposta no cliente
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Como Obter as Chaves

1. **Acesse o dashboard do Supabase**
2. **Vá para Settings > API**
3. **Copie as URLs e chaves necessárias:**
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

## ⚠️ Segurança da Service Role Key

A `SUPABASE_SERVICE_ROLE_KEY` tem privilégios de administrador e deve ser mantida em segredo:

- ✅ **Usar apenas no servidor** (API routes)
- ❌ **Nunca expor no cliente** (browser)
- ❌ **Nunca incluir em commits** do Git
- ✅ **Adicionar ao .gitignore**

## Funcionalidades Implementadas

### 1. Autenticação de Usuários
- ✅ Login com email/senha
- ✅ Registro de novos usuários
- ✅ Confirmação de email
- ✅ Recuperação de senha
- ✅ Logout seguro

### 2. Gerenciamento de Usuários
- ✅ Listagem com paginação
- ✅ Busca e filtros
- ✅ Edição de perfis
- ✅ **Exclusão recursiva de usuários** 🆕

### 3. Exclusão Recursiva de Usuários

A funcionalidade de exclusão de usuários foi implementada com segurança máxima:

#### **Processo de Exclusão:**
1. **Confirmação dupla** com modal de aviso
2. **Remoção do Supabase Auth** (conta de autenticação)
3. **Remoção do perfil** (dados do usuário)
4. **Limpeza automática** de dados relacionados (CASCADE)

#### **Segurança:**
- ✅ **API route protegida** (server-side)
- ✅ **Service role key** para operações admin
- ✅ **Validação de entrada** (userId obrigatório)
- ✅ **Tratamento de erros** robusto
- ✅ **Logs detalhados** para auditoria

#### **Interface:**
- 🗑️ **Ícone de exclusão** ao lado do ícone de edição
- ⚠️ **Modal de confirmação** com avisos claros
- 🚨 **Mensagens de aviso** sobre irreversibilidade
- 🔄 **Feedback visual** durante o processo
- ✅ **Confirmação de sucesso** após exclusão

## Estrutura do Banco de Dados

### Tabela `profiles`
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('cliente', 'funcionario', 'administrador')) DEFAULT 'cliente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Políticas RLS (Row Level Security)
- ✅ Usuários podem editar apenas seus próprios perfis
- ✅ Administradores podem gerenciar todos os usuários
- ✅ Exclusão em cascata automática

## Troubleshooting

### Erro: "Service role key não configurada"
**Solução:** Verifique se a variável `SUPABASE_SERVICE_ROLE_KEY` está definida no `.env.local`

### Erro: "Falha ao remover usuário do Auth"
**Solução:** Verifique se a service role key tem permissões de administrador no Supabase

### Usuário não é removido completamente
**Solução:** Verifique se as políticas RLS estão configuradas corretamente para CASCADE DELETE

## Próximos Passos

1. **Configurar variáveis de ambiente** no `.env.local`
2. **Testar funcionalidade de exclusão** com usuário de teste
3. **Verificar logs** no dashboard do Supabase
4. **Configurar backup** antes de usar em produção

## Suporte

Para problemas relacionados ao Supabase:
1. Verifique os logs no dashboard do Supabase
2. Consulte a [documentação oficial](https://supabase.com/docs)
3. Abra uma issue no repositório do projeto
