import { readFile, writeFileSafe } from './fs.js';
import { logSuccess } from './logger.js';

export function patchEntryCss(entrypointPath: string, dryRun: boolean): { success: boolean; backupPath: string | null } {
  if (dryRun) {
    return { success: true, backupPath: null };
  }

  const content = readFile(entrypointPath);
  
  // Check if CSS imports already exist
  const hasThemeCss = content.includes('./gmoonc/styles/theme.css') || content.includes('gmoonc/styles/theme.css');
  const hasGmooncCss = content.includes('./gmoonc/styles/gmoonc.css') || content.includes('gmoonc/styles/gmoonc.css');
  
  if (hasThemeCss && hasGmooncCss) {
    logSuccess('CSS imports already exist');
    return { success: true, backupPath: null };
  }

  // Find the last import statement
  const importRegex = /^import\s+.*$/gm;
  const imports = content.match(importRegex) || [];
  
  let newContent = content;
  const cssImports: string[] = [];
  
  if (!hasThemeCss) {
    cssImports.push('import "./gmoonc/styles/theme.css";');
  }
  if (!hasGmooncCss) {
    cssImports.push('import "./gmoonc/styles/gmoonc.css";');
  }
  
  if (imports.length > 0) {
    // Insert after the last import
    const lastImport = imports[imports.length - 1];
    const lastImportIndex = content.lastIndexOf(lastImport);
    const insertIndex = lastImportIndex + lastImport.length;
    
    newContent = 
      content.slice(0, insertIndex) + 
      '\n' + cssImports.join('\n') +
      content.slice(insertIndex);
  } else {
    // No imports found, add at the top
    newContent = cssImports.join('\n') + '\n' + content;
  }

  const backupPath = writeFileSafe(entrypointPath, newContent);
  
  if (backupPath) {
    logSuccess(`CSS import added (backup: ${backupPath})`);
  } else {
    logSuccess('CSS import added');
  }

  return { success: true, backupPath };
}
