# 🗄️ Guia de Migrations do Supabase para o Sicoop

## 📋 **Visão Geral**

Este documento explica como gerenciar as migrations do banco de dados do Sicoop usando o Supabase CLI.

## 🚀 **Comandos Principais**

### **1. Aplicar Migrations (Deploy)**
```bash
# Usar o script seguro (RECOMENDADO)
./deploy-db-secure.sh

# Ou executar manualmente
supabase db push --db-url $SUPABASE_DB_URL
```

### **2. Verificar Status das Migrations**
```bash
# Ver diferenças entre local e remoto
supabase db diff --db-url $SUPABASE_DB_URL

# Ver migrations aplicadas
supabase db status --db-url $SUPABASE_DB_URL
```

### **3. Criar Nova Migration**
```bash
# Criar nova migration
supabase migration new nome_da_migration

# Exemplo
supabase migration new add_user_preferences
```

### **4. Fazer Pull do Schema Remoto**
```bash
# Baixar schema atual do banco remoto
supabase db pull --db-url $SUPABASE_DB_URL
```

## 📁 **Estrutura de Migrations**

```
supabase/
├── migrations/           # Pasta das migrations
│   ├── 001_initial_setup.sql    # Migration inicial
│   └── 002_nova_feature.sql     # Próximas migrations
├── config.toml          # Configuração do projeto
└── .gitignore          # Arquivos ignorados
```

## 🔧 **Criando Novas Migrations**

### **1. Estrutura de uma Migration**
```sql
-- Migration: 002_add_user_preferences.sql
-- Description: Adiciona tabela de preferências do usuário
-- Date: 2025-08-22

-- Código SQL aqui
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    theme TEXT DEFAULT 'light',
    language TEXT DEFAULT 'pt-BR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
    FOR ALL USING (auth.uid() = id);
```

### **2. Boas Práticas**
- ✅ **Sempre use `IF NOT EXISTS`** para tabelas
- ✅ **Habilite RLS** em todas as tabelas
- ✅ **Crie políticas de segurança** adequadas
- ✅ **Use comentários** para documentar
- ✅ **Teste localmente** antes do deploy
- ❌ **Nunca altere migrations existentes**
- ❌ **Não delete migrations** já aplicadas

## 🧪 **Testando Migrations**

### **1. Ambiente Local**
```bash
# Iniciar banco local
supabase start

# Aplicar migrations localmente
supabase db reset

# Parar ambiente local
supabase stop
```

### **2. Verificação de Schema**
```bash
# Ver diferenças
supabase db diff

# Validar SQL
supabase db lint
```

## 🚨 **Solução de Problemas**

### **Erro: "Migration already applied"**
```bash
# Verificar status
supabase db status --db-url "sua_url"

# Se necessário, resetar
supabase db reset --db-url "sua_url"
```

### **Erro: "RLS policy violation"**
- Verifique se as políticas foram criadas
- Confirme se o usuário tem permissões
- Teste as políticas localmente

### **Erro: "Function not found"**
- Verifique se as funções foram criadas
- Confirme se os triggers estão funcionando
- Teste as funções no SQL Editor do Supabase

## 📊 **Monitoramento**

### **1. Logs de Migration**
- Todas as migrations são registradas em `supabase_migrations.schema_migrations`
- Inclui timestamp, versão e statements executados

### **2. Verificação de Integridade**
```sql
-- Ver migrations aplicadas
SELECT * FROM supabase_migrations.schema_migrations ORDER BY version;

-- Verificar tabelas criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies WHERE schemaname = 'public';
```

## 🔄 **Workflow de Desenvolvimento**

### **1. Desenvolvimento Local**
```bash
# 1. Fazer alterações no schema
# 2. Criar nova migration
supabase migration new feature_name

# 3. Testar localmente
supabase start
supabase db reset
supabase stop

# 4. Commit e push
git add .
git commit -m "Add new feature migration"
git push
```

### **2. Deploy em Produção**
```bash
# 1. Aplicar migrations
./deploy-db.sh

# 2. Verificar status
supabase db status --db-url "sua_url"

# 3. Testar funcionalidades
```

## 📚 **Recursos Adicionais**

- **Documentação Supabase**: [docs.supabase.com](https://docs.supabase.com)
- **CLI Reference**: [supabase.com/docs/reference/cli](https://supabase.com/docs/reference/cli)
- **Database Guide**: [supabase.com/docs/guides/database](https://supabase.com/docs/guides/database)

---

**🎯 Dica**: Sempre teste suas migrations localmente antes de fazer deploy em produção!
