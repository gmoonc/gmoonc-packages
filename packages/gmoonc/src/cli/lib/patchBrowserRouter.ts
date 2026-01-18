import { readFile, writeFileSafe, ensureDirectoryExists } from './fs.js';
import { existsSync } from 'fs';
import { join, relative } from 'path';
import { logSuccess, logError, logInfo } from './logger.js';

export interface PatchResult {
  success: boolean;
  backupPath: string | null;
  message?: string;
}

/**
 * Extract imports for Index and NotFound components from App.tsx
 */
function extractRouteComponents(appContent: string): {
  indexImport: string | null;
  notFoundImport: string | null;
  indexComponent: string | null;
  notFoundComponent: string | null;
} {
  // Try to find <Route path="/" element={<Index />} /> or <Route path="/" element={<Index/>} />
  const indexRouteMatch = appContent.match(/<Route\s+path=["']\/["']\s+element=\{<(\w+)\s*\/?>\}\s*\/?>/);
  const indexComponent = indexRouteMatch ? indexRouteMatch[1] : null;

  // Try to find <Route path="*" element={<NotFound />} /> or <Route path="*" element={<NotFound/>} />
  const notFoundRouteMatch = appContent.match(/<Route\s+path=["']\*["']\s+element=\{<(\w+)\s*\/?>\}\s*\/?>/);
  const notFoundComponent = notFoundRouteMatch ? notFoundRouteMatch[1] : null;

  // Extract imports for these components
  let indexImport: string | null = null;
  let notFoundImport: string | null = null;

  const lines = appContent.split('\n');
  
  if (indexComponent) {
    // Find import line that contains the component name
    // Match patterns like: import Index from "./pages/Index";
    // or: import { Index } from "./pages/Index";
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('import')) {
        // Check for default import: import Index from "..."
        const defaultImportMatch = trimmed.match(/import\s+(\w+)\s+from\s+["']([^"']+)["']/);
        if (defaultImportMatch && defaultImportMatch[1] === indexComponent) {
          indexImport = trimmed;
          break;
        }
        // Check for named import: import { Index } from "..."
        const namedImportMatch = trimmed.match(/import\s+\{[^}]*\b(\w+)\b[^}]*\}\s+from\s+["']([^"']+)["']/);
        if (namedImportMatch && namedImportMatch[1] === indexComponent) {
          indexImport = trimmed;
          break;
        }
      }
    }
  }

  if (notFoundComponent) {
    // Find import line that contains the component name
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('import')) {
        // Check for default import
        const defaultImportMatch = trimmed.match(/import\s+(\w+)\s+from\s+["']([^"']+)["']/);
        if (defaultImportMatch && defaultImportMatch[1] === notFoundComponent) {
          notFoundImport = trimmed;
          break;
        }
        // Check for named import
        const namedImportMatch = trimmed.match(/import\s+\{[^}]*\b(\w+)\b[^}]*\}\s+from\s+["']([^"']+)["']/);
        if (namedImportMatch && namedImportMatch[1] === notFoundComponent) {
          notFoundImport = trimmed;
          break;
        }
      }
    }
  }

  return { indexImport, notFoundImport, indexComponent, notFoundComponent };
}

/**
 * Convert import path to relative path from AppRoutes.tsx location
 */
function convertImportToRelative(importLine: string, appRoutesPath: string, appPath: string): string {
  // Extract the path from the import statement
  // Match: import X from "path" or import { X } from "path"
  const pathMatch = importLine.match(/from\s+["']([^"']+)["']/);
  if (!pathMatch) {
    return importLine; // Return as-is if no path found
  }
  
  const originalPath = pathMatch[1];
  
  // If it's already a relative path, convert it
  if (originalPath.startsWith('./') || originalPath.startsWith('../')) {
    // Get directory of App.tsx (where the original import is from)
    const appDir = appPath.substring(0, appPath.lastIndexOf('/'));
    // Get directory of AppRoutes.tsx
    const appRoutesDir = appRoutesPath.substring(0, appRoutesPath.lastIndexOf('/'));
    
    // Resolve the original path relative to appDir
    const resolvedPath = join(appDir, originalPath);
    
    // Calculate relative path from appRoutesDir to resolvedPath
    const relativePath = relative(appRoutesDir, resolvedPath);
    
    // Normalize the path (use forward slashes for imports)
    const normalizedPath = relativePath.replace(/\\/g, '/');
    const finalPath = normalizedPath.startsWith('.') ? normalizedPath : './' + normalizedPath;
    
    return importLine.replace(pathMatch[1], finalPath);
  }
  
  // If it's an absolute path or node_modules import, return as-is
  return importLine;
}

/**
 * Generate AppRoutes.tsx file
 */
