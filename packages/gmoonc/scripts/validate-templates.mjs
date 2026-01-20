#!/usr/bin/env node

/**
 * validate-templates.mjs
 * 
 * Validates that templates follow the correct patterns:
 * 1. Auth pages must have "gmoonc-root" in their root className
 * 2. GMooncAppLayout must use import for logo, not public path string
 * 3. Logo asset file must exist
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const templatesDir = join(__dirname, '..', 'src', 'templates', 'shared', 'src', 'gmoonc');

let errors = [];

// 1. Check auth pages have gmoonc-root
const authPages = [
  'pages/auth/GMooncLoginPage.tsx',
  'pages/auth/GMooncRegisterPage.tsx',
  'pages/auth/GMooncForgotPasswordPage.tsx',
  'pages/auth/GMooncResetPasswordPage.tsx',
];

authPages.forEach(pagePath => {
  const fullPath = join(templatesDir, pagePath);
  if (!existsSync(fullPath)) {
    errors.push(`❌ Auth page not found: ${pagePath}`);
    return;
  }

  const content = readFileSync(fullPath, 'utf-8');
  
  // Check if the root return element has "gmoonc-root" in className
  // Look for pattern: <div className="gmoonc-root ..." or className="... gmoonc-root ..."
  const hasGmooncRoot = /className\s*=\s*["'][^"']*gmoonc-root[^"']*["']/.test(content);
  
  if (!hasGmooncRoot) {
    errors.push(`❌ ${pagePath}: Missing "gmoonc-root" in root className`);
  }
});

// 2. Check GMooncAppLayout uses import for logo, not public path
const layoutPath = join(templatesDir, 'layout', 'GMooncAppLayout.tsx');
if (!existsSync(layoutPath)) {
  errors.push(`❌ Layout file not found: layout/GMooncAppLayout.tsx`);
} else {
  const content = readFileSync(layoutPath, 'utf-8');
  
  // Check for public path string (should not exist)
  const hasPublicPath = /logoUrl\s*=\s*["']\/gmoonc\/assets\//.test(content);
  if (hasPublicPath) {
    errors.push(`❌ GMooncAppLayout.tsx: Still using public path for logoUrl (should use import)`);
  }
  
  // Check for import statement
  const hasImport = /import\s+.*\s+from\s+['"]\.\.\/assets\/gmoonc-logo\.png['"]/.test(content);
  if (!hasImport) {
    errors.push(`❌ GMooncAppLayout.tsx: Missing import for logo asset`);
  }
}

// 3. Check logo asset exists
const logoPath = join(templatesDir, 'assets', 'gmoonc-logo.png');
if (!existsSync(logoPath)) {
  errors.push(`❌ Logo asset not found: assets/gmoonc-logo.png`);
}

// 4. Check theme.css is scoped to .gmoonc-root
const themePath = join(templatesDir, 'styles', 'theme.css');
if (existsSync(themePath)) {
  const content = readFileSync(themePath, 'utf-8');
  // Check that theme.css contains .gmoonc-root selector (not :root as main scope)
  const hasGmooncRootScope = /\.gmoonc-root\s*\{/.test(content);
  const hasRootScope = /^[^}]*:root\s*\{/.test(content.trim());
  if (!hasGmooncRootScope || hasRootScope) {
    errors.push(`⚠️  theme.css: Should be scoped to .gmoonc-root (not :root)`);
  }
}

// Report results
if (errors.length > 0) {
  console.error('\n❌ Template validation failed:\n');
  errors.forEach(err => console.error(`  ${err}`));
  console.error('\n');
  process.exit(1);
} else {
  console.log('✅ All template validations passed!');
  process.exit(0);
}
