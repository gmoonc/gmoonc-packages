import { existsSync, readFileSync, writeFileSync, readdirSync } from 'fs';
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
  // Prefer App.tsx, App.jsx, App.ts, App.js (in this order)
  const appCandidates = ['src/App.tsx', 'src/App.jsx', 'src/App.ts', 'src/App.js'];
  for (const candidate of appCandidates) {
    const candidatePath = join(projectDir, candidate);
    if (existsSync(candidatePath)) {
      const candidateContent = readFileSync(candidatePath, 'utf-8');
      // Confirm it has BrowserRouter, Routes, and at least one Route
      if (candidateContent.includes('<BrowserRouter') && 
          candidateContent.includes('<Routes') &&
          candidateContent.includes('<Route')) {
        return 'BrowserRouter';
      }
    }
  }

  // Fallback: search for any file in src/ that contains BrowserRouter and Routes
  // (conservative: only check first 10 files to avoid performance issues)
  try {
    const srcDir = join(projectDir, 'src');
    if (existsSync(srcDir)) {
      const files = readdirSync(srcDir, { withFileTypes: true })
        .filter((dirent: any) => dirent.isFile() && /\.(tsx|jsx|ts|js)$/.test(dirent.name))
        .slice(0, 10); // Conservative limit
      
      for (const file of files) {
        const filePath = join(srcDir, file.name);
        const fileContent = readFileSync(filePath, 'utf-8');
        if (fileContent.includes('<BrowserRouter') && 
            fileContent.includes('<Routes') &&
            fileContent.includes('<Route')) {
          return 'BrowserRouter';
        }
      }
    }
  } catch (error) {
    // If we can't search, fall through to fallback
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
  const importLine = `import { createGmooncRoutes } from "@gmoonc/app";`;
  
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
    const routesInsert = `\n    ...createGmooncRoutes({ basePath: "${basePath}" }),`;
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

/**
 * Find the App file that contains BrowserRouter pattern
 */
function findBrowserRouterFile(projectDir: string): string | null {
  // Prefer App.tsx, App.jsx, App.ts, App.js (in this order)
  const appCandidates = ['src/App.tsx', 'src/App.jsx', 'src/App.ts', 'src/App.js'];
  for (const candidate of appCandidates) {
    const candidatePath = join(projectDir, candidate);
    if (existsSync(candidatePath)) {
      const candidateContent = readFileSync(candidatePath, 'utf-8');
      if (candidateContent.includes('<BrowserRouter') && 
          candidateContent.includes('<Routes') &&
          candidateContent.includes('<Route')) {
        return candidate;
      }
    }
  }

  // Fallback: search in src/ (conservative: first 10 files)
  try {
    const srcDir = join(projectDir, 'src');
    if (existsSync(srcDir)) {
      const files = readdirSync(srcDir, { withFileTypes: true })
        .filter((dirent: any) => dirent.isFile() && /\.(tsx|jsx|ts|js)$/.test(dirent.name))
        .slice(0, 10);
      
      for (const file of files) {
        const filePath = join(srcDir, file.name);
        const fileContent = readFileSync(filePath, 'utf-8');
        if (fileContent.includes('<BrowserRouter') && 
            fileContent.includes('<Routes') &&
            fileContent.includes('<Route')) {
          return `src/${file.name}`;
        }
      }
    }
  } catch (error) {
    // If we can't search, return null
  }

  return null;
}

export function patchBrowserRouter(
  projectDir: string,
  basePath: string
): RouterPatchResult {
  // Find the file containing BrowserRouter pattern
  const appFile = findBrowserRouterFile(projectDir);
  
  if (!appFile) {
    return {
      strategy: 'BrowserRouter',
      success: false,
      backupPath: null,
      message: 'Could not find file with BrowserRouter pattern'
    };
  }

  const appPath = join(projectDir, appFile);
  const content = readFileSync(appPath, 'utf-8');

  // Check if already patched (idempotency)
  if (content.includes('GmooncRoutes') || content.includes('gmooncRoutes')) {
    return {
      strategy: 'BrowserRouter',
      success: false,
      backupPath: null,
      message: 'Routes already integrated'
    };
  }

  // Confirm it has the required pattern
  if (!content.includes('<BrowserRouter') || !content.includes('<Routes') || !content.includes('<Route')) {
    return {
      strategy: 'BrowserRouter',
      success: false,
      backupPath: null,
      message: 'BrowserRouter pattern not confirmed'
    };
  }

  const backupPath = createBackupIfExists(appPath);

  // A) Add import
  const importLine = `import { GmooncRoutes } from "@gmoonc/app";`;
  
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

  // B) Find <Routes> and insert <GmooncRoutes /> as first child
  const newContent = lines.join('\n');
  
  // Find the first <Routes> tag (could be <Routes> or <Routes ...props>)
  const routesMatch = newContent.match(/<Routes\s*[^>]*>/);
  
  if (!routesMatch) {
    return {
      strategy: 'BrowserRouter',
      success: false,
      backupPath: null,
      message: 'Could not find <Routes> tag'
    };
  }

  const routesIndex = routesMatch.index! + routesMatch[0].length;
  const before = newContent.substring(0, routesIndex);
  const after = newContent.substring(routesIndex);
  
  // Insert GmooncRoutes as first child of Routes
  // Add proper indentation (match the indentation of the Routes tag)
  const routesLine = lines.find((line, idx) => {
    const lineContent = line.trim();
    return lineContent.startsWith('<Routes') && idx <= routesMatch.index!;
  });
  
  const indent = routesLine ? routesLine.match(/^(\s*)/)?.[1] || '  ' : '  ';
  const routesInsert = `\n${indent}  <GmooncRoutes basePath="${basePath}" />`;
  
  const patchedContent = before + routesInsert + after;
  
  writeFileSync(appPath, patchedContent, 'utf-8');
  
  return {
    strategy: 'BrowserRouter',
    success: true,
    backupPath
  };
}

export function patchRouter(
  projectDir: string,
  entrypoint: string,
  basePath: string
): RouterPatchResult {
  const strategy = detectRouterStrategy(projectDir, entrypoint);
  
  if (strategy === 'createBrowserRouter') {
    return patchCreateBrowserRouter(projectDir, entrypoint, basePath);
  } else if (strategy === 'BrowserRouter') {
    return patchBrowserRouter(projectDir, basePath);
  } else {
    return {
      strategy: 'fallback',
      success: false,
      backupPath: null,
      message: 'Could not detect router pattern. Please integrate manually.'
    };
  }
}