function generateAppRoutes(
  consumerDir: string,
  basePath: string,
  indexImport: string | null,
  notFoundImport: string | null,
  indexComponent: string | null,
  notFoundComponent: string | null,
  appPath: string,
  dryRun: boolean
): { success: boolean } {
  const appRoutesPath = join(consumerDir, 'src/gmoonc/router/AppRoutes.tsx');
  
  if (dryRun) {
    logInfo(`[DRY RUN] Would generate ${appRoutesPath}`);
    return { success: true };
  }

  ensureDirectoryExists(appRoutesPath);

  // Build the routes array
  const routes: string[] = [];
  
  if (indexComponent) {
    routes.push(`    { path: "/", element: <${indexComponent} /> }`);
  }
  
  routes.push(`    ...createGmooncRoutes({ basePath: "${basePath}" })`);
  
  if (notFoundComponent) {
    routes.push(`    { path: "*", element: <${notFoundComponent} /> }`);
  }

  const imports: string[] = [
    "import { useRoutes, type RouteObject } from 'react-router-dom';",
    "import { createGmooncRoutes } from './createGmooncRoutes';"
  ];

  // Convert imports to relative paths from AppRoutes.tsx location
  if (indexImport) {
    const convertedImport = convertImportToRelative(indexImport, appRoutesPath, appPath);
    imports.push(convertedImport);
  }
  if (notFoundImport) {
    const convertedImport = convertImportToRelative(notFoundImport, appRoutesPath, appPath);
    imports.push(convertedImport);
  }

  const content = `${imports.join('\n')}

export function GMooncAppRoutes({ basePath = "${basePath}" }: { basePath?: string }) {
  const allRoutes: RouteObject[] = [
${routes.join(',\n')}
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
  if (!appContent.includes('<BrowserRouter') || !appContent.includes('<Routes') || !appContent.includes('<Route')) {
    return {
      success: false,
      backupPath: null,
      message: 'BrowserRouter pattern not found in App.tsx'
    };
  }

  // Extract route components
  const { indexImport, notFoundImport, indexComponent, notFoundComponent } = extractRouteComponents(appContent);

  if (!indexComponent && !notFoundComponent) {
    return {
      success: false,
      backupPath: null,
      message: 'Could not find Index or NotFound components in App.tsx. Please ensure you have <Route path="/" ...> and/or <Route path="*" ...>'
    };
  }

  if (dryRun) {
    logInfo(`[DRY RUN] Would patch ${appPath}`);
    return { success: true, backupPath: null };
  }

  // Generate AppRoutes.tsx
  generateAppRoutes(consumerDir, basePath, indexImport, notFoundImport, indexComponent, notFoundComponent, appPath, false);

  // Patch App.tsx
  const backupPath = writeFileSafe(appPath, ''); // Will be overwritten below
  
  const lines = appContent.split('\n');
  
  // Ensure BrowserRouter is imported
  let hasBrowserRouterImport = false;
  let reactRouterImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes('from') && line.includes('react-router-dom')) {
      reactRouterImportIndex = i;
      if (line.includes('BrowserRouter')) {
        hasBrowserRouterImport = true;
      }
    }
  }
  
  // Add or update BrowserRouter import
  if (!hasBrowserRouterImport) {
    if (reactRouterImportIndex >= 0) {
      // Update existing react-router-dom import to include BrowserRouter
      const existingLine = lines[reactRouterImportIndex];
      // Check if it's a named import
      if (existingLine.includes('{') && existingLine.includes('}')) {
        // Add BrowserRouter to the named imports
        const updatedLine = existingLine.replace(/\{([^}]+)\}/, (match, imports) => {
          const importList = imports.split(',').map((s: string) => s.trim());
          if (!importList.includes('BrowserRouter')) {
            importList.push('BrowserRouter');
          }
          return `{ ${importList.join(', ')} }`;
        });
        lines[reactRouterImportIndex] = updatedLine;
      } else {
        // Default import, add named import for BrowserRouter
        lines.splice(reactRouterImportIndex + 1, 0, `import { BrowserRouter } from "react-router-dom";`);
      }
    } else {
      // No react-router-dom import, add it
      const importLine = `import { BrowserRouter } from "react-router-dom";`;
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
  // (This is a simple check - could be enhanced)
  if (!newContent.match(/<Routes[^>]*>/g) && !newContent.match(/<Route[^>]*>/g)) {
    newContent = newContent.replace(/import\s+{[^}]*Routes[^}]*}\s+from\s+["']react-router-dom["'];?\n?/g, '');
    newContent = newContent.replace(/import\s+{[^}]*Route[^}]*}\s+from\s+["']react-router-dom["'];?\n?/g, '');
  }

  writeFileSafe(appPath, newContent);
  
  logSuccess(`Patched ${appPath} (backup: ${backupPath})`);
  
  return { success: true, backupPath };
}
