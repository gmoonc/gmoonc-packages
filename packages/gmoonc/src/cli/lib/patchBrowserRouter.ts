import { readFile, writeFileSafe, ensureDirectoryExists } from './fs.js';
import { existsSync } from 'fs';
import { join, relative, dirname, resolve, extname } from 'path';
import { logSuccess, logError, logInfo, logWarning } from './logger.js';

export interface PatchResult {
  success: boolean;
  backupPath: string | null;
  message?: string;
}

interface ParsedImport {
  line: string;
  defaultExport?: string;
  namedExports: string[];
  from: string;
  lineNumber: number;
}

interface RouteComponent {
  componentName: string;
  path: string; // "/" or "*"
  import: ParsedImport | null;
}

/**
 * Parse all import statements from App.tsx
 */
function parseImports(content: string): ParsedImport[] {
  const imports: ParsedImport[] = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('import')) {
      continue;
    }
    
    // Match: import X from "path"
    const defaultMatch = line.match(/^import\s+(\w+)\s+from\s+["']([^"']+)["']/);
    if (defaultMatch) {
      imports.push({
        line,
        defaultExport: defaultMatch[1],
        namedExports: [],
        from: defaultMatch[2],
        lineNumber: i
      });
      continue;
    }
    
    // Match: import { X, Y } from "path" or import { type X } from "path"
    const namedMatch = line.match(/^import\s+\{([^}]+)\}\s+from\s+["']([^"']+)["']/);
    if (namedMatch) {
      const exports = namedMatch[1].split(',').map(s => s.trim());
      imports.push({
        line,
        defaultExport: undefined,
        namedExports: exports,
        from: namedMatch[2],
        lineNumber: i
      });
      continue;
    }
    
    // Match: import X, { Y } from "path"
    const mixedMatch = line.match(/^import\s+(\w+)\s*,\s*\{([^}]+)\}\s+from\s+["']([^"']+)["']/);
    if (mixedMatch) {
      const exports = mixedMatch[2].split(',').map(s => s.trim());
      imports.push({
        line,
        defaultExport: mixedMatch[1],
        namedExports: exports,
        from: mixedMatch[3],
        lineNumber: i
      });
    }
  }
  
  return imports;
}

/**
 * Find all Route components used in <Routes> block
 */
function findRouteComponents(content: string): RouteComponent[] {
  const routes: RouteComponent[] = [];
  
  // Find <Routes> block
  const routesStart = content.indexOf('<Routes');
  if (routesStart === -1) {
    return routes;
  }
  
  // Find matching </Routes>
  let depth = 1;
  let pos = routesStart + '<Routes'.length;
  let routesEnd = -1;
  
  while (pos < content.length && depth > 0) {
    if (content.substring(pos).startsWith('<Routes')) {
      depth++;
      pos += '<Routes'.length;
    } else if (content.substring(pos).startsWith('</Routes>')) {
      depth--;
      if (depth === 0) {
        routesEnd = pos + '</Routes>'.length;
        break;
      }
      pos += '</Routes>'.length;
    } else {
      pos++;
    }
  }
  
  if (routesEnd === -1) {
    return routes;
  }
  
  const routesContent = content.substring(routesStart, routesEnd);
  
  // Find all <Route path="..." element={<Component />} />
  // Support multiple formats:
  // - <Route path="/" element={<Index />} />
  // - <Route path="/" element={<Index/>} />
  // - <Route path="*" element={<NotFound />} />
  const routePattern = /<Route\s+path=["']([^"']+)["']\s+element=\{<(\w+)\s*\/?>\}\s*\/?>/g;
  let match;
  
  while ((match = routePattern.exec(routesContent)) !== null) {
    routes.push({
      componentName: match[2],
      path: match[1],
      import: null
    });
  }
  
  return routes;
}

/**
 * Match route components with their imports
 */
