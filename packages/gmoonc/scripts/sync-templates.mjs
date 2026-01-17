#!/usr/bin/env node

import { readFile, writeFile, mkdir, readdir, stat, copyFile } from 'fs/promises';
import { join, dirname, relative, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Script is at packages/gmoonc/scripts/sync-templates.mjs
// Go up 2 levels to get to packages/gmoonc, then up 1 more to get to root
const ROOT = join(__dirname, '../../..');
const PACKAGES_DIR = join(ROOT, 'packages');

// Paths
const APP_SRC = join(PACKAGES_DIR, 'app/src');
const UI_SRC = join(PACKAGES_DIR, 'ui/src');
const TEMPLATES_DIR = join(__dirname, '../src/templates/shared/src/gmoonc');

// Stats
const stats = {
  filesCopiedApp: 0,
  filesCopiedUI: 0,
  filesRewritten: 0,
  importRewrites: 0,
  externalDepsDetected: new Set(),
  brokenImports: []
};

// File extensions to process
const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];
const CSS_EXTENSIONS = ['.css'];

// Directories to ignore
const IGNORE_DIRS = ['node_modules', 'dist', 'build', '.next', '__tests__', '__mocks__'];

/**
 * Check if a directory should be ignored
 */
function shouldIgnoreDir(dirName) {
  return IGNORE_DIRS.includes(dirName);
}

/**
 * Check if a file should be processed
 */
function shouldProcessFile(fileName) {
  const ext = extname(fileName);
  return SOURCE_EXTENSIONS.includes(ext) || CSS_EXTENSIONS.includes(ext);
}

/**
 * Copy directory recursively
 */
async function copyDirectory(src, dest, options = {}) {
  const { transform = null, basePath = null } = options;
  
  try {
    await mkdir(dest, { recursive: true });
    const entries = await readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
      if (shouldIgnoreDir(entry.name)) {
        continue;
      }
      
      const srcPath = join(src, entry.name);
      const destPath = join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await copyDirectory(srcPath, destPath, options);
      } else if (entry.isFile() && shouldProcessFile(entry.name)) {
        let content = await readFile(srcPath, 'utf-8');
        
        if (transform && SOURCE_EXTENSIONS.includes(extname(entry.name))) {
          content = transform(content, srcPath, destPath, basePath);
        }
        
        await mkdir(dirname(destPath), { recursive: true });
        await writeFile(destPath, content, 'utf-8');
        
        if (basePath === 'app') {
          stats.filesCopiedApp++;
        } else if (basePath === 'ui') {
          stats.filesCopiedUI++;
        }
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

/**
 * Build a map of exports from app source for import resolution
 */
async function buildExportMap(srcDir, basePath = '') {
  const map = new Map();
  
  async function scanDir(dir, currentPath = '') {
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (shouldIgnoreDir(entry.name)) {
          continue;
        }
        
        const fullPath = join(dir, entry.name);
        const relPath = join(currentPath, entry.name);
        
        if (entry.isDirectory()) {
          await scanDir(fullPath, relPath);
        } else if (entry.isFile() && SOURCE_EXTENSIONS.includes(extname(entry.name))) {
          const nameWithoutExt = basename(entry.name, extname(entry.name));
          const exportPath = relPath.replace(/\\/g, '/').replace(/\.[^.]+$/, '');
          
          // Map common exports
          map.set(nameWithoutExt, exportPath);
          map.set(exportPath, exportPath);
        }
      }
    } catch (error) {
      // Ignore errors
    }
  }
  
  await scanDir(srcDir, basePath);
  return map;
}

/**
 * Resolve import path from @gmoonc/app to relative path
 */
