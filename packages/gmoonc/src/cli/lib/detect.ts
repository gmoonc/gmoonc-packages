import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

export interface ProjectInfo {
  packageManager: 'npm' | 'pnpm' | 'yarn';
  entrypoint: string | null;
  routerFile: string | null;
  packageJsonPath: string;
}

const ENTRYPOINT_CANDIDATES = [
  'src/main.tsx',
  'src/main.jsx',
  'src/main.ts',
  'src/main.js'
];

const ROUTER_CANDIDATES = [
  'src/App.tsx',
  'src/App.jsx',
  'src/App.ts',
  'src/App.js'
];

export function detectPackageManager(cwd: string): 'npm' | 'pnpm' | 'yarn' {
  if (existsSync(join(cwd, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }
  if (existsSync(join(cwd, 'yarn.lock'))) {
    return 'yarn';
  }
  if (existsSync(join(cwd, 'package-lock.json'))) {
    return 'npm';
  }
  return 'npm'; // default
}

export function findEntrypoint(cwd: string): string | null {
  for (const candidate of ENTRYPOINT_CANDIDATES) {
    const path = join(cwd, candidate);
    if (existsSync(path)) {
      return candidate;
    }
  }
  return null;
}

export function findRouterFile(cwd: string): string | null {
  for (const candidate of ROUTER_CANDIDATES) {
    const path = join(cwd, candidate);
    if (existsSync(path)) {
      const content = readFileSync(path, 'utf-8');
      // Confirm it has BrowserRouter, Routes, and at least one Route
      if (content.includes('<BrowserRouter') && 
          content.includes('<Routes') &&
          content.includes('<Route')) {
        return candidate;
      }
    }
  }
  return null;
}

export function detectProject(cwd: string): ProjectInfo {
  const packageJsonPath = join(cwd, 'package.json');
  
  if (!existsSync(packageJsonPath)) {
    throw new Error(
      'package.json not found. Make sure you run this command in the root of your React project.'
    );
  }

  const packageManager = detectPackageManager(cwd);
  const entrypoint = findEntrypoint(cwd);
  const routerFile = findRouterFile(cwd);

  return {
    packageManager,
    entrypoint,
    routerFile,
    packageJsonPath
  };
}
