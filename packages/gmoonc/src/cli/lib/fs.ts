import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';

export function ensureDirectoryExists(filePath: string): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export function createBackupIfExists(filePath: string): string | null {
  if (!existsSync(filePath)) {
    return null;
  }

  const timestamp = new Date().toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, '')
    .slice(0, 15); // YYYYMMDDTHHMMSS

  const ext = filePath.match(/\.[^.]+$/)?.[0] || '';
  const base = filePath.replace(ext, '');
  const backupPath = `${base}.gmoonc.bak-${timestamp}${ext}`;

  const content = readFileSync(filePath, 'utf-8');
  writeFileSync(backupPath, content, 'utf-8');

  return backupPath;
}

export function writeFileSafe(filePath: string, content: string): string | null {
  ensureDirectoryExists(filePath);
  const backupPath = createBackupIfExists(filePath);
  writeFileSync(filePath, content, 'utf-8');
  return backupPath;
}

export function readFile(filePath: string): string {
  return readFileSync(filePath, 'utf-8');
}

export function copyDirectoryRecursive(src: string, dest: string): void {
  if (!existsSync(src)) {
    return;
  }

  const stats = statSync(src);
  if (!stats.isDirectory()) {
    return;
  }

  ensureDirectoryExists(dest);

  const entries = readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectoryRecursive(srcPath, destPath);
    } else {
      ensureDirectoryExists(destPath);
      copyFileSync(srcPath, destPath);
    }
  }
}
