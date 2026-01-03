const { execSync } = require('child_process');
const path = require('path');

/**
 * Função para copiar texto para o clipboard no Windows usando PowerShell com UTF-8
 */
function copyToClipboard(text) {
  try {
    // Usar arquivo temporário e PowerShell com encoding UTF-8 explícito
    const fs = require('fs');
    const os = require('os');
    const tempFile = path.join(os.tmpdir(), `clipboard_${Date.now()}.txt`);
    
    // Escrever texto no arquivo temporário com encoding UTF-8
    fs.writeFileSync(tempFile, text, { encoding: 'utf8' });
    
    // Usar PowerShell com encoding UTF-8 explícito
    // Escapar o caminho corretamente para PowerShell
    const escapedPath = tempFile.replace(/\\/g, '/');
    
    // Comando PowerShell que lê o arquivo com UTF-8 e copia para clipboard
    const command = `powershell -NoProfile -Command "$PSDefaultParameterValues['*:Encoding']='utf8'; [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; $content = Get-Content -Path '${escapedPath}' -Raw -Encoding UTF8; Set-Clipboard -Value $content"`;
    
    execSync(command, { 
      stdio: 'ignore', 
      encoding: 'utf8'
    });
    
    // Limpar arquivo temporário
    try {
      fs.unlinkSync(tempFile);
    } catch (e) {
      // Ignorar erro ao deletar arquivo temporário
    }
    
    return true;
  } catch (error) {
    console.error(`Erro ao copiar para clipboard: ${error.message}`);
    return false;
  }
}

/**
 * Gera um número aleatório entre min e max (inclusive)
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Gera uma string aleatória
 */
function randomString(length = 8) {
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
function randomEmail() {
  const domains = ['example.com', 'test.com', 'goalmoon.com', 'sicoop.com.br'];
  const domain = domains[randomInt(0, domains.length - 1)];
  const username = `test_${randomString(6)}_${Date.now()}`;
  return `${username}@${domain}`;
}

/**
 * Gera um telefone aleatório no formato brasileiro
 */
function randomPhone() {
  const ddd = randomInt(11, 99);
  const firstPart = randomInt(1000, 9999);
  const secondPart = randomInt(1000, 9999);
  return `(${ddd}) ${firstPart}-${secondPart}`;
}

/**
 * Gera um nome aleatório
 */
function randomName() {
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
function randomCompany() {
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
function randomMessage(counter) {
  const templates = [
    `Esta é uma mensagem de teste automatizado #${counter}. Estamos validando o funcionamento do formulário de contato.`,
    `Teste automatizado número ${counter}. Verificando integração entre website e sistema Sicoop.`,
    `Mensagem de teste #${counter} gerada automaticamente para validação do sistema de notificações.`,
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
 * Lê o contador atual de testes
 */
function readCounter() {
  const fs = require('fs');
  const counterFile = path.join(__dirname, '../.test-counter');
  try {
    if (fs.existsSync(counterFile)) {
      const content = fs.readFileSync(counterFile, 'utf-8').trim();
      return parseInt(content, 10) || 0;
    }
  } catch (error) {
    console.warn('⚠️ Erro ao ler contador de testes:', error.message);
  }
  return 0;
}

/**
 * Incrementa e salva o contador de testes
 */
function incrementCounter() {
  const fs = require('fs');
  const counterFile = path.join(__dirname, '../.test-counter');
  const current = readCounter();
  const next = current + 1;
  try {
    fs.writeFileSync(counterFile, next.toString(), 'utf-8');
  } catch (error) {
    console.warn('⚠️ Erro ao salvar contador de testes:', error.message);
  }
  return next;
}

/**
 * Gera dados únicos para uma mensagem de teste
 */
function generateMessageData() {
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

// Função principal
function main() {
  console.log('🎯 Gerando dados para formulário de mensagem técnica\n');
  
  // Gerar dados
  const messageData = generateMessageData();
  
  console.log('📋 Copiando dados para o clipboard em ordem reversa...\n');
  console.log('⏳ Aguarde enquanto copio cada campo...\n');
  
  // Ordem reversa: Mensagem -> Empresa/Fazenda -> Telefone -> Email -> Nome
  const fields = [
    { label: 'Mensagem', value: messageData.mensagem },
    { label: 'Empresa/Fazenda', value: messageData.empresa_fazenda },
    { label: 'Telefone', value: messageData.telefone },
    { label: 'Email', value: messageData.email },
    { label: 'Nome', value: messageData.nome }
  ];
  
  // Copiar cada campo para o clipboard com pequeno delay
  fields.forEach((field, index) => {
    if (copyToClipboard(field.value)) {
      console.log(`✅ ${index + 1}/5 - ${field.label} copiado para o clipboard`);
      // Pequeno delay entre cópias
      if (index < fields.length - 1) {
        // Usar setTimeout em modo síncrono com execSync não funciona bem
        // Vamos apenas fazer as cópias sequenciais
        try {
          execSync('timeout /t 1 /nobreak >nul 2>&1', { stdio: 'ignore' });
        } catch (e) {
          // Ignorar erro do timeout
        }
      }
    } else {
      console.log(`❌ Erro ao copiar ${field.label}`);
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO DOS DADOS GERADOS');
  console.log('='.repeat(60));
  console.log(`🔢 Contador de Teste: #${messageData.testCounter}`);
  console.log(`📝 Mensagem: ${messageData.mensagem.substring(0, 50)}...`);
  console.log(`🏢 Empresa/Fazenda: ${messageData.empresa_fazenda}`);
  console.log(`📞 Telefone: ${messageData.telefone}`);
  console.log(`📧 Email: ${messageData.email}`);
  console.log(`👤 Nome: ${messageData.nome}`);
  console.log('='.repeat(60));
  console.log('\n✅ Todos os dados foram copiados para o clipboard!');
  console.log('💡 O último item copiado foi: Nome');
  console.log('📋 Agora você pode colar os dados no formulário usando CTRL+V\n');
}

// Executar
main();

