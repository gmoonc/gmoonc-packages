# 📋 Plano de Correção dos Testes

## 📊 Resumo Executivo

**Total de Testes**: 561  
**Testes Passando**: 540 ✅  
**Testes Falhando**: 21 ❌  
**Taxa de Sucesso**: 96.3%

### Arquivos com Falhas

1. **src/app/api/__tests__/users-delete.test.ts** - 11 testes falhando
2. **src/contexts/__tests__/AuthContext.test.tsx** - 4 testes falhando  
3. **src/app/auth/forgot-password/__tests__/page.test.tsx** - 4 testes falhando

---

## 🔴 Problema 1: users-delete.test.ts (11 falhas)

### Causa Raiz
O código da rota `DELETE /api/users/delete` foi alterado e agora:
1. **Requer `SUPABASE_SERVICE_ROLE_KEY`** - verifica no início e retorna erro 500 se não estiver configurada
2. **Não verifica perfil antes de deletar** - o código atual deleta diretamente sem verificar se o perfil existe
3. **Ordem de operações mudou** - agora deleta análises, mensagens, perfil e depois usuário do Auth
4. **Validação de entrada acontece DEPOIS da verificação da service role key** - causando status 500 ao invés de 400

### Testes Afetados

#### Grupo 1: Validação de Entrada (3 testes)
- ❌ `deve retornar 400 quando userId está ausente` → Recebe 500
- ❌ `deve retornar 400 quando userId é null` → Recebe 500  
- ❌ `deve retornar 400 quando userId é string vazia` → Recebe 500

**Causa**: A validação da service role key acontece ANTES da validação do userId, então retorna 500 ao invés de 400.

#### Grupo 2: Exclusão de Usuário (3 testes)
- ❌ `deve excluir usuário com sucesso quando perfil não existe` → Recebe 500
- ❌ `deve excluir usuário e perfil com sucesso quando perfil existe` → Recebe 500
- ❌ `deve configurar cliente Supabase com service role key` → Mock não é chamado

**Causa**: 
- Mocks não estão configurando corretamente a service role key
- O código não verifica mais perfil antes de deletar (mudança de comportamento)
- Mocks precisam retornar valores para as operações de delete de análises e mensagens

#### Grupo 3: Tratamento de Erros (4 testes)
- ❌ `deve retornar 500 quando falha ao remover usuário do Auth` → Recebe "Service role key não configurada"
- ❌ `deve retornar 500 quando falha ao remover perfil` → Recebe "Service role key não configurada"
- ❌ `deve retornar 500 quando ocorre erro interno` → Recebe "Service role key não configurada"
- ❌ `deve retornar 500 quando JSON é inválido` → Recebe "Service role key não configurada"

**Causa**: Todos os testes estão recebendo erro de service role key porque o mock não está configurando `process.env.SUPABASE_SERVICE_ROLE_KEY` corretamente.

#### Grupo 4: Cenários de Sucesso (1 teste)
- ❌ `deve excluir diferentes tipos de usuários` → Recebe 500
- ❌ `deve verificar perfil antes de tentar remover` → Mock não é chamado

**Causa**: 
- Service role key não configurada nos testes
- O código não verifica mais perfil antes de deletar (comportamento mudou)

### Solução Proposta

#### 1. Corrigir Ordem de Validação no Código (OPCIONAL - se quiser manter comportamento atual)
```typescript
// Mover validação do userId ANTES da verificação da service role key
// OU manter como está e ajustar testes para esperar 500 quando service role não está configurada
```

#### 2. Atualizar Testes para Configurar Service Role Key
- Garantir que `process.env.SUPABASE_SERVICE_ROLE_KEY` está configurado em TODOS os testes
- Usar `beforeEach` para configurar consistentemente

#### 3. Atualizar Mocks para Nova Estrutura
- Mockar operações de delete de `analises_cobertura` e `mensagens`
- Remover expectativas de verificação de perfil (se o código não faz mais isso)
- Ajustar mocks para refletir a ordem real: análises → mensagens → perfil → auth

#### 4. Ajustar Expectativas dos Testes
- Testes de validação: esperar 500 quando service role não configurada OU ajustar código para validar userId primeiro
- Testes de sucesso: configurar mocks para todas as operações (análises, mensagens, perfil, auth)
- Teste "verificar perfil antes": remover ou ajustar para refletir novo comportamento

---

## 🔴 Problema 2: AuthContext.test.tsx (4 falhas)