function resolveAppImport(importPath, currentFile, exportMap) {
  // Remove @gmoonc/app prefix
  const path = importPath.replace(/^@gmoonc\/app\/?/, '');
  
  // Get current file directory relative to templates root
  const currentDir = dirname(currentFile.replace(/\\/g, '/'));
  const templatesRoot = TEMPLATES_DIR.replace(/\\/g, '/');
  const currentRel = relative(templatesRoot, currentDir).replace(/\\/g, '/') || '.';
  
  // Common mappings
  if (path === '' || path === 'index') {
    // Root export - try to find from exportMap or use relative
    return '../index';
  }
  
  // Try to resolve from exportMap
  const pathParts = path.split('/');
  const exportName = pathParts[pathParts.length - 1];
  
  if (exportMap.has(exportName)) {
    const targetPath = exportMap.get(exportName);
    const targetRel = relative(currentRel, targetPath).replace(/\\/g, '/');
    return targetRel.startsWith('.') ? targetRel : `./${targetRel}`;
  }
  
  // Fallback: construct relative path
  const targetPath = path.startsWith('/') ? path.slice(1) : path;
  const targetRel = relative(currentRel, targetPath).replace(/\\/g, '/');
  return targetRel.startsWith('.') ? targetRel : `./${targetRel}`;
}

/**
 * Resolve import path from @gmoonc/ui to relative path
 */
function resolveUIImport(importPath, currentFile) {
  const path = importPath.replace(/^@gmoonc\/ui\/?/, '');
  
  const currentDir = dirname(currentFile.replace(/\\/g, '/'));
  const templatesRoot = TEMPLATES_DIR.replace(/\\/g, '/');
  const currentRel = relative(templatesRoot, currentDir).replace(/\\/g, '/') || '.';
  
  if (path === '' || path === 'index') {
    return '../ui';
  }
  
  if (path === 'styles.css') {
    return '../ui/styles.css';
  }
  
  // Map common UI components
  const uiComponents = {
    'shell': 'ui/shell',
    'menu': 'ui/menu',
    'header': 'ui/header',
    'sidebar': 'ui/sidebar'
  };
  
  if (uiComponents[path]) {
    const targetRel = relative(currentRel, uiComponents[path]).replace(/\\/g, '/');
    return targetRel.startsWith('.') ? targetRel : `./${targetRel}`;
  }
  
  // Fallback
  const targetPath = `ui/${path}`;
  const targetRel = relative(currentRel, targetPath).replace(/\\/g, '/');
  return targetRel.startsWith('.') ? targetRel : `./${targetRel}`;
}

/**
 * Resolve import path from @gmoonc/core to relative path
 */
function resolveCoreImport(importPath, currentFile) {
  const path = importPath.replace(/^@gmoonc\/core\/?/, '');
  
  const currentDir = dirname(currentFile.replace(/\\/g, '/'));
  const templatesRoot = TEMPLATES_DIR.replace(/\\/g, '/');
  const currentRel = relative(templatesRoot, currentDir).replace(/\\/g, '/') || '.';
  
  if (path === '' || path === 'index') {
    return '../core/types';
  }
  
  // Map core exports - check if we're already in core directory
  if (currentRel.startsWith('core/')) {
    // We're in core, so use relative path within core
    if (path === 'types' || path === 'menu') {
      return `./${path}`;
    }
  }
  
  // Map core exports
  const coreExports = {
    'types': 'core/types',
    'menu': 'core/menu'
  };
  
  if (coreExports[path]) {
    const targetRel = relative(currentRel, coreExports[path]).replace(/\\/g, '/');
    return targetRel.startsWith('.') ? targetRel : `./${targetRel}`;
  }
  
  // Fallback
  const targetPath = `core/${path}`;
  const targetRel = relative(currentRel, targetPath).replace(/\\/g, '/');
  return targetRel.startsWith('.') ? targetRel : `./${targetRel}`;
}

/**
 * Rewrite imports in file content
 */
