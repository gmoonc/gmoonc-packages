import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { cwd } from 'process';
import { detectProject, findEntrypoint } from './detect.js';
import { insertCssImports } from './edit.js';
import { patchRouter } from './routerPatch.js';

export interface SetupOptions {
  yes: boolean;
  base: string;
  skipRouterPatch: boolean;
  dryRun: boolean;
}

export async function runSetup(options: SetupOptions): Promise<void> {
  const projectDir = cwd();

  console.log('🔍 Detecting React project...');

  // A) Detect project
  const project = detectProject(projectDir);
  console.log(`✓ Package manager: ${project.packageManager}`);
  console.log(`✓ package.json found`);

  if (!project.entrypoint) {
    console.error('\n❌ Entrypoint not found.');
    console.error('   Looking for: src/main.tsx, src/main.jsx, src/main.ts, src/main.js');
    console.error('\n   You can manually add the CSS imports:');
    console.error('   import "@gmoonc/ui/styles.css";');
    console.error('   import "@gmoonc/app/styles.css";');
    process.exit(1);
  }
  console.log(`✓ Entrypoint found: ${project.entrypoint}`);

  // B) Install dependencies
  console.log('\n📦 Installing dependencies...');

  const packagesToInstall: string[] = [];
  
  // Check if @gmoonc/app is already installed
  if (existsSync(project.packageJsonPath)) {
    try {
      const packageJson = JSON.parse(readFileSync(project.packageJsonPath, 'utf-8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      if (!deps['@gmoonc/app']) {
        packagesToInstall.push('@gmoonc/app@^0.0.1');
      }
      
      // Check react-router-dom
      if (!deps['react-router-dom']) {
        packagesToInstall.push('react-router-dom@^6.0.0');
      }
    } catch (error) {
      // If we can't read package.json, try installing anyway
      packagesToInstall.push('@gmoonc/app@^0.0.1');
      packagesToInstall.push('react-router-dom@^6.0.0');
    }
  } else {
    // If package.json doesn't exist, try installing anyway
    packagesToInstall.push('@gmoonc/app@^0.0.1');
    packagesToInstall.push('react-router-dom@^6.0.0');
  }

  if (packagesToInstall.length > 0) {
    const installCmd = project.packageManager === 'pnpm'
      ? `pnpm add ${packagesToInstall.join(' ')}`
      : project.packageManager === 'yarn'
      ? `yarn add ${packagesToInstall.join(' ')}`
      : `npm install ${packagesToInstall.join(' ')}`;

    if (options.dryRun) {
      console.log(`[DRY RUN] Would run: ${installCmd}`);
    } else {
      try {
        execSync(installCmd, {
          stdio: 'inherit',
          cwd: projectDir
        });
        console.log('✓ Dependencies installed');
      } catch (error) {
        console.error('\n❌ Error installing dependencies.');
        console.error('   Try installing manually:');
        console.error(`   ${installCmd}`);
        process.exit(1);
      }
    }
  } else {
    console.log('✓ All required dependencies already installed');
  }

  // C) Inject CSS in entrypoint
  console.log('\n📝 Adding CSS imports...');
  const entrypointPath = join(projectDir, project.entrypoint);
  
  if (options.dryRun) {
    console.log(`[DRY RUN] Would add CSS imports to: ${project.entrypoint}`);
  } else {
    const cssResult = insertCssImports(entrypointPath);
    
    if (cssResult.success) {
      if (cssResult.backupPath) {
        console.log(`✓ CSS imports added (backup created: ${cssResult.backupPath})`);
      } else {
        console.log('✓ CSS imports added');
      }
    } else {
      console.log('✓ CSS imports already exist, skipping...');
    }
  }

  // D) Patch router
  if (!options.skipRouterPatch) {
    console.log('\n🔧 Integrating routes...');
    
    if (options.dryRun) {
      console.log(`[DRY RUN] Would attempt to patch router with basePath: ${options.base}`);
    } else {
      const routerResult = patchRouter(projectDir, project.entrypoint, options.base);
      
      if (routerResult.success) {
        if (routerResult.backupPath) {
          console.log(`✓ Routes integrated (backup created: ${routerResult.backupPath})`);
        } else {
          console.log('✓ Routes integrated');
        }
      } else {
        console.log('\n⚠️  Could not automatically integrate routes.');
        console.log('\n📋 Manual integration required:');
        console.log('\n   1. Import createGmooncRoutes:');
        console.log('      import { createGmooncRoutes } from "@gmoonc/app";');
        console.log('\n   2. Add routes to your router:');
        console.log(`      createBrowserRouter([`);
        console.log(`        ...createGmooncRoutes({ basePath: "${options.base}" }),`);
        console.log(`        // ... your other routes`);
        console.log(`      ])`);
        console.log('\n   3. Make sure CSS imports are present:');
        console.log('      import "@gmoonc/ui/styles.css";');
        console.log('      import "@gmoonc/app/styles.css";');
      }
    }
  } else {
    console.log('\n⚠️  Router patch skipped (--skip-router-patch)');
    console.log('\n📋 Manual integration required:');
    console.log('\n   1. Import createGmooncRoutes:');
    console.log('      import { createGmooncRoutes } from "@gmoonc/app";');
    console.log('\n   2. Add routes to your router:');
    console.log(`      createBrowserRouter([`);
    console.log(`        ...createGmooncRoutes({ basePath: "${options.base}" }),`);
    console.log(`        // ... your other routes`);
    console.log(`      ])`);
  }

  if (!options.dryRun) {
    console.log('\n✅ Setup complete!');
    console.log(`\n📄 CSS imports added to: ${project.entrypoint}`);
    if (!options.skipRouterPatch) {
      console.log('📄 Routes integrated automatically');
    }
  } else {
    console.log('\n✅ [DRY RUN] Setup simulation complete');
  }
}
