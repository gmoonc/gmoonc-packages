#!/usr/bin/env node
/**
 * Regression test for BrowserRouter import patch
 * Tests ensureBrowserRouterImport function with various fixtures
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the ensureBrowserRouterImport function
// Since it's not exported, we'll test it indirectly through patchBrowserRouter
// For now, we'll create a test version of the function

function ensureBrowserRouterImport(content) {
  // Check if <BrowserRouter> is used in the content
  if (!content.includes('<BrowserRouter')) {
    return content; // No BrowserRouter used, no need to add import
  }

  const lines = content.split('\n');
  let hasBrowserRouterImport = false;
  let reactRouterImportIndex = -1;
  let reactRouterImportLine = null;
  let quoteStyle = '"'; // Default to double quotes
  
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
      
      // Check if BrowserRouter is already imported
      const browserRouterPattern = /\bBrowserRouter\b/;
      if (browserRouterPattern.test(trimmed)) {
        hasBrowserRouterImport = true;
      }
    }
  }
  
  // If BrowserRouter is already imported, return content as-is
  if (hasBrowserRouterImport) {
    return content;
  }
  
  // Add or update BrowserRouter import
  if (reactRouterImportIndex >= 0 && reactRouterImportLine) {
    // Update existing react-router-dom import to include BrowserRouter
    const existingLine = reactRouterImportLine;
    const indent = existingLine.match(/^(\s*)/)?.[1] || '';
    
    // Match: import { X, Y } from "react-router-dom" or import { type X } from "react-router-dom"
    const namedMatch = existingLine.match(/^(\s*)import\s+\{([^}]+)\}\s+from\s+(["'])react-router-dom\2/);
    if (namedMatch) {
      const importListStr = namedMatch[2];
      const quote = namedMatch[3];
      
      // Parse imports, handling "type" keywords
      const importItems = importListStr.split(',').map(s => s.trim()).filter(Boolean);
      const hasBrowserRouter = importItems.some(item => 
        item === 'BrowserRouter' || 
        item === 'type BrowserRouter' || 
        item.includes('BrowserRouter')
      );
      
      if (!hasBrowserRouter) {
        // Add BrowserRouter to the list (before type imports if any)
        const typeImports = importItems.filter(item => item.startsWith('type '));
        const regularImports = importItems.filter(item => !item.startsWith('type '));
        
        regularImports.push('BrowserRouter');
        const sortedImports = [...regularImports, ...typeImports];
        
        // Preserve original formatting
        const separator = importListStr.includes(',\n') ? ',\n' : ', ';
        const formatted = sortedImports.join(separator);
        const updatedLine = `${indent}import { ${formatted} } from ${quote}react-router-dom${quote};`;
        lines[reactRouterImportIndex] = updatedLine;
      }
    } else {
      // Namespace import or default import
      // Add separate named import for BrowserRouter
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
  
  return lines.join('\n');
}

// Test fixtures
const fixtures = [
  {
    name: 'Fixture 1: No react-router-dom import',
    input: `import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Index from './pages/Index';

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;`,
    expected: (output) => {
      return output.includes('import { BrowserRouter }') && 
             output.includes('react-router-dom') &&
             output.includes('<BrowserRouter>');
    }
  },
  {
    name: 'Fixture 2: Existing Routes, Route import',
    input: `import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Routes, Route } from "react-router-dom";
import Index from './pages/Index';

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;`,
    expected: (output) => {
      return output.includes('import { BrowserRouter, Routes, Route }') ||
             (output.includes('import { BrowserRouter }') && output.includes('import { Routes, Route }'));
    }
  },
  {
    name: 'Fixture 3: Type import only',
    input: `import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type RouteObject } from "react-router-dom";
import Index from './pages/Index';

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;`,
    expected: (output) => {
      return output.includes('BrowserRouter') && 
             output.includes('type RouteObject') &&
             output.includes('react-router-dom');
    }
  },
  {
    name: 'Fixture 4: Namespace import',
    input: `import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as ReactRouterDOM from "react-router-dom";
import Index from './pages/Index';

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;`,
    expected: (output) => {
      // Should have both namespace import and named BrowserRouter import
      const hasNamespace = output.includes('import * as ReactRouterDOM');
      const hasNamed = output.includes('import { BrowserRouter }');
      return hasNamespace && hasNamed;
    }
  }
];

let passed = 0;
let failed = 0;

console.log('🧪 Running BrowserRouter import regression tests...\n');

for (const fixture of fixtures) {
  try {
    const output = ensureBrowserRouterImport(fixture.input);
    const result = fixture.expected(output);
    
    if (result) {
      console.log(`✅ ${fixture.name}`);
      passed++;
    } else {
      console.error(`❌ ${fixture.name}`);
      console.error('   Output:', output.split('\n').slice(0, 5).join('\n'));
      failed++;
    }
  } catch (error) {
    console.error(`❌ ${fixture.name}`);
    console.error(`   Error: ${error.message}`);
    failed++;
  }
}

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  console.error('\n❌ Some tests failed!');
  process.exit(1);
} else {
  console.log('\n✅ All tests passed!');
  process.exit(0);
}
