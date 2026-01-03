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
 * Gera uma observação aleatória com contador de testes
 */
function randomObservacao(counter) {
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
 * Gera uma área aleatória em hectares
 */
function randomArea() {
  return randomInt(10, 5000); // Entre 10 e 5000 hectares
}

/**
 * Gera uma coordenada de latitude aleatória (Brasil)
 */
function randomLatitude() {
  // Latitude do Brasil: aproximadamente -33 a 5
  return parseFloat((randomInt(-3300, 500) / 100).toFixed(6));
}

/**
 * Gera uma coordenada de longitude aleatória (Brasil)
 */
function randomLongitude() {
  // Longitude do Brasil: aproximadamente -73 a -34
  return parseFloat((randomInt(-7300, -3400) / 100).toFixed(6));
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
 * Gera dados únicos para uma análise de teste
 */
function generateAnalysisData() {
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

// Função principal
function main() {
  console.log('🎯 Gerando dados para formulário de análise técnica\n');
  
  // Gerar dados
  const analysisData = generateAnalysisData();
  
  console.log('📋 Copiando dados para o clipboard em ordem reversa...\n');
  console.log('⏳ Aguarde enquanto copio cada campo...\n');
  
  // Ordem reversa: Observações -> Longitude -> Latitude -> Área -> Fazenda -> Telefone -> Email -> Nome
  const fields = [
    { label: 'Observações', value: analysisData.observacoes },
    { label: 'Longitude', value: analysisData.longitude.toString() },
    { label: 'Latitude', value: analysisData.latitude.toString() },
    { label: 'Área (ha)', value: analysisData.area_fazenda_ha.toString() },
    { label: 'Nome da Fazenda', value: analysisData.nome_fazenda },
    { label: 'Telefone', value: analysisData.telefone },
    { label: 'Email', value: analysisData.email },
    { label: 'Nome', value: analysisData.nome }
  ];
  
  // Copiar cada campo para o clipboard com pequeno delay
  fields.forEach((field, index) => {
    if (copyToClipboard(field.value)) {
      console.log(`✅ ${index + 1}/${fields.length} - ${field.label} copiado para o clipboard`);
      // Pequeno delay entre cópias
      if (index < fields.length - 1) {
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
  console.log(`🔢 Contador de Teste: #${analysisData.testCounter}`);
  console.log(`👤 Nome: ${analysisData.nome}`);
  console.log(`📧 Email: ${analysisData.email}`);
  console.log(`📞 Telefone: ${analysisData.telefone}`);
  console.log(`🏢 Fazenda: ${analysisData.nome_fazenda}`);
  console.log(`📐 Área: ${analysisData.area_fazenda_ha} hectares`);
  console.log(`📍 Coordenadas: ${analysisData.latitude}, ${analysisData.longitude}`);
  console.log(`📝 Observações: ${analysisData.observacoes.substring(0, 50)}...`);
  console.log('='.repeat(60));
  console.log('\n✅ Todos os dados foram copiados para o clipboard!');
  console.log('💡 O último item copiado foi: Nome');
  console.log('📋 Agora você pode colar os dados no formulário usando CTRL+V\n');
}

// Executar
main();

