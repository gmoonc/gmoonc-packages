import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createBackupIfExists } from './fs.js';

export type RouterStrategy = 'createBrowserRouter' | 'BrowserRouter' | 'fallback';

export interface RouterPatchResult {
  strategy: RouterStrategy;
  success: boolean;
  backupPath: string | null;
  message?: string;
}

export function detectRouterStrategy(projectDir: string, entrypoint: string): RouterStrategy {
  const entrypointPath = join(projectDir, entrypoint);
  if (!existsSync(entrypointPath)) {
    return 'fallback';
  }

  const content = readFileSync(entrypointPath, 'utf-8');

  // Strategy A: createBrowserRouter + RouterProvider
  if (content.includes('createBrowserRouter') && content.includes('RouterProvider')) {
    return 'createBrowserRouter';
  }

  // Strategy B: BrowserRouter + Routes
  const appPath = join(projectDir, 'src/App.tsx');
  if (existsSync(appPath)) {
    const appContent = readFileSync(appPath, 'utf-8');
    if (appContent.includes('<BrowserRouter>') && appContent.includes('<Routes>')) {
      return 'BrowserRouter';
    }
  }

  // Try App.tsx, App.jsx, App.ts, App.js
  const appCandidates = ['src/App.tsx', 'src/App.jsx', 'src/App.ts', 'src/App.js'];
  for (const candidate of appCandidates) {
    const candidatePath = join(projectDir, candidate);
    if (existsSync(candidatePath)) {
      const candidateContent = readFileSync(candidatePath, 'utf-8');
      if (candidateContent.includes('<BrowserRouter>') && candidateContent.includes('<Routes>')) {
        return 'BrowserRouter';
      }
    }
  }

  return 'fallback';
}

export function patchCreateBrowserRouter(
  projectDir: string,
  entrypoint: string,
  basePath: string
): RouterPatchResult {
  const entrypointPath = join(projectDir, entrypoint);
  const content = readFileSync(entrypointPath, 'utf-8');

  // Check if already patched
  if (content.includes('createGmooncRoutes')) {
    return {
      strategy: 'createBrowserRouter',
      success: false,
      backupPath: null,
      message: 'Routes already integrated'
    };
  }

  // Check if createBrowserRouter exists
  if (!content.includes('createBrowserRouter')) {
    return {
      strategy: 'createBrowserRouter',
      success: false,
      backupPath: null,
      message: 'createBrowserRouter not found'
    };
  }

  const backupPath = createBackupIfExists(entrypointPath);

  // Add import
  const importLine = `import { createGmooncRoutes } from "./gmoonc/routes";`;
  
  // Find where to insert import (after other imports)
  const lines = content.split('\n');
  let lastImportIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('import ') || line.startsWith('import{') || line.startsWith('import\t')) {
      lastImportIndex = i;
    } else if (line && lastImportIndex >= 0 && !line.startsWith('//') && !line.startsWith('/*')) {
      break;
    }
  }

  // Insert import
  if (lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, importLine);
  } else {
    lines.unshift(importLine);
  }

  // Find createBrowserRouter call and add routes
  const newContent = lines.join('\n');
  const routerMatch = newContent.match(/createBrowserRouter\s*\(\s*\[/);
  
  if (routerMatch) {
    const routerIndex = routerMatch.index! + routerMatch[0].length;
    const before = newContent.substring(0, routerIndex);
    const after = newContent.substring(routerIndex);
    
    // Insert routes at the beginning of the array
    const routesInsert = `\n    ...createGmooncRoutes("${basePath}"),`;
    const patchedContent = before + routesInsert + after;
    
    writeFileSync(entrypointPath, patchedContent, 'utf-8');
    
    return {
      strategy: 'createBrowserRouter',
      success: true,
      backupPath
    };
  }

  return {
    strategy: 'createBrowserRouter',
    success: false,
    backupPath: null,
    message: 'Could not find createBrowserRouter array'
  };
}

export function patchBrowserRouter(
  projectDir: string,
  basePath: string
): RouterPatchResult {
  // Strategy B is too risky - we'll just provide fallback instructions
  // The user can manually integrate if they use BrowserRouter pattern
  return {
    strategy: 'BrowserRouter',
    success: false,
    backupPath: null,
    message: 'BrowserRouter pattern detected but auto-integration is not supported. Please integrate createGmooncRoutes() manually.'
  };
}
