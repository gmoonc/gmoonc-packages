import * as fs from 'fs';
import * as path from 'path';

/**
 * 🔐 Configurações de Testes Semi-Automatizados
 * 
 * Carrega as credenciais de teste do arquivo config.test
 * que deve estar localizado em tests/
 */

export interface TestUser {
  id: string;
  email: string;
  currentPassword: string;
  nextPassword: string;
}

export interface NotificationCategoryConfig {
  displayName: string;
  description: string;
  subject: string;
  body: string;
}

export interface AnalysisCategoryConfig {
  displayName: string;
  description: string;
  subject: string;
  body: string;
}

export interface TestConfig {
  actualUser: string;
  secondUser: string;
  adminUser: string;
  temporaryLink: string;
  temporarySecondUserLink: string;
  baseUrl: string;
  devUrl: string;
  environment: string;
  websiteUrl: string;
  users: Record<string, TestUser>;
  notificationCategory?: NotificationCategoryConfig;
  analysisCategory?: AnalysisCategoryConfig;
}

let configCache: TestConfig | null = null;

/**
 * Carrega as configurações de teste do arquivo config.test
 */
export function loadTestConfig(): TestConfig {
  if (configCache) {
    return configCache;
  }

  const configPath = path.join(__dirname, '../config.test');
  
  if (!fs.existsSync(configPath)) {
    throw new Error(
      `❌ Arquivo de configuração de teste não encontrado: ${configPath}\n` +
      `💡 Copie o arquivo tests/config.test.example para tests/config.test e preencha com os valores reais.`
    );
  }

  const configContent = fs.readFileSync(configPath, 'utf-8');
  
  // Parse simples do arquivo de configuração
  const config: TestConfig = {
    actualUser: '',
    secondUser: '',
    adminUser: '',
    temporaryLink: '',
    temporarySecondUserLink: '',
    baseUrl: '',
    devUrl: 'http://localhost:3000',
    environment: 'production',
    websiteUrl: '',
    users: {},
    notificationCategory: undefined,
    analysisCategory: undefined,
  };

  configContent.split('\n').forEach((line) => {
    const trimmedLine = line.trim();
    
    // Ignorar comentários e linhas vazias
    if (trimmedLine.startsWith('#') || trimmedLine === '') {
      return;
    }

    const [key, ...valueParts] = trimmedLine.split('=');
    const keyTrimmed = key.trim();
    const value = valueParts.join('=').trim();

    // Configurações globais
    if (keyTrimmed === 'ACTUAL_TEST_USER') {
      config.actualUser = value;
    } else if (keyTrimmed === 'ACTUAL_TEST_SECOND_USER') {
      config.secondUser = value;
    } else if (keyTrimmed === 'TEST_ADMIN_USER') {
      config.adminUser = value;
    } else if (keyTrimmed === 'TEMPORARY_LINK') {
      config.temporaryLink = value;
    } else if (keyTrimmed === 'TEMPORARY_SECOND_USER_LINK') {
      config.temporarySecondUserLink = value;
    } else if (keyTrimmed === 'TEST_BASE_URL') {
      config.baseUrl = value;
    } else if (keyTrimmed === 'TEST_DEV_URL') {
      config.devUrl = value;
    } else if (keyTrimmed === 'TEST_ENVIRONMENT') {
      config.environment = value;
    } else if (keyTrimmed === 'WEBSITE_URL') {
      config.websiteUrl = value;
    }
    // Configurações de notificações
    else if (keyTrimmed === 'NOTIFICATION_CATEGORY_DISPLAY_NAME') {
      if (!config.notificationCategory) {
        config.notificationCategory = { displayName: '', description: '', subject: '', body: '' };
      }
      config.notificationCategory.displayName = value;
    } else if (keyTrimmed === 'NOTIFICATION_CATEGORY_DESCRIPTION') {
      if (!config.notificationCategory) {
        config.notificationCategory = { displayName: '', description: '', subject: '', body: '' };
      }
      config.notificationCategory.description = value;
    } else if (keyTrimmed === 'NOTIFICATION_CATEGORY_SUBJECT') {
      if (!config.notificationCategory) {
        config.notificationCategory = { displayName: '', description: '', subject: '', body: '' };
      }
      config.notificationCategory.subject = value;
    } else if (keyTrimmed === 'NOTIFICATION_CATEGORY_BODY') {
      if (!config.notificationCategory) {
        config.notificationCategory = { displayName: '', description: '', subject: '', body: '' };
      }
      config.notificationCategory.body = value;
    }
    // Configurações de categoria de análises
    else if (keyTrimmed === 'ANALYSIS_CATEGORY_DISPLAY_NAME') {
      if (!config.analysisCategory) {
        config.analysisCategory = { displayName: '', description: '', subject: '', body: '' };
      }
      config.analysisCategory.displayName = value;
    } else if (keyTrimmed === 'ANALYSIS_CATEGORY_DESCRIPTION') {
      if (!config.analysisCategory) {
        config.analysisCategory = { displayName: '', description: '', subject: '', body: '' };
      }
      config.analysisCategory.description = value;
    } else if (keyTrimmed === 'ANALYSIS_CATEGORY_SUBJECT') {
      if (!config.analysisCategory) {
        config.analysisCategory = { displayName: '', description: '', subject: '', body: '' };
      }
      config.analysisCategory.subject = value;
    } else if (keyTrimmed === 'ANALYSIS_CATEGORY_BODY') {
      if (!config.analysisCategory) {
        config.analysisCategory = { displayName: '', description: '', subject: '', body: '' };
      }
      config.analysisCategory.body = value;
    }
    // Configurações de usuários
    else if (keyTrimmed.startsWith('TEST_USER_')) {
      const parts = keyTrimmed.split('_');
      const userId = parts[2]; // TEST_USER_01_EMAIL -> 01
      const field = parts[3]; // TEST_USER_01_EMAIL -> EMAIL

      if (!config.users[userId]) {
        config.users[userId] = {
          id: userId,
          email: '',
          currentPassword: '',
          nextPassword: '',
        };
      }

      switch (field) {
        case 'EMAIL':
          config.users[userId].email = value;
          break;
        case 'CURRENT':
          config.users[userId].currentPassword = value;
          break;
        case 'NEXT':
          config.users[userId].nextPassword = value;
          break;
      }
    }
  });

  // Validações
  if (!config.actualUser || !config.baseUrl || Object.keys(config.users).length === 0) {
    throw new Error(
      '❌ Configurações de teste incompletas. Verifique o arquivo config.test'
    );
  }

  configCache = config;
  return config;
}

