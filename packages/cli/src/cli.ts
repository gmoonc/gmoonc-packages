import { Command } from 'commander';
import { execSync } from 'child_process';
import { join } from 'path';
import { cwd } from 'process';
import { detectProject, findEntrypoint } from './lib/detect.js';
import { insertCssImport } from './lib/edit.js';
import { writeFileSafe } from './lib/fs.js';
import { CONFIG_TEMPLATE, ADMIN_SHELL_TEMPLATE } from './lib/templates.js';

const program = new Command();

program
  .name('gmoonc')
  .description('CLI do Goalmoon Ctrl (gmoonc): instalador e configurador')
  .version('0.0.1');

program
  .command('add')
  .description('Instala e configura @gmoonc/core e @gmoonc/ui no projeto atual')
  .option('-y, --yes', 'Pula confirmações e instala automaticamente')
  .action(async (options) => {
    try {
      const projectDir = cwd();
      console.log('🔍 Detectando projeto...');

      // 1. Detectar projeto
      const project = detectProject(projectDir);
      console.log(`✓ Gerenciador de pacotes: ${project.packageManager}`);
      console.log(`✓ package.json encontrado`);

      // 2. Encontrar entrypoint
      if (!project.entrypoint) {
        console.error('\n❌ Entrypoint não encontrado.');
        console.error('   Procurando por: src/main.tsx, src/main.jsx, src/main.ts, src/main.js');
        console.error('\n   Você pode adicionar manualmente o import do CSS:');
        console.error('   import "@gmoonc/ui/styles.css";');
        process.exit(1);
      }
      console.log(`✓ Entrypoint encontrado: ${project.entrypoint}`);

      // 3. Instalar dependências
      console.log('\n📦 Instalando dependências...');
      const installCmd = project.packageManager === 'pnpm' 
        ? 'pnpm add @gmoonc/core@^0.0.1 @gmoonc/ui@^0.0.1'
        : project.packageManager === 'yarn'
        ? 'yarn add @gmoonc/core@^0.0.1 @gmoonc/ui@^0.0.1'
        : 'npm install @gmoonc/core@^0.0.1 @gmoonc/ui@^0.0.1';

      try {
        execSync(installCmd, { 
          stdio: 'inherit',
          cwd: projectDir
        });
        console.log('✓ Dependências instaladas');
      } catch (error) {
        console.error('\n❌ Erro ao instalar dependências.');
        console.error('   Tente instalar manualmente:');
        console.error(`   ${installCmd}`);
        process.exit(1);
      }

      // 4. Adicionar import CSS no entrypoint
      console.log('\n📝 Adicionando import do CSS...');
      const entrypointPath = join(projectDir, project.entrypoint);
      const cssResult = insertCssImport(entrypointPath);
      
      if (cssResult.success) {
        if (cssResult.backupPath) {
          console.log(`✓ CSS adicionado (backup criado: ${cssResult.backupPath})`);
        } else {
          console.log('✓ CSS adicionado');
        }
      } else {
        console.log('✓ Import do CSS já existe, pulando...');
      }

      // 5. Criar arquivos
      console.log('\n📁 Criando arquivos...');
      
      const configPath = join(projectDir, 'src/gmoonc/config.ts');
      const configBackup = writeFileSafe(configPath, CONFIG_TEMPLATE);
      if (configBackup) {
        console.log(`✓ config.ts criado (backup: ${configBackup})`);
      } else {
        console.log('✓ config.ts criado');
      }

      const shellPath = join(projectDir, 'src/gmoonc/AdminShell.tsx');
      const shellBackup = writeFileSafe(shellPath, ADMIN_SHELL_TEMPLATE);
      if (shellBackup) {
        console.log(`✓ AdminShell.tsx criado (backup: ${shellBackup})`);
      } else {
        console.log('✓ AdminShell.tsx criado');
      }

      // 6. Mensagem final
      console.log('\n✅ Instalação concluída!');
      console.log(`\n📄 CSS adicionado em: ${project.entrypoint}`);
      console.log('📄 Arquivos criados:');
      console.log('   - src/gmoonc/config.ts');
      console.log('   - src/gmoonc/AdminShell.tsx');
      console.log('\n📌 Próximo passo:');
      console.log('   Importe e use o AdminShell em alguma página/rota do seu app:');
      console.log('   import { AdminShell } from "./gmoonc/AdminShell";');
      console.log('\n   <AdminShell>');
      console.log('     <div>Seu conteúdo aqui</div>');
      console.log('   </AdminShell>');

    } catch (error: any) {
      console.error('\n❌ Erro:', error.message);
      if (error.stack && process.env.DEBUG) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

program.parse();
