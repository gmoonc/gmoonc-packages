import { readFile, writeFileSafe } from './fs.js';

const CSS_IMPORT = 'import "@gmoonc/ui/styles.css";';

export function hasCssImport(content: string): boolean {
  return content.includes(CSS_IMPORT) || 
         content.includes('@gmoonc/ui/styles.css') ||
         content.includes('"@gmoonc/ui/styles.css"') ||
         content.includes("'@gmoonc/ui/styles.css'");
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
    lines.splice(lastImportIndex + 1, 0, CSS_IMPORT);
  } else {
    lines.unshift(CSS_IMPORT);
  }

  const newContent = lines.join('\n');
  const backupPath = writeFileSafe(filePath, newContent);

  return { success: true, backupPath };
}
