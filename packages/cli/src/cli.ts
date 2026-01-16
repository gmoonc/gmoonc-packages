import { Command } from 'commander';
import { runSetup } from './lib/setup.js';

const program = new Command();

program
  .name('gmoonc')
  .description('Goalmoon Ctrl (gmoonc) CLI: install and configure @gmoonc/app in React projects')
  .version('0.0.3')
  .option('-y, --yes', 'Skip confirmations and install automatically')
  .option('--base <path>', 'Base path for dashboard routes', '/app')
  .option('--skip-router-patch', 'Skip automatic router integration (only install and inject CSS)')
  .option('--dry-run', 'Show what would be done without making changes')
  .action(async (options) => {
    try {
      await runSetup({
        yes: options.yes || false,
        base: options.base || '/app',
        skipRouterPatch: options.skipRouterPatch || false,
        dryRun: options.dryRun || false
      });
    } catch (error: any) {
      console.error('\n❌ Error:', error.message);
      if (error.stack && process.env.DEBUG) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

program.parse();
