import { join, dirname } from 'path';
import { existsSync } from 'fs';
import { copyDirectoryRecursive, ensureDirectoryExists, writeFileSafe } from './fs.js';
import { logSuccess, logInfo } from './logger.js';

/**
 * Get the path to the templates directory
 * Templates are always at package root: src/templates
 * This function works in both ESM and CJS contexts
 */
export function getTemplatesDir(): string {
  // In CJS build, __dirname is available
  // In ESM, we need to calculate it differently, but tsup will inject __dirname for CJS
  // For now, use a simple approach: templates are always relative to the package root
  // When the CLI runs, it's in dist/cli/lib, so we go up to package root
  
  // Try to find templates relative to common locations
  // When installed: node_modules/gmoonc/dist/cli/lib -> ../../../src/templates
  // When in dev: packages/gmoonc/dist/cli/lib -> ../../../src/templates
  // When in dev (src): packages/gmoonc/src/cli/lib -> ../../templates
  
  // Use process.cwd() as fallback and navigate from there
  // In production, the package is installed, so we need to find the package root
  const possiblePaths = [
    join(process.cwd(), 'node_modules/gmoonc/src/templates'),
    join(process.cwd(), 'packages/gmoonc/src/templates'),
    join(__dirname, '../../../src/templates'), // From dist/cli/lib
    join(__dirname, '../../templates') // From src/cli/lib (dev)
  ];
  
  for (const path of possiblePaths) {
    if (existsSync(path)) {
      return path;
    }
  }
  
  // Last resort: assume we're in the package and go up
  return join(__dirname, '../../templates');
}

/**
 * Copy shared templates to consumer project
 */
export function copySharedTemplates(
  consumerDir: string,
  templatesDir: string,
  dryRun: boolean
): { success: boolean } {
  const sharedTemplatesDir = join(templatesDir, 'shared/src/gmoonc');
  const destDir = join(consumerDir, 'src/gmoonc');

  if (dryRun) {
    logInfo(`[DRY RUN] Would copy templates from ${sharedTemplatesDir} to ${destDir}`);
    return { success: true };
  }

  logInfo('Copying dashboard templates...');
  copyDirectoryRecursive(sharedTemplatesDir, destDir);
  logSuccess('Templates copied to src/gmoonc/');
  
  return { success: true };
}

/**
 * Copy Vite-specific router templates
 */
export function copyViteRouterTemplates(
  consumerDir: string,
  templatesDir: string,
  dryRun: boolean
): { success: boolean } {
  const viteTemplatesDir = join(templatesDir, 'vite/src/gmoonc/router');
  const destDir = join(consumerDir, 'src/gmoonc/router');

  if (dryRun) {
    logInfo(`[DRY RUN] Would copy router templates from ${viteTemplatesDir} to ${destDir}`);
    return { success: true };
  }

  logInfo('Copying router templates...');
  copyDirectoryRecursive(viteTemplatesDir, destDir);
  logSuccess('Router templates copied');
  
  return { success: true };
}