### Causa Raiz
1. **Estado inicial `isLoading`** - O código tem um `useEffect` que verifica sessão, mas nos testes ele pode estar executando muito rápido ou o mock não está retornando corretamente
2. **Funções não estão sendo chamadas** - Os mocks do Supabase podem não estar sendo aplicados corretamente ou as funções estão sendo chamadas de forma assíncrona

### Testes Afetados

#### 1. Estado Inicial (1 teste)
- ❌ `deve ter estado inicial correto` → Espera `loading: true`, recebe `false`

**Causa**: O `useEffect` no AuthContext executa `checkAuth()` que:
- Verifica `hasSupabaseEnv` (pode estar false nos testes)
- Se `typeof window === 'undefined'`, seta `isLoading` para false imediatamente
- Tem um `setTimeout` de 1000ms antes de verificar sessão
- O teste pode estar verificando antes do timeout ou o mock não está configurado

#### 2. Funções do Contexto (3 testes)
- ❌ `deve chamar login quando botão é clicado` → Função não é chamada
- ❌ `deve chamar logout quando botão é clicado` → Função não é chamada  
- ❌ `deve chamar register quando botão é clicado` → Função não é chamada
- ❌ `deve chamar resendConfirmationEmail quando botão é clicado` → Função não é chamada

**Causa**: 
- As funções `login`, `logout`, `register`, `resendConfirmationEmail` podem estar verificando `hasSupabaseEnv` e retornando early
- Os mocks podem não estar sendo aplicados corretamente ao módulo `@/lib/supabase`
- As funções podem estar lançando erros silenciosamente

### Solução Proposta

#### 1. Mockar `hasSupabaseEnv`
- Garantir que `hasSupabaseEnv` retorna `true` nos testes
- Mockar o módulo `@/lib/supabase` corretamente

#### 2. Ajustar Teste de Estado Inicial
- Usar `waitFor` para aguardar o estado inicial ser definido
- OU mockar o `useEffect` para não executar
- OU ajustar expectativa para `false` se o comportamento mudou

#### 3. Corrigir Mocks das Funções
- Verificar se `global.mockSupabase` está sendo configurado antes do render
- Garantir que as funções do contexto estão realmente chamando os mocks
- Adicionar `waitFor` ou `act` para aguardar execução assíncrona

#### 4. Mockar `window` e `setTimeout`
- Garantir que `window` está definido nos testes
- Mockar `setTimeout` ou usar `jest.useFakeTimers()` se necessário

---

## 🔴 Problema 3: forgot-password/page.test.tsx (4 falhas)

### Causa Raiz
O componente `ForgotPasswordPage` verifica se as variáveis de ambiente do Supabase estão configuradas:
```typescript
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Configuração do Supabase ausente.');
}
```

Quando essas variáveis não estão configuradas, o componente exibe um erro ao invés de funcionar normalmente.

### Testes Afetados

#### 1. Envio de Email (2 testes)
- ❌ `deve enviar email de recuperação com sucesso` → Mostra erro "Configuração do Supabase ausente"
- ❌ `deve exibir erro quando envio falha` → Mostra erro "Configuração do Supabase ausente"

**Causa**: As variáveis de ambiente `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` não estão configuradas nos testes.

#### 2. Estado de Loading (2 testes)
- ❌ `deve exibir estado de loading durante envio` → Botão não está desabilitado
- ❌ `deve desabilitar campos durante loading` → Campos não estão desabilitados

**Causa**: 
- O componente está lançando erro antes de chegar ao estado de loading
- OU o estado de loading não está sendo aplicado corretamente (disabled attribute)

### Solução Proposta

#### 1. Configurar Variáveis de Ambiente nos Testes
```typescript
beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
});
```

#### 2. Mockar `window.location`
- O componente usa `window.location.origin` - garantir que está mockado

#### 3. Ajustar Testes de Loading
- Garantir que variáveis de ambiente estão configuradas antes de testar loading
- Verificar se o componente realmente desabilita campos durante loading
- Usar `waitFor` para aguardar estado de loading se necessário

#### 4. Mockar `fetch` Corretamente
- Garantir que `global.fetch` está mockado para retornar respostas apropriadas
- Mockar tanto sucesso quanto erro conforme necessário

---

## 📝 Plano de Implementação

### Fase 1: Correção dos Testes de API (users-delete.test.ts)
**Prioridade**: ALTA  
**Tempo Estimado**: 1-2 horas

