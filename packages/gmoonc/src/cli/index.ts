import { Command } from 'commander';
import { cwd } from 'process';
import { join } from 'path';
import { detectProject } from './lib/detect.js';
import { installDependencies } from './lib/installDeps.js';
import { copySharedTemplates, copyViteRouterTemplates, getTemplatesDir } from './lib/templates.js';
import { patchEntryCss } from './lib/patchEntryCss.js';
import { patchBrowserRouter } from './lib/patchBrowserRouter.js';
import { logInfo, logSuccess, logError, logWarning } from './lib/logger.js';

const program = new Command();

program
  .name('gmoonc')
  .description('Goalmoon Ctrl (gmoonc): Install complete dashboard into your React project')
  .version('0.0.5')
  .option('-y, --yes, --auto', 'Skip confirmations and install automatically')
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
      
      // Handle yes/auto flag (all three variants: -y, --yes, --auto)
      const autoInstall = options.yes || options.auto || false;

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

program.parse();
