# Configuração da Edge Function de Notificações

## Problema Identificado
A Edge Function está retornando erro 500 porque as variáveis de ambiente não estão configuradas.

## Solução

### 1. Configurar Variáveis de Ambiente no Supabase

Acesse o painel do Supabase:
1. Vá para **Settings > Edge Functions**
2. Clique em **Environment Variables**
3. Adicione as seguintes variáveis:

#### Obrigatórias:
```
SUPABASE_URL=https://itrnlqdcbccyzqtymfju.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

#### Opcionais (para envio real de emails):
```
RESEND_API_KEY=re_sua_chave_do_resend_aqui
```

### 2. Como Obter as Chaves

#### SUPABASE_URL:
- Já está no seu projeto: `https://itrnlqdcbccyzqtymfju.supabase.co`

#### SUPABASE_SERVICE_ROLE_KEY:
1. Vá para **Settings > API**
2. Copie a **service_role** key (não a anon key)

#### RESEND_API_KEY:
1. Acesse [resend.com](https://resend.com)
2. Crie uma conta ou faça login
3. Vá para **API Keys**
4. Crie uma nova chave
5. Copie a chave (começa com `re_`)

### 3. Teste da Configuração

A Edge Function agora envia emails reais via Resend:
- Requer `RESEND_API_KEY` configurada
- Envia emails reais para os destinatários
- Registra logs de sucesso e erro no banco de dados

### 4. Verificar Logs

Para ver os logs da Edge Function:
1. Vá para **Edge Functions** no painel do Supabase
2. Clique na função `send-notification-email`
3. Vá para a aba **Logs**
4. Verifique se há erros ou mensagens de debug

### 5. Teste Manual

Você pode testar a Edge Function diretamente:

```javascript
// No console do navegador
const response = await fetch('https://itrnlqdcbccyzqtymfju.supabase.co/functions/v1/send-notification-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sua_anon_key_aqui'
  },
  body: JSON.stringify({
    category: 'nova_mensagem',
    entityType: 'mensagem',
    entityId: 'test-id',
    entityData: {
      nome: 'Teste',
      email: 'teste@exemplo.com',
      mensagem: 'Mensagem de teste'
    }
  })
});

const result = await response.json();
console.log(result);
```

## Status Atual

✅ **Edge Function atualizada** com melhor tratamento de erros
✅ **Envio real de emails** via Resend
✅ **Logs detalhados** para debug
✅ **Sistema de notificações** funcionando completamente!

O sistema agora envia emails reais para os administradores quando novas mensagens ou análises são cadastradas.
