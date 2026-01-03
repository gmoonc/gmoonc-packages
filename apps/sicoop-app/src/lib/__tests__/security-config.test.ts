import { 
  generateCSPString, 
  isOriginAllowed, 
  getSecurityHeaders, 
  getCorsHeaders,
  securityConfig 
} from '../security-config';

describe('security-config', () => {
  describe('generateCSPString', () => {
    it('deve gerar CSP string corretamente em produção', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const cspString = generateCSPString();

      expect(cspString).toContain('default-src \'self\'');
      expect(cspString).toContain('script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' https://*.supabase.co');
      expect(cspString).toContain('style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com');
      expect(cspString).toContain('upgrade-insecure-requests');

      process.env.NODE_ENV = originalEnv;
    });

    it('deve gerar CSP string sem upgrade-insecure-requests em desenvolvimento', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const cspString = generateCSPString();

      expect(cspString).not.toContain('upgrade-insecure-requests');

      process.env.NODE_ENV = originalEnv;
    });

    it('deve conter todas as diretivas CSP necessárias', () => {
      const cspString = generateCSPString();

      expect(cspString).toContain('default-src');
      expect(cspString).toContain('script-src');
      expect(cspString).toContain('style-src');
      expect(cspString).toContain('font-src');
      expect(cspString).toContain('img-src');
      expect(cspString).toContain('connect-src');
      expect(cspString).toContain('frame-src');
      expect(cspString).toContain('object-src');
      expect(cspString).toContain('base-uri');
      expect(cspString).toContain('form-action');
      expect(cspString).toContain('frame-ancestors');
    });
  });

  describe('isOriginAllowed', () => {
    it('deve permitir origens da lista de permitidas', () => {
      expect(isOriginAllowed('http://localhost:3000')).toBe(true);
      expect(isOriginAllowed('https://localhost:3000')).toBe(true);
      expect(isOriginAllowed('https://sicoop.goalmoon.com')).toBe(true);
    });

    it('deve rejeitar origens não permitidas', () => {
      expect(isOriginAllowed('https://malicious-site.com')).toBe(false);
      expect(isOriginAllowed('http://evil.com')).toBe(false);
      expect(isOriginAllowed('https://phishing-site.org')).toBe(false);
    });

    it('deve permitir origem vazia ou undefined', () => {
      expect(isOriginAllowed('')).toBe(true);
      expect(isOriginAllowed(undefined as unknown as string)).toBe(true);
    });
  });

  describe('getSecurityHeaders', () => {
    it('deve retornar todos os headers de segurança', () => {
      const headers = getSecurityHeaders();

      expect(headers).toHaveProperty('Content-Security-Policy');
      expect(headers).toHaveProperty('X-Frame-Options');
      expect(headers).toHaveProperty('X-Content-Type-Options');
      expect(headers).toHaveProperty('Referrer-Policy');
      expect(headers).toHaveProperty('Permissions-Policy');
      expect(headers).toHaveProperty('X-DNS-Prefetch-Control');
      expect(headers).toHaveProperty('X-XSS-Protection');
      expect(headers).toHaveProperty('Cache-Control');
    });

    it('deve incluir HSTS apenas em produção', () => {
      const originalEnv = process.env.NODE_ENV;
      
      // Teste em produção
      process.env.NODE_ENV = 'production';
      const prodHeaders = getSecurityHeaders();
      expect(prodHeaders).toHaveProperty('Strict-Transport-Security');

      // Teste em desenvolvimento
      process.env.NODE_ENV = 'development';
      const devHeaders = getSecurityHeaders();
      expect(devHeaders).not.toHaveProperty('Strict-Transport-Security');

      process.env.NODE_ENV = originalEnv;
    });

    it('deve ter valores corretos para os headers', () => {
      const headers = getSecurityHeaders();

      expect(headers['X-Frame-Options']).toBe('DENY');
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
      expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
      expect(headers['X-DNS-Prefetch-Control']).toBe('off');
      expect(headers['X-XSS-Protection']).toBe('1; mode=block');
      expect(headers['Cache-Control']).toBe('no-store, max-age=0');
    });
  });

  describe('getCorsHeaders', () => {
    it('deve retornar headers CORS para origem permitida', () => {
      const headers = getCorsHeaders('http://localhost:3000');

      expect(headers).toHaveProperty('Access-Control-Allow-Origin', 'http://localhost:3000');
      expect(headers).toHaveProperty('Access-Control-Allow-Methods');
      expect(headers).toHaveProperty('Access-Control-Allow-Headers');
      expect(headers).toHaveProperty('Access-Control-Expose-Headers');
      expect(headers).toHaveProperty('Access-Control-Max-Age');
      expect(headers).toHaveProperty('Access-Control-Allow-Credentials', 'true');
    });

    it('deve retornar headers CORS sem origem para origem não permitida', () => {
      const headers = getCorsHeaders('https://malicious-site.com');

      expect(headers).not.toHaveProperty('Access-Control-Allow-Origin');
      expect(headers).toHaveProperty('Access-Control-Allow-Methods');
      expect(headers).toHaveProperty('Access-Control-Allow-Headers');
      expect(headers).toHaveProperty('Access-Control-Expose-Headers');
      expect(headers).toHaveProperty('Access-Control-Max-Age');
      expect(headers).toHaveProperty('Access-Control-Allow-Credentials', 'true');
    });

    it('deve incluir métodos e headers corretos', () => {
      const headers = getCorsHeaders('http://localhost:3000');

      expect(headers['Access-Control-Allow-Methods']).toContain('GET');
      expect(headers['Access-Control-Allow-Methods']).toContain('POST');
      expect(headers['Access-Control-Allow-Methods']).toContain('PUT');
      expect(headers['Access-Control-Allow-Methods']).toContain('DELETE');
      expect(headers['Access-Control-Allow-Methods']).toContain('OPTIONS');

      expect(headers['Access-Control-Allow-Headers']).toContain('Content-Type');
      expect(headers['Access-Control-Allow-Headers']).toContain('Authorization');
      expect(headers['Access-Control-Allow-Headers']).toContain('X-Requested-With');
    });
  });

  describe('securityConfig', () => {
    it('deve ter configurações CORS corretas', () => {
      expect(securityConfig.cors.allowedOrigins).toContain('http://localhost:3000');
      expect(securityConfig.cors.allowedOrigins).toContain('https://sicoop.goalmoon.com');
      expect(securityConfig.cors.allowedMethods).toContain('GET');
      expect(securityConfig.cors.allowedMethods).toContain('POST');
      expect(securityConfig.cors.allowCredentials).toBe(true);
      expect(securityConfig.cors.maxAge).toBe(86400);
    });

    it('deve ter configurações de rate limiting corretas', () => {
      expect(securityConfig.rateLimit.requestsPerMinute).toBe(100);
      expect(securityConfig.rateLimit.requestsPerHour).toBe(1000);
      expect(securityConfig.rateLimit.headers).toHaveProperty('X-RateLimit-Limit');
    });

    it('deve ter configurações de autenticação corretas', () => {
      expect(securityConfig.auth.tokenExpiration).toBe(3600);
      expect(securityConfig.auth.refreshTokenExpiration).toBe(2592000);
      expect(securityConfig.auth.headers).toHaveProperty('X-Auth-Required');
    });

    it('deve ter configurações de logging corretas', () => {
      expect(securityConfig.logging.enabled).toBe(true);
      expect(securityConfig.logging.level).toBe('warn');
      expect(securityConfig.logging.securityEvents).toContain('authentication_failure');
      expect(securityConfig.logging.securityEvents).toContain('xss_attempt');
    });
  });
});
