import * as fs from 'fs';
import * as path from 'path';

/**
 * Gerador de dados randômicos para testes
 */

const COUNTER_FILE = path.join(__dirname, '../.test-counter');

/**
 * Lê o contador atual de testes
 */
function readCounter(): number {
  try {
    if (fs.existsSync(COUNTER_FILE)) {
      const content = fs.readFileSync(COUNTER_FILE, 'utf-8').trim();
      return parseInt(content, 10) || 0;
    }
  } catch (error) {
    console.warn('⚠️ Erro ao ler contador de testes:', error);
  }
  return 0;
}

/**
 * Incrementa e salva o contador de testes
 */
function incrementCounter(): number {
  const current = readCounter();
  const next = current + 1;
  try {
    fs.writeFileSync(COUNTER_FILE, next.toString(), 'utf-8');
  } catch (error) {
    console.warn('⚠️ Erro ao salvar contador de testes:', error);
  }
  return next;
}

/**
 * Gera um número aleatório entre min e max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Gera uma string aleatória
 */
function randomString(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Gera um email aleatório
 */
function randomEmail(): string {
  const domains = ['example.com', 'test.com', 'goalmoon.com', 'sicoop.com.br'];
  const domain = domains[randomInt(0, domains.length - 1)];
  const username = `test_${randomString(6)}_${Date.now()}`;
  return `${username}@${domain}`;
}

/**
 * Gera um telefone aleatório no formato brasileiro
 */
function randomPhone(): string {
  const ddd = randomInt(11, 99);
  const firstPart = randomInt(1000, 9999);
  const secondPart = randomInt(1000, 9999);
  return `(${ddd}) ${firstPart}-${secondPart}`;
}

/**
 * Gera um nome aleatório
 */
function randomName(): string {
  const firstNames = [
    'João', 'Maria', 'José', 'Ana', 'Carlos', 'Fernanda', 'Pedro', 'Juliana',
    'Paulo', 'Mariana', 'Lucas', 'Camila', 'Ricardo', 'Patricia', 'Roberto', 'Amanda',
    'Marcos', 'Beatriz', 'Felipe', 'Larissa', 'Rafael', 'Gabriela', 'Thiago', 'Isabela'
  ];
  const lastNames = [
    'Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Costa', 'Rodrigues', 'Almeida',
    'Nascimento', 'Lima', 'Araújo', 'Fernandes', 'Carvalho', 'Gomes', 'Martins', 'Rocha',
    'Ribeiro', 'Alves', 'Monteiro', 'Mendes', 'Barros', 'Freitas', 'Cardoso', 'Dias'
  ];
  const firstName = firstNames[randomInt(0, firstNames.length - 1)];
  const lastName = lastNames[randomInt(0, lastNames.length - 1)];
  return `${firstName} ${lastName}`;
}

/**
 * Gera um nome de empresa/fazenda aleatório
 */
function randomCompany(): string {
  const prefixes = ['Fazenda', 'Empresa', 'Agro', 'Rural', 'Campo'];
  const names = [
    'Verde', 'Nova', 'Santa', 'São', 'Bela', 'Grande', 'Pequena', 'Central',
    'Sul', 'Norte', 'Leste', 'Oeste', 'Alta', 'Baixa', 'Serra', 'Vale'
  ];
  const suffixes = [
    'Agrícola', 'Pecuária', 'Ltda', 'EIRELI', 'S.A.', 'Agronegócios', 'Rural'
  ];
  
  const prefix = prefixes[randomInt(0, prefixes.length - 1)];
  const name = names[randomInt(0, names.length - 1)];
  const suffix = randomInt(0, 1) === 0 ? '' : ` ${suffixes[randomInt(0, suffixes.length - 1)]}`;
  
  return `${prefix} ${name}${suffix}`;
}

/**
 * Gera uma mensagem aleatória com contador de testes
 */
function randomMessage(counter: number): string {
  const templates = [
    `Esta é uma mensagem de teste automatizado #${counter}. Estamos validando o funcionamento do formulário de contato.`,
    `Teste automatizado número ${counter}. Verificando integração entre website e sistema Sicoop.`,
    `Mensagem de teste #${counter} gerada automaticamente pelo Playwright para validação do sistema de notificações.`,
    `Teste ${counter}: Validando criação de mensagem através do formulário do website público.`,
    `Esta é a mensagem de teste número ${counter}. Sistema de testes automatizados em execução.`
  ];
  
  const template = templates[randomInt(0, templates.length - 1)];
  const additionalText = [
    '\n\nAgradecemos pela atenção.',
    '\n\nAguardamos retorno.',
    '\n\nPor favor, entre em contato.',
    '\n\nObrigado!',
    ''
  ];
  
  return template + additionalText[randomInt(0, additionalText.length - 1)];
}

/**
 * Interface para dados de mensagem gerados
 */
export interface GeneratedMessageData {
  nome: string;
  email: string;
  telefone: string;
  empresa_fazenda: string;
  mensagem: string;
  testCounter: number;
}

/**
 * Gera dados únicos para uma mensagem de teste
 * 
 * Sempre gera dados aleatórios únicos para garantir que cada execução do teste use dados diferentes.
 */
export function generateMessageData(): GeneratedMessageData {
  const counter = incrementCounter();
  
  return {
    nome: randomName(),
    email: randomEmail(),
    telefone: randomPhone(),
    empresa_fazenda: randomCompany(),
    mensagem: randomMessage(counter),
    testCounter: counter,
  };
}

/**
 * Gera uma observação aleatória para análise com contador de testes
 */
function randomObservacao(counter: number): string {
  const templates = [
    `Esta é uma solicitação de análise de cobertura de teste automatizado #${counter}. Estamos validando o funcionamento do formulário de análise.`,
    `Teste automatizado número ${counter}. Verificando integração entre website e sistema Sicoop para análises de cobertura.`,
    `Solicitação de análise de teste #${counter} gerada automaticamente para validação do sistema de notificações.`,
    `Teste ${counter}: Validando criação de análise através do formulário do website público.`,
    `Esta é a solicitação de análise número ${counter}. Sistema de testes automatizados em execução.`
  ];
  
  const template = templates[randomInt(0, templates.length - 1)];
  const additionalText = [
    '\n\nAgradecemos pela atenção.',
    '\n\nAguardamos retorno.',
    '\n\nPor favor, entre em contato.',
    '\n\nObrigado!',
    ''
  ];
  
  return template + additionalText[randomInt(0, additionalText.length - 1)];
}

/**
 * Gera uma área de fazenda aleatória em hectares
 */
function randomArea(): number {
  return randomInt(10, 5000); // Entre 10 e 5000 hectares
}

/**
 * Gera uma coordenada de latitude aleatória (Brasil)
 */
function randomLatitude(): number {
  // Latitude do Brasil: aproximadamente -33 a 5
  return parseFloat((randomInt(-3300, 500) / 100).toFixed(6));
}

/**
 * Gera uma coordenada de longitude aleatória (Brasil)
 */
function randomLongitude(): number {
  // Longitude do Brasil: aproximadamente -73 a -34
  return parseFloat((randomInt(-7300, -3400) / 100).toFixed(6));
}

/**
 * Interface para dados de análise gerados
 */
export interface GeneratedAnalysisData {
  nome: string;
  email: string;
  telefone: string;
  nome_fazenda: string;
  area_fazenda_ha: number;
  latitude: number;
  longitude: number;
  observacoes: string;
  testCounter: number;
}

/**
 * Gera dados únicos para uma análise de teste
 * 
 * Sempre gera dados aleatórios únicos para garantir que cada execução do teste use dados diferentes.
 */
export function generateAnalysisData(): GeneratedAnalysisData {
  const counter = incrementCounter();
  
  return {
    nome: randomName(),
    email: randomEmail(),
    telefone: randomPhone(),
    nome_fazenda: randomCompany(),
    area_fazenda_ha: randomArea(),
    latitude: randomLatitude(),
    longitude: randomLongitude(),
    observacoes: randomObservacao(counter),
    testCounter: counter,
  };
}

/**
 * Retorna o contador atual sem incrementar
 */
export function getCurrentCounter(): number {
  return readCounter();
}

/**
 * Reseta o contador (útil para testes)
 */
export function resetCounter(): void {
  try {
    if (fs.existsSync(COUNTER_FILE)) {
      fs.unlinkSync(COUNTER_FILE);
    }
  } catch (error) {
    console.warn('⚠️ Erro ao resetar contador:', error);
  }
}