function matchComponentsWithImports(routes: RouteComponent[], imports: ParsedImport[]): void {
  for (const route of routes) {
    for (const imp of imports) {
      // Check default export
      if (imp.defaultExport === route.componentName) {
        route.import = imp;
        break;
      }
      // Check named exports
      if (imp.namedExports.includes(route.componentName)) {
        route.import = imp;
        break;
      }
    }
  }
}

/**
 * Resolve import path to actual file on filesystem
 * Tries common extensions: .tsx, .ts, .jsx, .js, and index variants
 */
function resolveImportToFile(importPath: string, fromDir: string): string | null {
  // If it's a node_modules import, return as-is (no resolution needed)
  if (!importPath.startsWith('./') && !importPath.startsWith('../')) {
    return null; // External import, don't resolve
  }
  
  // Resolve base path relative to fromDir
  const basePath = resolve(fromDir, importPath);
  
  // Try with extension if not already present
  const extensions = ['.tsx', '.ts', '.jsx', '.js'];
  const indexFiles = ['index.tsx', 'index.ts', 'index.jsx', 'index.js'];
  
  // First, try the path as-is (might already have extension)
  if (existsSync(basePath)) {
    const { statSync } = require('fs');
    const stats = statSync(basePath);
    if (stats.isFile()) {
      return basePath;
    }
    if (stats.isDirectory()) {
      // Try index files in directory
      for (const indexFile of indexFiles) {
        const indexPath = join(basePath, indexFile);
        if (existsSync(indexPath)) {
          return indexPath;
        }
      }
    }
  }
  
  // Try with extensions
  for (const ext of extensions) {
    const fullPath = basePath + ext;
    if (existsSync(fullPath)) {
      const { statSync } = require('fs');
      const stats = statSync(fullPath);
      if (stats.isFile()) {
        return fullPath;
      }
    }
  }
  
  // Try as directory with index files
  if (existsSync(basePath)) {
    const { statSync } = require('fs');
    const stats = statSync(basePath);
    if (stats.isDirectory()) {
      for (const indexFile of indexFiles) {
        const indexPath = join(basePath, indexFile);
        if (existsSync(indexPath)) {
          return indexPath;
        }
      }
    }
  }
  
  return null; // Could not resolve
}

/**
 * Convert import path to relative path from AppRoutes.tsx location
 * Uses actual filesystem resolution to ensure accuracy
 */
function convertImportToRelative(
  importLine: string,
  originalPath: string,
  appRoutesDir: string,
  appDir: string
): string {
  // If it's a node_modules import, return as-is
  if (!originalPath.startsWith('./') && !originalPath.startsWith('../')) {
    return importLine;
  }
  
  // Resolve the import to actual file
  const resolvedFile = resolveImportToFile(originalPath, appDir);
  
  if (!resolvedFile) {
    // Fallback to old method if resolution fails
    logWarning(`Could not resolve import "${originalPath}" to actual file, using original path`);
    const resolvedPath = resolve(appDir, originalPath);
    const relativePath = relative(appRoutesDir, resolvedPath);
    const normalizedPath = relativePath.replace(/\\/g, '/');
    const finalPath = normalizedPath.startsWith('.') ? normalizedPath : './' + normalizedPath;
    return importLine.replace(originalPath, finalPath);
  }
  
  // Calculate relative path from appRoutesDir to resolved file
  const relativePath = relative(appRoutesDir, resolvedFile);
  
  // Remove extension for import (TypeScript/JavaScript imports don't include extensions)
  const ext = extname(relativePath);
  const pathWithoutExt = ext ? relativePath.slice(0, -ext.length) : relativePath;
  
  // Normalize the path (use forward slashes for imports)
  const normalizedPath = pathWithoutExt.replace(/\\/g, '/');
  const finalPath = normalizedPath.startsWith('.') ? normalizedPath : './' + normalizedPath;
  
  // Replace the original path in the import line
  return importLine.replace(originalPath, finalPath);
}

/**
 * Generate AppRoutes.tsx file with correct relative imports
 */
