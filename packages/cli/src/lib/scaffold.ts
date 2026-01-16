import { execSync } from 'child_process';
import { join } from 'path';
import { cwd } from 'process';
import { detectProject } from './detect.js';
import { writeFileSafe, ensureDirectoryExists } from './fs.js';
import { insertCssImport } from './edit.js';
import { detectRouterStrategy, patchCreateBrowserRouter, patchBrowserRouter } from './routerPatch.js';
import {
  CONFIG_TEMPLATE_SCAFFOLD,
  APP_LAYOUT_TEMPLATE,
  ROUTES_TEMPLATE,
  AUTH_PAGES_TEMPLATES,
  APP_PAGES_TEMPLATES
} from './templates.js';

export async function runScaffold(basePath: string = '/app', yes: boolean = false) {
  const projectDir = cwd();
  
  try {
    console.log('🚀 Starting gmoonc scaffold...\n');

    // 1. Run add command first (install dependencies, add CSS, create basic files)
    console.log('📦 Step 1: Running add command...');
    const project = detectProject(projectDir);
    
    if (!project.entrypoint) {
      console.error('\n❌ Entrypoint não encontrado.');
      console.error('   Procurando por: src/main.tsx, src/main.jsx, src/main.ts, src/main.js');
      process.exit(1);
    }

    // Install dependencies
    const installCmd = project.packageManager === 'pnpm' 
      ? 'pnpm add @gmoonc/core@^0.0.1 @gmoonc/ui@^0.0.1 react-router-dom'
      : project.packageManager === 'yarn'
      ? 'yarn add @gmoonc/core@^0.0.1 @gmoonc/ui@^0.0.1 react-router-dom'
      : 'npm install @gmoonc/core@^0.0.1 @gmoonc/ui@^0.0.1 react-router-dom';

    try {
      execSync(installCmd, { 
        stdio: 'inherit',
        cwd: projectDir
      });
      console.log('✓ Dependencies installed\n');
    } catch (error) {
      console.error('\n❌ Error installing dependencies.');
      process.exit(1);
    }

    // Add CSS import
    const entrypointPath = join(projectDir, project.entrypoint);
    const cssResult = insertCssImport(entrypointPath);
    if (cssResult.success) {
      console.log('✓ CSS import added\n');
    } else {
      console.log('✓ CSS import already exists\n');
    }

    // 2. Create config.ts with full menu
    console.log('📝 Step 2: Creating configuration...');
    const configPath = join(projectDir, 'src/gmoonc/config.ts');
    const configBackup = writeFileSafe(configPath, CONFIG_TEMPLATE_SCAFFOLD);
    if (configBackup) {
      console.log(`✓ config.ts created (backup: ${configBackup})`);
    } else {
      console.log('✓ config.ts created');
    }

    // 3. Create AppLayout
    console.log('\n📁 Step 3: Creating layout component...');
    const layoutPath = join(projectDir, 'src/gmoonc/GMooncAppLayout.tsx');
    const layoutBackup = writeFileSafe(layoutPath, APP_LAYOUT_TEMPLATE);
    if (layoutBackup) {
      console.log(`✓ GMooncAppLayout.tsx created (backup: ${layoutBackup})`);
    } else {
      console.log('✓ GMooncAppLayout.tsx created');
    }

    // 4. Create routes.tsx
    console.log('\n🛣️  Step 4: Creating routes...');
    const routesPath = join(projectDir, 'src/gmoonc/routes.tsx');
    const routesContent = ROUTES_TEMPLATE.replace('{{BASE_PATH}}', basePath);
    const routesBackup = writeFileSafe(routesPath, routesContent);
    if (routesBackup) {
      console.log(`✓ routes.tsx created (backup: ${routesBackup})`);
    } else {
      console.log('✓ routes.tsx created');
    }

    // 5. Create auth pages
    console.log('\n🔐 Step 5: Creating auth pages...');
    const authDir = join(projectDir, 'src/gmoonc/pages/auth');
    ensureDirectoryExists(authDir);
    
    for (const [filename, template] of Object.entries(AUTH_PAGES_TEMPLATES)) {
      const filePath = join(authDir, filename);
      const backup = writeFileSafe(filePath, template);
      if (backup) {
        console.log(`  ✓ ${filename} (backup: ${backup})`);
      } else {
        console.log(`  ✓ ${filename}`);
      }
    }

    // 6. Create app pages
    console.log('\n📄 Step 6: Creating app pages...');
    const appDir = join(projectDir, 'src/gmoonc/pages/app');
    ensureDirectoryExists(appDir);
    
    for (const [subdir, pages] of Object.entries(APP_PAGES_TEMPLATES)) {
      const subdirPath = join(appDir, subdir);
      ensureDirectoryExists(join(subdirPath, 'dummy'));
      
      for (const [filename, template] of Object.entries(pages)) {
        const filePath = join(subdirPath, filename);
        const backup = writeFileSafe(filePath, template);
        if (backup) {
          console.log(`  ✓ ${subdir}/${filename} (backup: ${backup})`);
        } else {
          console.log(`  ✓ ${subdir}/${filename}`);
        }
      }
    }

    // 7. Patch router
    console.log('\n🔧 Step 7: Integrating with router...');
    const strategy = detectRouterStrategy(projectDir, project.entrypoint);
    console.log(`  Detected strategy: ${strategy}`);

    let patchResult;
    if (strategy === 'createBrowserRouter') {
      patchResult = patchCreateBrowserRouter(projectDir, project.entrypoint, basePath);
    } else if (strategy === 'BrowserRouter') {
      patchResult = patchBrowserRouter(projectDir, basePath);
    } else {
      patchResult = {
        strategy: 'fallback',
        success: false,
        backupPath: null,
        message: 'No router pattern detected'
      };
    }

    if (patchResult.success) {
      if (patchResult.backupPath) {
        console.log(`✓ Router integrated (backup: ${patchResult.backupPath})`);
      } else {
        console.log('✓ Router integrated');
      }
    } else {
      console.log('⚠️  Could not auto-integrate router');
      if (patchResult.message) {
        console.log(`   ${patchResult.message}`);
      }
      console.log('\n📌 Manual integration required:');
      console.log(`   Import createGmooncRoutes("${basePath}") into your router.`);
    }

    // 8. Final message
    console.log('\n✅ Scaffold completed!\n');
    console.log('📌 Next steps:');
    console.log(`   1. Open ${basePath} to see the dashboard`);
    console.log('   2. Open /login to see the login page');
    console.log('   3. Customize pages in src/gmoonc/pages/');
    console.log('   4. Update menu in src/gmoonc/config.ts');
    console.log('\n💡 Note: scaffold is transitional. Next step will be powered by @gmoonc/app.\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.stack && process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}
