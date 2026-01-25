import { Command } from 'commander';
import { cwd } from 'process';
import { join } from 'path';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import { detectProject } from './lib/detect.js';
import { installDependencies } from './lib/installDeps.js';
import { copySharedTemplates, copyViteRouterTemplates, getTemplatesDir } from './lib/templates.js';
import { patchEntryCss } from './lib/patchEntryCss.js';
import { patchBrowserRouter } from './lib/patchBrowserRouter.js';
import { logInfo, logSuccess, logError, logWarning } from './lib/logger.js';
import { ensureDirectoryExists } from './lib/fs.js';
import { setupSupabase } from './lib/supabaseSetup.js';
import { seedSupabase } from './lib/supabaseSeedVite.js';

const program = new Command();

program
  .name('gmoonc')
  .description('Goalmoon Ctrl (gmoonc): Install complete dashboard into your React project')
  .version('0.0.24')
  .option('--base <path>', 'Base path for dashboard routes', '/app')
  .option('--skip-router-patch', 'Skip automatic router integration (only copy files and inject CSS)')
  .option('--dry-run', 'Show what would be done without making changes')
  .action(async (options) => {
    try {
      // Always log start to avoid silent failures
      logInfo('🚀 Starting gmoonc installer...');
      logInfo('📦 Installing complete dashboard into your React project\n');
      
      const projectDir = cwd();
      const basePath = options.base || '/app';
      const dryRun = options.dryRun || false;
      const skipRouterPatch = options.skipRouterPatch || false;

      // Check if already installed
      const gmooncDir = join(projectDir, 'src/gmoonc');
      const markerFile = join(gmooncDir, '.gmoonc-installed.json');
      
      if (existsSync(gmooncDir) || existsSync(markerFile)) {
        logError('gmoonc already installed (src/gmoonc exists or marker file found).');
        logError('Remove src/gmoonc and restore backups to reinstall.');
        process.exit(1);
      }

      // Ensure basePath is not "/"
      const safeBasePath = basePath === '/' ? '/app' : basePath;

      logInfo('🔍 Detecting React project...');

      // Detect project
      const project = detectProject(projectDir);
      logSuccess(`Package manager: ${project.packageManager}`);
      logSuccess('package.json found');

      if (!project.entrypoint) {
        logError('Entrypoint not found.');
        logError('Looking for: src/main.tsx, src/main.jsx, src/main.ts, src/main.js');
        process.exit(1);
      }
      logSuccess(`Entrypoint found: ${project.entrypoint}`);

      if (!skipRouterPatch && !project.routerFile) {
        logWarning('Router file not found or BrowserRouter pattern not detected.');
        logWarning('Router patch will be skipped. You can integrate manually later.');
      } else if (!skipRouterPatch) {
        logSuccess(`Router file found: ${project.routerFile}`);
      }

      // Get templates directory
      const templatesDir = getTemplatesDir();
      logInfo(`Templates directory: ${templatesDir}`);

      // Install dependencies
      logInfo('\n📦 Installing dependencies...');
      const depsResult = installDependencies(project, templatesDir, dryRun);
      if (!depsResult.success && !dryRun) {
        process.exit(1);
      }

      // Copy templates
      logInfo('\n📋 Copying dashboard templates...');
      const sharedResult = copySharedTemplates(projectDir, templatesDir, dryRun);
      if (!sharedResult.success) {
        logError('Failed to copy shared templates');
        process.exit(1);
      }

      const routerResult = copyViteRouterTemplates(projectDir, templatesDir, dryRun);
      if (!routerResult.success) {
        logError('Failed to copy router templates');
        process.exit(1);
      }

      // Inject CSS
      logInfo('\n📝 Injecting CSS imports...');
      const entrypointPath = join(projectDir, project.entrypoint);
      const cssResult = patchEntryCss(entrypointPath, dryRun);
      if (!cssResult.success && !dryRun) {
        logError('Failed to inject CSS');
        process.exit(1);
      }

      // Patch router
      if (!skipRouterPatch && project.routerFile) {
        logInfo('\n🔧 Patching router...');
        const routerPatchResult = patchBrowserRouter(projectDir, safeBasePath, dryRun);
        if (!routerPatchResult.success && !dryRun) {
          logWarning(`Router patch failed: ${routerPatchResult.message}`);
          logWarning('You can integrate manually by importing GMooncAppRoutes in your App.tsx');
        } else if (routerPatchResult.success) {
          logSuccess('Router patched successfully');
        }
      } else if (skipRouterPatch) {
        logInfo('\n⏭️  Skipping router patch (--skip-router-patch)');
      } else {
        logInfo('\n⏭️  Skipping router patch (router not detected)');
      }

      // Create marker file to prevent re-installation
      if (!dryRun) {
        ensureDirectoryExists(markerFile);
        // Get version from package.json (relative to project root)
        const packageJsonPath = join(projectDir, 'package.json');
        let version = '0.0.10'; // fallback
        try {
          if (existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
            // Try to get version from gmoonc dependency if installed
            const gmooncVersion = packageJson.dependencies?.gmoonc || packageJson.devDependencies?.gmoonc;
            if (gmooncVersion) {
              version = gmooncVersion.replace(/^[\^~]/, ''); // Remove ^ or ~
            }
          }
        } catch {
          // Use fallback version
        }
        const markerContent = JSON.stringify({
          version,
          installedAt: new Date().toISOString()
        }, null, 2);
        writeFileSync(markerFile, markerContent, 'utf-8');
      }

      logSuccess('\n✅ Installation complete!');
      logInfo('\nYour dashboard is now available at:');
      logInfo(`  - Home: ${safeBasePath}`);
      logInfo(`  - Admin: ${safeBasePath}/admin/*`);
      logInfo(`  - Auth: /login, /register, etc.`);
      logInfo('\nYou can now remove gmoonc from package.json if desired.');
      logInfo('The dashboard code is in src/gmoonc/ and is independent.');

    } catch (error: any) {
      logError(`Error: ${error.message}`);
      if (error.stack && process.env.DEBUG) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Supabase subcommand
program
  .command('supabase')
  .description('Setup Supabase integration (Auth + RBAC)')
  .option('--vite', 'Setup for Vite projects')
  .action(async (options) => {
    try {
      logInfo('🚀 Starting Supabase integration setup...');

      const projectDir = cwd();
      const dryRun = false; // No dry-run for supabase command

      // Validate platform flag
      if (!options.vite) {
        logError('Missing platform flag. Use: gmoonc supabase --vite (Next will be added later).');
        process.exit(1);
      }

      // Detect project
      logInfo('🔍 Detecting React project...');
      const project = detectProject(projectDir);
      logSuccess(`Package manager: ${project.packageManager}`);

      // Setup Supabase
      const result = setupSupabase({
        project,
        projectDir,
        platform: 'vite',
        dryRun
      });

      if (!result.success) {
        process.exit(1);
      }

    } catch (error: any) {
      logError(`Error: ${error.message}`);
      if (error.stack && process.env.DEBUG) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Supabase seed subcommand
program
  .command('supabase-seed')
  .description('Seed Supabase database with schema, RLS, functions, and initial data')
  .option('--vite', 'Seed for Vite projects')
  .action(async (options) => {
    try {
      logInfo('🌱 Starting Supabase database seeding...');

      const projectDir = cwd();
      const dryRun = false; // No dry-run for seed command

      // Validate platform flag
      if (!options.vite) {
        logError('Missing platform flag. Use: gmoonc supabase-seed --vite (Next will be added later).');
        process.exit(1);
      }

      // Seed database
      const result = await seedSupabase({
        projectDir,
        dryRun
      });

      if (!result.success) {
        process.exit(1);
      }

      logSuccess('\n✅ Database seeding complete!');
      logInfo('\nYour Supabase database is now ready with:');
      logInfo('  - Tables (profiles, roles, modules, permissions, etc.)');
      logInfo('  - Functions and triggers');
      logInfo('  - Row Level Security (RLS) policies');
      logInfo('  - Initial seed data (Apollo user)');

    } catch (error: any) {
      logError(`Error: ${error.message}`);
      if (error.stack && process.env.DEBUG) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Supabase add admin subcommand
program
  .command('supabase-add-admin')
  .description('Create or update an admin user in Supabase Auth + RBAC')
  .option('--email <email>', 'Admin email address')
  .option('--vite', 'For Vite projects')
  .action(async (options) => {
    try {
      logInfo('👤 Creating admin user...');

      const projectDir = cwd();

      // Validate platform flag
      if (!options.vite) {
        logError('Missing platform flag. Use: gmoonc supabase-add-admin --email <email> --vite');
        process.exit(1);
      }

      // Get email
      let email = options.email;

      if (!email) {
        // Read email interactively
        const readline = await import('readline');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });

        email = await new Promise<string>((resolve) => {
          rl.question('Qual e-mail do admin? ', (answer) => {
            rl.close();
            resolve(answer.trim());
          });
        });

        if (!email) {
          logError('Email is required');
          process.exit(1);
        }
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        logError('Invalid email format. Please provide a valid email address.');
        process.exit(1);
      }

      // Ensure admin user (with updatePasswordIfExists=true to update password if user exists)
      const { ensureAdminUser, saveAdminCredentials, patchGitignore, printAdminCredentials } = await import('./lib/supabaseAdmin.js');
      
      const result = await ensureAdminUser(projectDir, email, undefined, true);

      if (!result.success) {
        logError(`Failed to create admin user: ${result.error}`);
        process.exit(1);
      }

      if (result.email && result.password) {
        // Save credentials
        saveAdminCredentials(projectDir, result.email, result.password);
        patchGitignore(projectDir);
        printAdminCredentials(result.email, result.password, '/app');
      } else if (result.email && !result.password) {
        // User exists but password wasn't updated (shouldn't happen with updatePasswordIfExists=true, but handle it)
        logWarning('User exists but password was not updated');
      }

    } catch (error: any) {
      logError(`Error: ${error.message}`);
      if (error.stack && process.env.DEBUG) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

program.parse();
