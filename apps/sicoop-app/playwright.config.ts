import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para Testes Semi-Automatizados
 * 
 * ⚠️ IMPORTANTE: Testes são executados em PRODUÇÃO (https://sicoop.goalmoon.com)
 * ⚠️ NÃO permitir execução paralela para evitar criação de múltiplos usuários
 */

export default defineConfig({
  testDir: './tests',
  
  fullyParallel: false,
  workers: 1,
  
  reporter: 'html',
  
  use: {
    baseURL: 'https://sicoop.goalmoon.com',
    trace: 'on',
    screenshot: 'on',
    video: 'on',
    viewport: { width: 1920, height: 1080 }, // Garantir modo desktop
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Flags para tentar reduzir detecção de automação pelo Cloudflare Turnstile
        launchOptions: {
          args: [
            '--disable-blink-features=AutomationControlled',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
          ],
        },
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});

