// Configurações de Segurança do Sicoop
// Este arquivo centraliza todas as configurações de segurança

export const securityConfig = {
  // Configurações de CORS
  cors: {
    // Domínios permitidos (ajustar para produção)
    allowedOrigins: [
      'http://localhost:3000',
      'https://localhost:3000',
      // Domínio de produção
      'https://sicoop.goalmoon.com',
    ],
    
    // Métodos HTTP permitidos
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    
    // Headers permitidos
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Cache-Control',
      'X-File-Name',
    ],
    
    // Headers expostos
    exposedHeaders: ['Content-Length', 'X-Total-Count'],
    
    // Credenciais
    allowCredentials: true,
    
    // Tempo de cache para preflight
    maxAge: 86400, // 24 horas
  },

  // Configurações de Headers de Segurança
  securityHeaders: {
    // Content Security Policy
    csp: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://*.supabase.co"],
      'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      'font-src': ["'self'", "https://fonts.gstatic.com"],
      'img-src': ["'self'", "data:", "https:", "blob:"],
      'connect-src': ["'self'", "https://*.supabase.co", "wss://*.supabase.co"],
      'frame-src': ["'none'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'upgrade-insecure-requests': [],
    },

    // Strict Transport Security
    hsts: 'max-age=31536000; includeSubDomains; preload',

    // X-Frame-Options
    xFrameOptions: 'DENY',

    // X-Content-Type-Options
    xContentTypeOptions: 'nosniff',

    // Referrer Policy
    referrerPolicy: 'strict-origin-when-cross-origin',

    // Permissions Policy
    permissionsPolicy: [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
      'autoplay=()',
      'encrypted-media=()',
      'picture-in-picture=()',
      'publickey-credentials-get=()',
      'screen-wake-lock=()',
      'sync-xhr=()',
      'web-share=()',
      'xr-spatial-tracking=()'
    ],

    // X-DNS-Prefetch-Control
    xDnsPrefetchControl: 'off',

    // X-XSS-Protection
    xXssProtection: '1; mode=block',

    // Cache-Control para APIs
    cacheControl: 'no-store, max-age=0',
  },

  // Configurações de Rate Limiting
  rateLimit: {
    // Limite de requisições por IP por minuto
    requestsPerMinute: 100,
    
    // Limite de requisições por IP por hora
    requestsPerHour: 1000,
    
    // Headers de rate limiting
    headers: {
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': '99',
      'X-RateLimit-Reset': '1635724800',
    },
  },

  // Configurações de Autenticação
  auth: {
    // Tempo de expiração do token (em segundos)
    tokenExpiration: 3600, // 1 hora
    
    // Tempo de refresh do token (em segundos)
    refreshTokenExpiration: 2592000, // 30 dias
    
    // Headers de autenticação
    headers: {
      'X-Auth-Required': 'true',
      'X-Auth-Provider': 'supabase',
    },
  },

  // Configurações de Logs de Segurança
  logging: {
    // Habilitar logs de segurança
    enabled: true,
    
    // Nível de log
    level: 'warn', // 'error', 'warn', 'info', 'debug'
    
    // Logs de eventos de segurança
    securityEvents: [
      'authentication_failure',
      'authorization_failure',
      'rate_limit_exceeded',
      'cors_violation',
      'xss_attempt',
      'sql_injection_attempt',
    ],
  },
};

// Função para gerar CSP string
export function generateCSPString(): string {
  const csp = { ...securityConfig.securityHeaders.csp };

  // Evita problemas de carregamento no ambiente de desenvolvimento
  // removendo a diretiva que força upgrade para HTTPS
  if (process.env.NODE_ENV !== 'production') {
    delete (csp as Record<string, string[]>)["upgrade-insecure-requests"];
  }

  return Object.entries(csp)
    .map(([key, values]) => {
      const directive = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${directive} ${values.join(' ')}`;
    })
    .join('; ');
}

// Função para verificar se a origem é permitida
export function isOriginAllowed(origin: string): boolean {
  if (!origin) return true;
  return securityConfig.cors.allowedOrigins.includes(origin);
}

// Função para obter headers de segurança
export function getSecurityHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Security-Policy': generateCSPString(),
    'X-Frame-Options': securityConfig.securityHeaders.xFrameOptions,
    'X-Content-Type-Options': securityConfig.securityHeaders.xContentTypeOptions,
    'Referrer-Policy': securityConfig.securityHeaders.referrerPolicy,
    'Permissions-Policy': securityConfig.securityHeaders.permissionsPolicy.join(', '),
    'X-DNS-Prefetch-Control': securityConfig.securityHeaders.xDnsPrefetchControl,
    'X-XSS-Protection': securityConfig.securityHeaders.xXssProtection,
    'Cache-Control': securityConfig.securityHeaders.cacheControl,
  };

  // Habilita HSTS apenas em produção para evitar redirecionamentos indevidos em desenvolvimento
  if (process.env.NODE_ENV === 'production') {
    headers['Strict-Transport-Security'] = securityConfig.securityHeaders.hsts;
  }

  return headers;
}

// Função para obter headers de CORS
export function getCorsHeaders(origin: string): Record<string, string> {
  const headers: Record<string, string> = {};
  
  if (isOriginAllowed(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  
  headers['Access-Control-Allow-Methods'] = securityConfig.cors.allowedMethods.join(', ');
  headers['Access-Control-Allow-Headers'] = securityConfig.cors.allowedHeaders.join(', ');
  headers['Access-Control-Expose-Headers'] = securityConfig.cors.exposedHeaders.join(', ');
  headers['Access-Control-Max-Age'] = securityConfig.cors.maxAge.toString();
  
  if (securityConfig.cors.allowCredentials) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  
  return headers;
}