/**
 * Recarrega as configurações (útil para testes que atualizam a confirmação link)
 */
export function reloadTestConfig(): TestConfig {
  configCache = null;
  return loadTestConfig();
}

/**
 * Retorna o usuário atual configurado
 */
export function getActualUser(): TestUser {
  const config = loadTestConfig();
  const user = config.users[config.actualUser];
  
  if (!user) {
    throw new Error(
      `❌ Usuário atual não encontrado: ${config.actualUser}\n` +
      `💡 Verifique se ACTUAL_TEST_USER está configurado corretamente no config.test`
    );
  }
  
  return user;
}

/**
 * Retorna o usuário administrador configurado
 */
export function getAdminUser(): TestUser | null {
  const config = loadTestConfig();
  
  if (!config.adminUser) {
    return null;
  }
  
  const user = config.users[config.adminUser];
  return user || null;
}

/**
 * Retorna o usuário secundário configurado
 */
export function getSecondUser(): TestUser | null {
  const config = loadTestConfig();
  
  if (!config.secondUser) {
    return null;
  }
  
  const user = config.users[config.secondUser];
  return user || null;
}

/**
 * Retorna um usuário específico por ID
 */
export function getUser(userId: string): TestUser | null {
  const config = loadTestConfig();
  return config.users[userId] || null;
}

/**
 * Retorna as configurações de categoria de notificação
 */
export function getNotificationCategoryConfig(): NotificationCategoryConfig | null {
  const config = loadTestConfig();
  return config.notificationCategory || null;
}

/**
 * Retorna as configurações de categoria de notificação para análises
 */
export function getAnalysisCategoryConfig(): AnalysisCategoryConfig | null {
  const config = loadTestConfig();
  return config.analysisCategory || null;
}

/**
 * Retorna a URL do website público
 */
export function getWebsiteUrl(): string {
  const config = loadTestConfig();
  return config.websiteUrl || 'https://goalmoon.com';
}

/**
 * Retorna a URL base para testes baseada no ambiente configurado
 * @param environment - Ambiente opcional ('development' ou 'production'). Se não fornecido, usa TEST_ENVIRONMENT do config
 */
export function getTestBaseUrl(environment?: string): string {
  const config = loadTestConfig();
  const env = environment || config.environment || 'production';
  
  if (env === 'development') {
    return config.devUrl || 'http://localhost:3000';
  }
  
  return config.baseUrl;
}

