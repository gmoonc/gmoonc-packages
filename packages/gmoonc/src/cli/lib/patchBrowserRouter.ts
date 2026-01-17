import { readFile, writeFileSafe, ensureDirectoryExists } from './fs.js';
import { existsSync } from 'fs';
import { join } from 'path';
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
  // Try to find <Route path="/" element={<Index />} />
  const indexRouteMatch = appContent.match(/<Route\s+path=["']\/["']\s+element=\{<(\w+)\s*\/?>\}\s*\/?>/);
  const indexComponent = indexRouteMatch ? indexRouteMatch[1] : null;

  // Try to find <Route path="*" element={<NotFound />} />
  const notFoundRouteMatch = appContent.match(/<Route\s+path=["']\*["']\s+element=\{<(\w+)\s*\/?>\}\s*\/?>/);
  const notFoundComponent = notFoundRouteMatch ? notFoundRouteMatch[1] : null;

  // Extract imports for these components
  let indexImport: string | null = null;
  let notFoundImport: string | null = null;

  const lines = appContent.split('\n');
  
  if (indexComponent) {
    // Find import line that contains the component name
    for (const line of lines) {
      if (line.includes('import') && line.includes(indexComponent)) {
        indexImport = line.trim();
        break;
      }
    }
  }

  if (notFoundComponent) {
    // Find import line that contains the component name
    for (const line of lines) {
      if (line.includes('import') && line.includes(notFoundComponent)) {
        notFoundImport = line.trim();
        break;
      }
    }
  }

  return { indexImport, notFoundImport, indexComponent, notFoundComponent };
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
    "import { useRoutes } from 'react-router-dom';",
    "import { createGmooncRoutes } from './createGmooncRoutes';"
  ];

  if (indexImport) {
    imports.push(indexImport);
  }
  if (notFoundImport) {
    imports.push(notFoundImport);
  }

  const content = `${imports.join('\n')}

export function GMooncAppRoutes({ basePath = "${basePath}" }: { basePath?: string }) {
  const allRoutes = [
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
  generateAppRoutes(consumerDir, basePath, indexImport, notFoundImport, indexComponent, notFoundComponent, false);

  // Patch App.tsx
  const backupPath = writeFileSafe(appPath, ''); // Will be overwritten below
  
  // Add import for GMooncAppRoutes
  const importLine = `import { GMooncAppRoutes } from "./gmoonc/router/AppRoutes";`;
  
  const lines = appContent.split('\n');
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
