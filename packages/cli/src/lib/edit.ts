import { readFile, writeFileSafe } from './fs.js';

const CSS_IMPORT_UI = 'import "@gmoonc/ui/styles.css";';
const CSS_IMPORT_APP = 'import "@gmoonc/app/styles.css";';

export function hasCssImport(content: string): boolean {
  return content.includes(CSS_IMPORT_UI) || 
         content.includes('@gmoonc/ui/styles.css') ||
         content.includes('"@gmoonc/ui/styles.css"') ||
         content.includes("'@gmoonc/ui/styles.css'");
}

export function hasCssImports(content: string): boolean {
  const hasUI = content.includes('@gmoonc/ui/styles.css') ||
                content.includes('"@gmoonc/ui/styles.css"') ||
                content.includes("'@gmoonc/ui/styles.css'");
  const hasAPP = content.includes('@gmoonc/app/styles.css') ||
                 content.includes('"@gmoonc/app/styles.css"') ||
                 content.includes("'@gmoonc/app/styles.css'");
  return hasUI && hasAPP;
}

export function insertCssImport(filePath: string): { success: boolean; backupPath: string | null } {
  const content = readFile(filePath);

  if (hasCssImport(content)) {
    return { success: false, backupPath: null }; // já existe, não precisa inserir
  }

  // Encontrar onde inserir (após o último import)
  const lines = content.split('\n');
  let lastImportIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('import ') || line.startsWith('import{') || line.startsWith('import\t')) {
      lastImportIndex = i;
    } else if (line && lastImportIndex >= 0 && !line.startsWith('//') && !line.startsWith('/*')) {
      // Encontrou algo que não é import nem comentário após os imports
      break;
    }
  }

  // Inserir após o último import ou no início
  if (lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, CSS_IMPORT_UI);
  } else {
    lines.unshift(CSS_IMPORT_UI);
  }

  const newContent = lines.join('\n');
  const backupPath = writeFileSafe(filePath, newContent);

  return { success: true, backupPath };
}

export function insertCssImports(filePath: string): { success: boolean; backupPath: string | null } {
  const content = readFile(filePath);

  if (hasCssImports(content)) {
    return { success: false, backupPath: null }; // já existem, não precisa inserir
  }

  // Encontrar onde inserir (após o último import)
  const lines = content.split('\n');
  let lastImportIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('import ') || line.startsWith('import{') || line.startsWith('import\t')) {
      lastImportIndex = i;
    } else if (line && lastImportIndex >= 0 && !line.startsWith('//') && !line.startsWith('/*')) {
      // Encontrou algo que não é import nem comentário após os imports
      break;
    }
  }

  // Inserir ambos os imports após o último import ou no início
  const importsToAdd: string[] = [];
  
  const hasUI = content.includes('@gmoonc/ui/styles.css') ||
                content.includes('"@gmoonc/ui/styles.css"') ||
                content.includes("'@gmoonc/ui/styles.css'");
  const hasAPP = content.includes('@gmoonc/app/styles.css') ||
                 content.includes('"@gmoonc/app/styles.css"') ||
                 content.includes("'@gmoonc/app/styles.css'");
  
  if (!hasUI) {
    importsToAdd.push(CSS_IMPORT_UI);
  }
  if (!hasAPP) {
    importsToAdd.push(CSS_IMPORT_APP);
  }

  if (importsToAdd.length === 0) {
    return { success: false, backupPath: null };
  }

  // Inserir após o último import ou no início
  if (lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, ...importsToAdd);
  } else {
    lines.unshift(...importsToAdd);
  }

  const newContent = lines.join('\n');
  const backupPath = writeFileSafe(filePath, newContent);

  return { success: true, backupPath };
}