function generateAppRoutes(
  consumerDir: string,
  basePath: string,
  routes: RouteComponent[],
  appPath: string,
  dryRun: boolean
): { success: boolean } {
  const appRoutesPath = join(consumerDir, 'src/gmoonc/router/AppRoutes.tsx');
  const appRoutesDir = dirname(appRoutesPath);
  const appDir = dirname(appPath);
  
  if (dryRun) {
    logInfo(`[DRY RUN] Would generate ${appRoutesPath}`);
    return { success: true };
  }

  ensureDirectoryExists(appRoutesPath);

  // Find Index and NotFound routes first (used for both routes array and imports)
  const indexRoute = routes.find(r => r.path === '/');
  const notFoundRoute = routes.find(r => r.path === '*');

  // Build imports
  const imports: string[] = [
    "import { useRoutes, type RouteObject } from 'react-router-dom';",
    "import { createGmooncRoutes } from './createGmooncRoutes';"
  ];

  // Add imports for consumer components with correct relative paths
  if (indexRoute && indexRoute.import) {
    const convertedImport = convertImportToRelative(
      indexRoute.import.line,
      indexRoute.import.from,
      appRoutesDir,
      appDir
    );
    if (!imports.includes(convertedImport)) {
      imports.push(convertedImport);
    }
  }
  
  if (notFoundRoute && notFoundRoute.import) {
    const convertedImport = convertImportToRelative(
      notFoundRoute.import.line,
      notFoundRoute.import.from,
      appRoutesDir,
      appDir
    );
    if (!imports.includes(convertedImport)) {
      imports.push(convertedImport);
    }
  }

  // Build the routes array
  // IMPORTANT: Order matters! "*" (NotFound) must be LAST
  const routeElements: string[] = [];
  
  // Add Index route (path="/") first
  if (indexRoute) {
    routeElements.push(`    { path: "${indexRoute.path}", element: <${indexRoute.componentName} /> }`);
  }
  
  // Add gmoonc routes in the middle
  routeElements.push(`    ...createGmooncRoutes({ basePath })`);
  
  // Add NotFound route (path="*") LAST - this is critical for React Router
  if (notFoundRoute) {
    routeElements.push(`    { path: "${notFoundRoute.path}", element: <${notFoundRoute.componentName} /> }`);
  }

  const content = `${imports.join('\n')}

export function GMooncAppRoutes({ basePath = "${basePath}" }: { basePath?: string }) {
  const allRoutes: RouteObject[] = [
${routeElements.join(',\n')}
  ];

  return useRoutes(allRoutes);
}
`;

  writeFileSafe(appRoutesPath, content);
  logSuccess('Generated src/gmoonc/router/AppRoutes.tsx');
  
  return { success: true };
}

/**
 * Patch App.tsx to use GMooncAppRoutes
 * Preserves all wrappers and only modifies the router block
 */