1. ✅ Analisar código atual da rota DELETE
2. ⏳ Configurar `SUPABASE_SERVICE_ROLE_KEY` em todos os testes
3. ⏳ Atualizar mocks para incluir operações de delete de análises e mensagens
4. ⏳ Ajustar expectativas dos testes para refletir novo comportamento
5. ⏳ Decidir se validação de userId deve vir antes da service role key (ou ajustar testes)

### Fase 2: Correção dos Testes de Contexto (AuthContext.test.tsx)
**Prioridade**: MÉDIA  
**Tempo Estimado**: 1 hora

1. ✅ Analisar código atual do AuthContext
2. ⏳ Mockar `hasSupabaseEnv` para retornar `true`
3. ⏳ Configurar mocks do Supabase corretamente antes de cada teste
4. ⏳ Ajustar teste de estado inicial (usar `waitFor` ou ajustar expectativa)
5. ⏳ Corrigir testes de funções (adicionar `waitFor`/`act` se necessário)

### Fase 3: Correção dos Testes de Página (forgot-password/page.test.tsx)
**Prioridade**: BAIXA  
**Tempo Estimado**: 30 minutos

1. ✅ Analisar código atual da página
2. ⏳ Configurar variáveis de ambiente nos testes
3. ⏳ Mockar `window.location.origin`
4. ⏳ Ajustar testes de loading para funcionar após correção das variáveis

---

## 🎯 Priorização

### Ordem Recomendada de Correção

1. **forgot-password/page.test.tsx** (MAIS FÁCIL)
   - Correção simples: apenas configurar variáveis de ambiente
   - Impacto rápido: 4 testes corrigidos rapidamente

2. **AuthContext.test.tsx** (MÉDIA COMPLEXIDADE)
   - Requer ajustes nos mocks e possivelmente uso de `waitFor`
   - Importante para garantir que contexto funciona corretamente

3. **users-delete.test.ts** (MAIS COMPLEXO)
   - Requer análise mais profunda da mudança de comportamento
   - Pode precisar de decisão sobre ordem de validações
   - Maior número de testes afetados

---

## ⚠️ Decisões Necessárias

### 1. Ordem de Validação em users-delete
**Pergunta**: A validação do `userId` deve acontecer ANTES ou DEPOIS da verificação da service role key?

**Opções**:
- **Opção A**: Validar userId primeiro (retorna 400 se inválido, 500 se service role ausente)
- **Opção B**: Manter como está (retorna 500 se service role ausente, mesmo com userId inválido)

**Recomendação**: Opção A (mais semântico - 400 para erro de cliente, 500 para erro de servidor)

### 2. Comportamento de Verificação de Perfil
**Pergunta**: O código deve verificar se o perfil existe antes de deletar?

**Situação Atual**: Código não verifica mais perfil antes de deletar

**Opções**:
- **Opção A**: Remover teste "deve verificar perfil antes de tentar remover"
- **Opção B**: Ajustar código para verificar perfil antes de deletar

**Recomendação**: Opção A (se o código não faz mais isso, o teste está obsoleto)

### 3. Estado Inicial do AuthContext
**Pergunta**: O estado inicial deve ser `isLoading: true` ou `false`?

**Situação Atual**: Teste espera `true`, mas recebe `false`

**Opções**:
- **Opção A**: Ajustar código para garantir `isLoading: true` inicialmente
- **Opção B**: Ajustar teste para esperar `false` (se comportamento mudou intencionalmente)

**Recomendação**: Opção A (mais correto semanticamente - deve estar carregando inicialmente)

---

## 📊 Métricas de Sucesso

Após correções:
- ✅ **0 testes falhando**
- ✅ **561 testes passando**
- ✅ **100% de taxa de sucesso**
- ✅ **Todos os testes refletem comportamento atual do código**

---

## 🔍 Checklist de Verificação

Após cada correção, verificar:

- [ ] Teste específico passa
- [ ] Não quebrou outros testes
- [ ] Código de produção não foi alterado (apenas testes)
- [ ] Mocks estão configurados corretamente
- [ ] Variáveis de ambiente estão mockadas quando necessário
- [ ] `waitFor`/`act` são usados quando necessário para operações assíncronas
- [ ] Expectativas refletem comportamento real do código

---

## 📚 Referências

- Código da rota: `src/app/api/users/delete/route.ts`
- Código do contexto: `src/contexts/AuthContext.tsx`
- Código da página: `src/app/auth/forgot-password/page.tsx`
- Setup de testes: `jest.setup.js`
- Configuração Jest: `jest.config.js`

