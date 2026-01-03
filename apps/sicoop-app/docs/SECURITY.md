# 🛡️ Guia de Segurança do Sicoop

Este documento descreve as configurações de segurança implementadas no sistema Sicoop para garantir a proteção adequada em produção.

## 📋 **Resumo de Segurança**

### ✅ **Implementado**
- Headers de segurança HTTP
- Políticas de CORS configuradas
- Content Security Policy (CSP)
- Proteção contra ataques comuns
- Middleware de segurança Next.js
- Configurações centralizadas

### ⚠️ **Configuração Manual Necessária**
- Proteção contra senhas comprometidas (Supabase)
- Configuração de MFA (Supabase)

## 🔒 **Headers de Segurança Implementados**

### **1. Content Security Policy (CSP)**
```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
```

**Protege contra:**
- XSS (Cross-Site Scripting)
- Code injection
- Clickjacking
- Data exfiltration

### **2. Strict Transport Security (HSTS)**
```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**Força:**
- Conexões HTTPS apenas
- Preload em navegadores
- Inclusão de subdomínios

### **3. X-Frame-Options**
```http
X-Frame-Options: DENY
```

**Previne:**
- Clickjacking
- Embedding em iframes maliciosos

### **4. X-Content-Type-Options**
```http
X-Content-Type-Options: nosniff
```

**Previne:**
- MIME type sniffing
- Execução de arquivos maliciosos

### **5. Referrer Policy**
```http
Referrer-Policy: strict-origin-when-cross-origin
```

**Controla:**
- Informações de referência enviadas
- Privacidade do usuário

### **6. Permissions Policy**
```http
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), ambient-light-sensor=(), autoplay=(), encrypted-media=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), web-share=(), xr-spatial-tracking=()
```

**Desabilita:**
- Recursos sensíveis do navegador
- APIs potencialmente perigosas

## 🌐 **Configurações de CORS**

### **Origins Permitidos**
```typescript
allowedOrigins: [
  'http://localhost:3000',
  'https://localhost:3000',
  // Adicionar domínios de produção aqui
]
```

### **Métodos HTTP Permitidos**
```typescript
allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
```

### **Headers Permitidos**
```typescript
allowedHeaders: [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'Accept',
  'Origin',
  'Cache-Control',
  'X-File-Name'
]
```

### **Configurações de Credenciais**
```typescript
allowCredentials: true
maxAge: 86400 // 24 horas
```

## 🚀 **Implementação Técnica**

### **Arquivos Principais**
- `src/middleware.ts` - Middleware de segurança Next.js
- `src/lib/security-config.ts` - Configurações centralizadas
- `next.config.js` - Configurações adicionais de segurança

### **Middleware de Segurança**
```typescript
export function middleware(request: NextRequest) {
  // Aplicar CORS para APIs
  // Aplicar headers de segurança para todas as rotas
  // Tratar preflight requests
}
```

### **Configuração de Rotas**
```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'
  ]
}
```

## 🔧 **Configuração para Produção**

### **1. Variáveis de Ambiente**
```bash
# .env.production
NODE_ENV=production
NEXT_PUBLIC_SECURE_COOKIES=true
NEXT_PUBLIC_FORCE_HTTPS=true
```

### **2. Domínios de Produção**
Editar `src/lib/security-config.ts`:
```typescript
allowedOrigins: [
  'https://seu-dominio.com',
  'https://www.seu-dominio.com',
  'https://seu-dominio.vercel.app'
]
```

### **3. Configurações de Build**
```bash
npm run build
npm run start
```

## 📊 **Testes de Segurança**

### **1. Verificação de Headers**
```bash
curl -I https://seu-dominio.com
```

**Headers esperados:**
- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`

### **2. Teste de CORS**
```javascript
fetch('https://seu-dominio.com/api/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ test: 'data' })
})
```

### **3. Ferramentas de Análise**
- **Mozilla Observatory**: https://observatory.mozilla.org/
- **Security Headers**: https://securityheaders.com/
- **CSP Evaluator**: https://csp-evaluator.withgoogle.com/

## 🚨 **Monitoramento e Alertas**

### **Eventos de Segurança Monitorados**
- Falhas de autenticação
- Violações de CORS
- Tentativas de XSS
- Rate limiting excedido
- Tentativas de SQL injection

### **Logs de Segurança**
```typescript
securityEvents: [
  'authentication_failure',
  'authorization_failure',
  'rate_limit_exceeded',
  'cors_violation',
  'xss_attempt',
  'sql_injection_attempt'
]
```

## 📚 **Recursos Adicionais**

### **Documentação Oficial**
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [OWASP Security Headers](https://owasp.org/www-project-sec-headers/)
- [Mozilla CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

### **Ferramentas de Teste**
- **Burp Suite** - Análise de segurança
- **OWASP ZAP** - Scanner de vulnerabilidades
- **Lighthouse** - Auditoria de segurança

## 🔄 **Manutenção**

### **Atualizações Regulares**
- Revisar configurações de CORS mensalmente
- Atualizar CSP conforme necessário
- Monitorar logs de segurança
- Verificar headers de segurança

### **Revisão de Segurança**
- Análise trimestral de configurações
- Testes de penetração
- Auditoria de código
- Atualização de dependências

---

## 📞 **Suporte de Segurança**

Para questões relacionadas à segurança:
1. **Não abra issues públicas** para vulnerabilidades
2. **Entre em contato diretamente** com a equipe de segurança
3. **Use canais seguros** para comunicação
4. **Reporte imediatamente** qualquer suspeita de vulnerabilidade

---

**Última atualização**: $(date)
**Versão**: 1.0.0
**Responsável**: Equipe de Segurança Sicoop
