import { existsSync } from 'fs';
import { join } from 'path';

export interface ProjectInfo {
  packageManager: 'npm' | 'pnpm' | 'yarn';
  entrypoint: string | null;
  packageJsonPath: string;
}

const ENTRYPOINT_CANDIDATES = [
  'src/main.tsx',
  'src/main.jsx',
  'src/main.ts',
  'src/main.js'
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

export function detectProject(cwd: string): ProjectInfo {
  const packageJsonPath = join(cwd, 'package.json');
  
  if (!existsSync(packageJsonPath)) {
    throw new Error(
      'package.json não encontrado. Certifique-se de executar este comando na raiz do seu projeto React.'
    );
  }

  const packageManager = detectPackageManager(cwd);
  const entrypoint = findEntrypoint(cwd);

  return {
    packageManager,
    entrypoint,
    packageJsonPath
  };
}
