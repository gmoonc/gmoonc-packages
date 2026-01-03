# 📋 Documentação da Interface Atual - Para Correção dos Testes Jest

## 🎯 Objetivo

Este documento registra as mudanças na interface identificadas durante a execução dos testes Playwright, para garantir que os testes Jest sejam corrigidos de acordo com a interface real.

---

## ✅ Testes Playwright Executados e Status

### Testes de Autenticação
- ✅ **Login/Logout** - PASSOU
- ✅ **Criação de Usuário** - PASSOU
- ✅ **Confirmação de Usuário** - PASSOU
- ✅ **Solicitar Reset de Senha** - PASSOU
- ✅ **Reset de Senha Completo** - PASSOU

### Testes de Gestão de Usuário
- ✅ **Exclusão de Usuário** - PASSOU (corrigido para usar admin)
- ⏳ **Mudança de Perfil** - Pendente (requer recriar usuário)

---

## 🔄 Mudanças Identificadas na Interface

### 1. Menu Lateral (SicoopMenu)

#### Mudança Principal
- **"Administrativo" agora é o PRIMEIRO item do menu**
- Ordem anterior: desconhecida
- Ordem atual: Administrativo → Financeiro → Help-Desk → Secretaria → Técnico → Vendas → Cliente

#### Estrutura do Menu Administrativo
```
Administrativo (primeiro item)
  ├── Usuários (/admin/usuarios)
  ├── Permissões (/admin/permissoes)
  ├── Gerenciamento de Autorizações (/admin/autorizacoes)
  └── Gerenciamento de Notificações (/admin/notificacoes)
```

#### Impacto nos Testes
- Testes que procuram pelo menu "Administrativo" devem considerar que é o primeiro item
- Seletores devem ser mais robustos para encontrar o primeiro item do menu
- Testes podem usar `page.locator('[class*="menu-item"]').first()` como fallback

### 2. Página de Recuperação de Senha (ForgotPasswordPage)

#### Comportamento Observado
- ✅ Verifica variáveis de ambiente do Supabase (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- ✅ Exibe erro "Configuração do Supabase ausente" se variáveis não estiverem configuradas
- ✅ Mensagem de sucesso aparece dentro de elemento com classe `.auth-error` (mas é sucesso)
- ✅ Estado de loading desabilita campos durante envio
- ✅ Após sucesso, mostra mensagem "E-mail Enviado" com detalhes

#### Estrutura da Mensagem de Sucesso
```html
<div className="auth-success">
  <p>
    Enviamos um link de recuperação para <strong>{email}</strong>.
    Clique no link para redefinir sua senha.
  </p>
</div>
```

#### Impacto nos Testes Jest
- Testes devem mockar variáveis de ambiente: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Testes devem mockar `window.location.origin`
- Mensagem de sucesso pode estar em elemento com classe `.auth-error` (verificar texto ao invés de classe)

### 3. API de Exclusão de Usuário (DELETE /api/users/delete)

#### Mudanças no Código
- ✅ Agora requer `SUPABASE_SERVICE_ROLE_KEY` obrigatoriamente
- ✅ Validação da service role key acontece ANTES da validação do userId
- ✅ Ordem de operações: análises → mensagens → perfil → auth
- ✅ Não verifica mais perfil antes de deletar (deleta diretamente)

#### Fluxo de Exclusão
1. Verificar `SUPABASE_SERVICE_ROLE_KEY` (retorna 500 se ausente)
2. Validar `userId` (retorna 400 se inválido)
3. Deletar análises_cobertura
4. Deletar mensagens
5. Deletar perfil
6. Deletar usuário do Auth

#### Impacto nos Testes Jest
- Todos os testes devem configurar `SUPABASE_SERVICE_ROLE_KEY` no `process.env`
- Testes de validação de entrada podem receber 500 ao invés de 400 se service role não configurada
- Mocks devem incluir operações de delete de análises e mensagens
- Teste "verificar perfil antes" está obsoleto (código não faz mais isso)

### 4. AuthContext

#### Comportamento Observado
- ✅ Estado inicial: `isLoading: true` (mas pode mudar rapidamente)
- ✅ Verifica `hasSupabaseEnv` antes de executar operações
- ✅ Funções (login, logout, register) verificam configuração do Supabase
- ✅ Usa `useEffect` com `setTimeout` de 1000ms para verificar sessão inicial

#### Impacto nos Testes Jest
- Testes devem mockar `hasSupabaseEnv` para retornar `true`
- Testes devem usar `waitFor` para aguardar estado inicial
- Mocks do Supabase devem ser configurados antes do render
- Funções podem retornar early se `hasSupabaseEnv` for false

---

## 🔍 Seletores Atualizados para Testes

### Menu Administrativo (Primeiro Item)
```typescript
// Seletores robustos (em ordem de preferência)
const adminMenuSelectors = [
  page.locator('[class*="menu-item"]').first(), // Primeiro item
  page.locator('text=Administrativo').first(),
  page.locator('[class*="menu-item"]:has-text("Administrativo")').first(),
  page.locator('.menu-item:has-text("Administrativo")').first(),
];
```

### Submenu Usuários
```typescript
const userMenuSelectors = [
  page.locator('text=Usuários').filter({ hasText: 'Usuários' }).first(),
  page.locator('a:has-text("Usuários")').first(),
  page.locator('[class*="menu-link"]:has-text("Usuários")').first(),
];
```

---

## 📝 Checklist para Correção dos Testes Jest

### users-delete.test.ts
- [ ] Configurar `SUPABASE_SERVICE_ROLE_KEY` em todos os testes
- [ ] Atualizar mocks para incluir delete de análises e mensagens
- [ ] Ajustar expectativas: validação pode retornar 500 se service role ausente
- [ ] Remover teste "verificar perfil antes" (obsoleto)

### AuthContext.test.tsx
- [ ] Mockar `hasSupabaseEnv` para retornar `true`
- [ ] Usar `waitFor` para estado inicial
- [ ] Configurar mocks do Supabase antes do render
- [ ] Adicionar `waitFor`/`act` para funções assíncronas

### forgot-password/page.test.tsx
- [ ] Configurar `NEXT_PUBLIC_SUPABASE_URL` nos testes
- [ ] Configurar `NEXT_PUBLIC_SUPABASE_ANON_KEY` nos testes
- [ ] Mockar `window.location.origin`
- [ ] Ajustar seletores de mensagem de sucesso (verificar texto, não classe)

---

## 🎯 Próximos Passos

1. ✅ Executar todos os testes Playwright (quase completo)
2. ⏳ Criar usuário Gus novamente para teste de mudança de perfil
3. ⏳ Executar teste de mudança de perfil
4. ⏳ Corrigir testes Jest baseado nesta documentação
5. ⏳ Validar que todos os testes Jest passam

---

**Última atualização:** Baseado na execução dos testes Playwright em produção
**Versão da Interface:** Atual (Janeiro 2025)