export function patchBrowserRouter(
  consumerDir: string,
  basePath: string,
  dryRun: boolean
): PatchResult {
  // Find App.tsx
  const appCandidates = ['src/App.tsx', 'src/App.jsx', 'src/App.ts', 'src/App.js'];
  let appPath: string | null = null;
  
  for (const candidate of appCandidates) {
    const fullPath = join(consumerDir, candidate);
    if (existsSync(fullPath)) {
      appPath = fullPath;
      break;
    }
  }

  if (!appPath) {
    return {
      success: false,
      backupPath: null,
      message: 'Could not find App.tsx, App.jsx, App.ts, or App.js'
    };
  }

  const appContent = readFile(appPath);

  // Check if already patched
  if (appContent.includes('GMooncAppRoutes') || appContent.includes('gmooncAppRoutes')) {
    return {
      success: false,
      backupPath: null,
      message: 'App.tsx already uses GMooncAppRoutes'
    };
  }

  // Confirm BrowserRouter pattern
  if (!appContent.includes('<BrowserRouter') || !appContent.includes('<Routes')) {
    return {
      success: false,
      backupPath: null,
      message: 'BrowserRouter pattern not found in App.tsx. Expected <BrowserRouter> with <Routes> inside.'
    };
  }

  // Parse imports
  const imports = parseImports(appContent);
  
  // Find route components
  const routes = findRouteComponents(appContent);
  
  if (routes.length === 0) {
    return {
      success: false,
      backupPath: null,
      message: 'Could not find any <Route> components in <Routes> block. Please ensure you have routes defined.'
    };
  }
  
  // Match components with imports
  matchComponentsWithImports(routes, imports);
  
  // Check if we found Index or NotFound
  const hasIndex = routes.some(r => r.path === '/' && r.import);
  const hasNotFound = routes.some(r => r.path === '*' && r.import);
  
  if (!hasIndex && !hasNotFound) {
    return {
      success: false,
      backupPath: null,
      message: 'Could not find Index (path="/") or NotFound (path="*") components with valid imports in App.tsx'
    };
  }

  if (dryRun) {
    logInfo(`[DRY RUN] Would patch ${appPath}`);
    return { success: true, backupPath: null };
  }

  // Generate AppRoutes.tsx
  generateAppRoutes(consumerDir, basePath, routes, appPath, false);

  // Patch App.tsx
  const backupPath = writeFileSafe(appPath, '');
  
  const lines = appContent.split('\n');
  
  // Ensure BrowserRouter is imported (CRITICAL: App.tsx uses <BrowserRouter>)
  // This function ensures BrowserRouter import exists when <BrowserRouter> is used in JSX
  let hasBrowserRouterImport = false;
  let reactRouterImportIndex = -1;
  let reactRouterImportLine: string | null = null;
  let quoteStyle: "'" | '"' = '"'; // Default to double quotes
  
  // First pass: detect existing imports and quote style
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Detect quote style from existing imports
    if (trimmed.startsWith('import ') && (trimmed.includes("'") || trimmed.includes('"'))) {
      if (trimmed.includes("'")) quoteStyle = "'";
      else if (trimmed.includes('"')) quoteStyle = '"';
    }
    
    // Check for react-router-dom imports
    if (trimmed.includes('from') && trimmed.includes('react-router-dom')) {
      reactRouterImportIndex = i;
      reactRouterImportLine = line;
      
      // Check if BrowserRouter is already imported (handle various formats)
      // Match: import { BrowserRouter } or import { BrowserRouter, ... } or import { type BrowserRouter }
      const browserRouterPattern = /\bBrowserRouter\b/;
      if (browserRouterPattern.test(trimmed)) {
        hasBrowserRouterImport = true;
      }
    }
  }
  
  // Add or update BrowserRouter import - ALWAYS ensure it exists if <BrowserRouter> is used
  if (!hasBrowserRouterImport) {
    if (reactRouterImportIndex >= 0 && reactRouterImportLine) {
      // Update existing react-router-dom import to include BrowserRouter
      const existingLine = reactRouterImportLine;
      const indent = existingLine.match(/^(\s*)/)?.[1] || '';
      
      // Match: import { X, Y } from "react-router-dom" or import { type X } from "react-router-dom"
      const namedMatch = existingLine.match(/^(\s*)import\s+\{([^}]+)\}\s+from\s+(["'])react-router-dom\2/);
      if (namedMatch) {
        const importListStr = namedMatch[2];
        const quote = namedMatch[3] as "'" | '"';
        
        // Parse imports, handling "type" keywords and preserving formatting
        const importItems = importListStr.split(',').map(s => s.trim()).filter(Boolean);
        const hasBrowserRouter = importItems.some(item => 
          item === 'BrowserRouter' || 
          item === 'type BrowserRouter' || 
          item.includes('BrowserRouter')
        );
        
        if (!hasBrowserRouter) {
          // Add BrowserRouter to the list
          importItems.push('BrowserRouter');
          // Preserve original formatting style (spaces, trailing comma if present)
          const hasTrailingComma = importListStr.trim().endsWith(',');
          const separator = importListStr.includes(',\n') ? ',\n' : ', ';
          const formatted = importItems.join(separator) + (hasTrailingComma ? ',' : '');
          const updatedLine = `${indent}import { ${formatted} } from ${quote}react-router-dom${quote};`;
          lines[reactRouterImportIndex] = updatedLine;
        }
      } else {
        // Default import, namespace import, or other format
        // Add separate named import for BrowserRouter right after the existing import
        const newImportLine = `${indent}import { BrowserRouter } from ${quoteStyle}react-router-dom${quoteStyle};`;
        lines.splice(reactRouterImportIndex + 1, 0, newImportLine);
      }
    } else {
      // No react-router-dom import exists, add it
      const importLine = `import { BrowserRouter } from ${quoteStyle}react-router-dom${quoteStyle};`;
      let lastImportIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('import ') || line.startsWith('import{') || line.startsWith('import\t')) {
          lastImportIndex = i;
        } else if (line && lastImportIndex >= 0 && !line.startsWith('//') && !line.startsWith('/*')) {
          break;
        }
      }
      if (lastImportIndex >= 0) {
        lines.splice(lastImportIndex + 1, 0, importLine);
      } else {
        lines.unshift(importLine);
      }
    }
  }
  
  // Add import for GMooncAppRoutes
  const importLine = `import { GMooncAppRoutes } from "./gmoonc/router/AppRoutes";`;
  
  let lastImportIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('import ') || line.startsWith('import{') || line.startsWith('import\t')) {
      lastImportIndex = i;
    } else if (line && lastImportIndex >= 0 && !line.startsWith('//') && !line.startsWith('/*')) {
      break;
    }
  }

  if (lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, importLine);
  } else {
    lines.unshift(importLine);
  }

  // Replace <Routes>...</Routes> with <GMooncAppRoutes />
  let newContent = lines.join('\n');
  
  // Find <Routes>...</Routes> block
  const routesStartMatch = newContent.match(/<Routes\s*[^>]*>/);
  if (!routesStartMatch) {
    return {
      success: false,
      backupPath,
      message: 'Could not find <Routes> tag'
    };
  }

  const routesStartIndex = routesStartMatch.index!;
  
  // Find matching </Routes>
  let depth = 1;
  let routesEndIndex = routesStartIndex + routesStartMatch[0].length;
  
  for (let i = routesEndIndex; i < newContent.length; i++) {
    if (newContent.substring(i).startsWith('<Routes')) {
      depth++;
    } else if (newContent.substring(i).startsWith('</Routes>')) {
      depth--;
      if (depth === 0) {
        routesEndIndex = i + '</Routes>'.length;
        break;
      }
    }
  }

  if (depth !== 0) {
    return {
      success: false,
      backupPath,
      message: 'Could not find matching </Routes> tag'
    };
  }

  // Get indentation
  const routesLine = lines.find((line, idx) => {
    const lineContent = line.trim();
    return lineContent.startsWith('<Routes') && idx <= routesStartIndex;
  });
  const indent = routesLine ? routesLine.match(/^(\s*)/)?.[1] || '  ' : '  ';

  // Replace Routes block with GMooncAppRoutes
  const before = newContent.substring(0, routesStartIndex);
  const after = newContent.substring(routesEndIndex);
  
  const replacement = `${indent}<GMooncAppRoutes basePath="${basePath}" />`;
  
  newContent = before + replacement + after;

  // Remove unused Routes, Route imports if they're not used elsewhere
  if (!newContent.match(/<Routes[^>]*>/g) && !newContent.match(/<Route[^>]*>/g)) {
    newContent = newContent.replace(/import\s+{[^}]*Routes[^}]*}\s+from\s+["']react-router-dom["'];?\n?/g, '');
    newContent = newContent.replace(/import\s+{[^}]*Route[^}]*}\s+from\s+["']react-router-dom["'];?\n?/g, '');
  }

  writeFileSafe(appPath, newContent);
  
  logSuccess(`Patched ${appPath} (backup: ${backupPath})`);
  
  return { success: true, backupPath };
}