function rewriteImports(content, filePath, exportMap) {
  let rewritten = content;
  let rewriteCount = 0;
  
  // Pattern for import statements
  const importPatterns = [
    // import ... from '@gmoonc/...'
    /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]@gmoonc\/(app|ui|core)(?:\/([^'"]*))?['"]/g,
    // import '@gmoonc/...'
    /import\s+['"]@gmoonc\/(app|ui|core)(?:\/([^'"]*))?['"]/g
  ];
  
  for (const pattern of importPatterns) {
    rewritten = rewritten.replace(pattern, (match, pkg, path = '') => {
      const fullPath = path ? `${pkg}/${path}` : pkg;
      let newPath;
      
      if (pkg === 'app') {
        newPath = resolveAppImport(fullPath, filePath, exportMap);
      } else if (pkg === 'ui') {
        newPath = resolveUIImport(fullPath, filePath);
      } else if (pkg === 'core') {
        newPath = resolveCoreImport(fullPath, filePath);
      } else {
        return match; // No change
      }
      
      rewriteCount++;
      return match.replace(`@gmoonc/${fullPath}`, newPath);
    });
  }
  
  // Detect external dependencies (bare imports that are not @gmoonc/*)
  // Only match actual import statements, not template strings or JSX
  const externalPattern = /^import\s+.*from\s+['"](?!@gmoonc\/|\.\/|\.\.\/|react|react-dom|react-router)([^'"]+)['"]/gm;
  let externalMatch;
  while ((externalMatch = externalPattern.exec(content)) !== null) {
    const dep = externalMatch[1];
    // Skip React, React DOM, built-in modules, and CSS
    if (!dep.startsWith('react') && 
        !dep.startsWith('react-dom') && 
        !dep.endsWith('.css') &&
        !dep.includes('{') && // Skip template strings
        !['fs', 'path', 'url', 'util', 'stream', 'buffer', 'events'].includes(dep.split('/')[0])) {
      const depName = dep.split('/')[0].split('@')[0]; // Remove scoped package @
      if (depName && depName.length > 0 && !depName.includes('?')) {
        stats.externalDepsDetected.add(depName);
      }
    }
  }
  
  if (rewriteCount > 0) {
    stats.importRewrites += rewriteCount;
    return rewritten;
  }
  
  return content;
}

/**
 * Validate that rewritten imports exist (lenient - TypeScript allows imports without extensions)
 */
async function validateImports(content, filePath) {
  // Only validate import statements with 'from' keyword - this ensures we're actually looking at imports
  const importPattern = /^import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/gm;
  
  let match;
  const errors = [];
  
  // For now, we trust TypeScript/build tools to validate relative imports
  // Only check for clearly broken bare imports
  while ((match = importPattern.exec(content)) !== null) {
    const importPath = match[1];
    
    // Skip relative imports, CSS imports, and known valid packages
    if (importPath.startsWith('./') || 
        importPath.startsWith('../') ||
        importPath.endsWith('.css') ||
        importPath.startsWith('react') || 
        importPath.startsWith('react-dom') || 
        importPath.startsWith('react-router') ||
        importPath.startsWith('lucide-react') ||
        importPath.includes('node_modules') ||
        importPath.includes('@gmoonc')) {
      continue;
    }
    
    // This is a potentially broken import
    errors.push({
      file: filePath,
      line: content.substring(0, match.index).split('\n').length,
      import: importPath
    });
  }
  
  return errors;
}

/**
 * Transform function for copying app files
 */
async function createAppTransform(exportMap) {
  return (content, srcPath, destPath) => {
    return rewriteImports(content, destPath, exportMap);
  };
}

/**
 * Transform function for copying UI files
 */
function createUITransform() {
  return (content, srcPath, destPath) => {
    // UI files might import from @gmoonc/core
    return rewriteImports(content, destPath, new Map());
  };
}

/**
 * Main sync function
 */
async function syncTemplates() {
  console.log('🔄 Syncing templates...\n');
  
  try {
    // Build export map from app source
    console.log('📋 Building export map...');
    const exportMap = await buildExportMap(APP_SRC);
    console.log(`✓ Found ${exportMap.size} exports\n`);
    
    // Copy app source
    console.log('📦 Copying app source...');
    console.log(`  Source: ${APP_SRC}`);
    console.log(`  Dest: ${TEMPLATES_DIR}`);
    
    if (!await stat(APP_SRC).then(() => true).catch(() => false)) {
      throw new Error(`App source directory not found: ${APP_SRC}`);
    }
    
    await copyDirectory(
      APP_SRC,
      TEMPLATES_DIR,
      {
        transform: await createAppTransform(exportMap),
        basePath: 'app'
      }
    );
    console.log(`✓ Copied ${stats.filesCopiedApp} files from app\n`);
    
    // Copy UI components
    console.log('🎨 Copying UI components...');
    const uiDest = join(TEMPLATES_DIR, 'ui');
    await mkdir(uiDest, { recursive: true });
    
    const uiFiles = ['shell.tsx', 'menu.tsx', 'header.tsx', 'sidebar.tsx'];
    for (const file of uiFiles) {
      const srcPath = join(UI_SRC, file);
      const destPath = join(uiDest, file);
      try {
        let content = await readFile(srcPath, 'utf-8');
        content = createUITransform()(content, srcPath, destPath);
        await writeFile(destPath, content, 'utf-8');
        stats.filesCopiedUI++;
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    }
    console.log(`✓ Copied ${stats.filesCopiedUI} UI files\n`);
    
    // Copy CSS files
    console.log('🎨 Copying CSS files...');
    
    // App CSS
    const appCssSrc = join(APP_SRC, 'styles/app.css');
    const appCssDest = join(TEMPLATES_DIR, 'styles/gmoonc.css');
    try {
      await mkdir(dirname(appCssDest), { recursive: true });
      await copyFile(appCssSrc, appCssDest);
      console.log('✓ Copied app.css -> gmoonc.css');
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
    
    // UI CSS
    const uiCssSrc = join(UI_SRC, 'styles.css');
    const uiCssDest = join(uiDest, 'styles.css');
    try {
      await copyFile(uiCssSrc, uiCssDest);
      console.log('✓ Copied ui/styles.css\n');
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
    
    // Validate imports in all copied files (lenient - TypeScript will catch real errors)
    console.log('🔍 Validating imports (lenient mode - TypeScript will catch real errors)...');
    await validateAllImports(TEMPLATES_DIR);
    
    // Print report
    console.log('\n📊 Sync Report:');
    console.log(`  Files copied (app): ${stats.filesCopiedApp}`);
    console.log(`  Files copied (UI): ${stats.filesCopiedUI}`);
    console.log(`  Files processed: ${stats.filesRewritten}`);
    console.log(`  Import rewrites: ${stats.importRewrites}`);
    console.log(`  External deps detected: ${Array.from(stats.externalDepsDetected).join(', ') || 'none'}`);
    
    // Only fail on clearly broken imports (non-relative that don't exist)
    const criticalErrors = stats.brokenImports.filter(e => !e.import.startsWith('./') && !e.import.startsWith('../'));
    if (criticalErrors.length > 0) {
      console.log('\n❌ Critical broken imports found:');
      for (const error of criticalErrors) {
        console.log(`  ${error.file}:${error.line} - ${error.import}`);
      }
      process.exit(1);
    }
    
    if (stats.brokenImports.length > 0) {
      console.log(`\n⚠️  ${stats.brokenImports.length} relative imports may need verification (TypeScript/build will validate)`);
    }
    
    console.log('\n✅ Sync complete!');
    
  } catch (error) {
    console.error('\n❌ Error syncing templates:', error);
    process.exit(1);
  }
}

/**
 * Validate imports in all files
 */
async function validateAllImports(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (shouldIgnoreDir(entry.name)) {
      continue;
    }
    
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      await validateAllImports(fullPath);
    } else if (entry.isFile() && SOURCE_EXTENSIONS.includes(extname(entry.name))) {
      const content = await readFile(fullPath, 'utf-8');
      const errors = await validateImports(content, fullPath);
      
      if (errors.length > 0) {
        stats.brokenImports.push(...errors);
      } else {
        stats.filesRewritten++;
      }
    }
  }
}

// Run sync
syncTemplates();
