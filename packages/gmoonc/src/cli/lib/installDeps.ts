import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { ProjectInfo } from './detect.js';
import { logSuccess, logError, logInfo } from './logger.js';

// Dependencies required by the templates
const REQUIRED_DEPS = [
  'react-router-dom@^6.0.0',
  'lucide-react@^0.303.0'
];

export function collectDependenciesFromTemplates(templatesDir: string): string[] {
  // This function would scan template files for imports
  // For MVP, we'll use a fixed list based on what we know the templates need
  // In the future, this could be enhanced to scan files
  return REQUIRED_DEPS;
}

export function installDependencies(
  project: ProjectInfo,
  templatesDir: string,
  dryRun: boolean
): { success: boolean } {
  const projectDir = join(project.packageJsonPath, '..');
  
  // Read package.json to check existing dependencies
  let existingDeps: Record<string, string> = {};
  if (existsSync(project.packageJsonPath)) {
    try {
      const packageJson = JSON.parse(readFileSync(project.packageJsonPath, 'utf-8'));
      existingDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    } catch (error) {
      // If we can't read, assume nothing is installed
    }
  }

  // Collect required dependencies from templates
  const requiredDeps = collectDependenciesFromTemplates(templatesDir);
  
  // Filter out dependencies that are already installed
  const packagesToInstall: string[] = [];
  for (const dep of requiredDeps) {
    const depName = dep.split('@')[0];
    if (!existingDeps[depName]) {
      packagesToInstall.push(dep);
    }
  }

  if (packagesToInstall.length === 0) {
    logSuccess('All required dependencies already installed');
    return { success: true };
  }

  if (dryRun) {
    logInfo(`[DRY RUN] Would install: ${packagesToInstall.join(', ')}`);
    return { success: true };
  }

  const installCmd = project.packageManager === 'pnpm'
    ? `pnpm add ${packagesToInstall.join(' ')}`
    : project.packageManager === 'yarn'
    ? `yarn add ${packagesToInstall.join(' ')}`
    : `npm install ${packagesToInstall.join(' ')}`;

  try {
    logInfo(`Installing dependencies: ${packagesToInstall.join(', ')}`);
    execSync(installCmd, {
      stdio: 'inherit',
      cwd: projectDir
    });
    logSuccess('Dependencies installed');
    return { success: true };
  } catch (error) {
    logError('Failed to install dependencies');
    logError(`Try installing manually: ${installCmd}`);
    return { success: false };
  }
}
