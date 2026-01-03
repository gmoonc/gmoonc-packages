# Estrutura do Diretório `supabase/` - O que Versionar no Git

## 📁 Estrutura Atual

```
supabase/
├── .gitignore          ✅ Versionado (controla o que ignorar)
├── config.toml         ❌ Não versionado (está no .gitignore raiz)
├── migrations/         ✅ DEVE ser versionado (código fonte do schema)
├── .temp/              ❌ NÃO deve ser versionado (temporário do CLI)
└── functions/          ✅ DEVE ser versionado (código fonte Edge Functions)
```

## 🎯 Recomendações

### ✅ **MANTER NO GIT (Versionar)**

1. **`supabase/migrations/`** 
   - **Por quê?**: É código fonte do schema do banco de dados
   - **Razão**: Histórico versionado, colaboração, rollback, CI/CD
   - **Status atual**: ✅ Já está versionado
   - **Ação**: Manter versionado, mesmo que o smoonb faça backup

2. **`supabase/functions/`**
   - **Por quê?**: É código fonte das Edge Functions
   - **Razão**: Mesmas razões das migrations (versionamento, colaboração)
   - **Status atual**: ⚠️ Não está versionado ainda (`??` no git status)
   - **Ação**: **ADICIONAR ao Git**: `git add supabase/functions/`

3. **`supabase/.gitignore`**
   - **Por quê?**: Controla o que ignorar no diretório supabase
   - **Status atual**: ✅ Já está versionado

### ❌ **REMOVER DO GIT / IGNORAR (Já está correto)**

1. **`supabase/.temp/`**
   - **Por quê?**: Arquivos temporários gerados pelo Supabase CLI
   - **Status atual**: ✅ Já está no `.gitignore` (não versionado)
   - **Ação**: Manter ignorado. Pode ser deletado localmente após uso

2. **`supabase/config.toml`**
   - **Por quê?**: Pode conter configurações locais/sensíveis
   - **Status atual**: ✅ Está no `.gitignore` raiz
   - **Recomendação**: Se quiser versionar (sem secrets), pode remover do `.gitignore` raiz

## 🔄 Diferença entre Git e Backup (smoonb)

| Item | Versionar no Git? | Backup smoonb? | Razão |
|------|-------------------|----------------|-------|
| `migrations/` | ✅ **SIM** | ✅ SIM | Git = código fonte colaborativo<br>Backup = snapshot completo do servidor |
| `functions/` | ✅ **SIM** | ✅ SIM | Git = código fonte colaborativo<br>Backup = snapshot completo do servidor |
| `.temp/` | ❌ **NÃO** | ✅ SIM | Git = temporário (regenerado)<br>Backup = estado do projeto no momento |
| `config.toml` | ⚠️ **OPCIONAL** | ✅ SIM | Git = pode versionar se não tiver secrets<br>Backup = configuração completa |

## 📝 Ações Recomendadas

### 1. Adicionar `functions/` ao Git

```bash
git add supabase/functions/
git commit -m "feat: adicionar Edge Functions ao versionamento"
```

### 2. Considerar versionar `config.toml` (sem secrets)

Se você quiser versionar o `config.toml`:

1. Remover do `.gitignore` raiz:
   ```bash
   # Remover esta linha do .gitignore raiz:
   # supabase/config.toml
   ```

2. Garantir que não há secrets no arquivo

3. Adicionar ao Git:
   ```bash
   git add supabase/config.toml
   ```

### 3. Manter `.temp/` ignorado (já está correto)

O `.temp/` já está corretamente ignorado. Não precisa fazer nada.

## 🚫 O que NÃO remover do Git

**IMPORTANTE**: Mesmo que o smoonb faça backup, **NÃO remova do Git**:
- ❌ `migrations/` - É código fonte essencial
- ❌ `functions/` - É código fonte essencial

**Razão**: O Git serve para colaboração e histórico. O backup do smoonb serve para restauração completa do servidor. São complementares, não substitutos.

## ✅ Checklist Final

- [ ] `migrations/` está versionado ✅
- [ ] `functions/` deve ser adicionado ao Git ⚠️
- [ ] `.temp/` está ignorado ✅
- [ ] `config.toml` está ignorado (ou versionado sem secrets) ✅
- [ ] `.gitignore` está versionado ✅

