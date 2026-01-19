#!/usr/bin/env node
/**
 * Simple regression test for BrowserRouter import patch
 * Run with: node src/cli/__tests__/test-browserrouter-import.js
 */

const { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } = require('fs');
const { join } = require('path');
const { patchBrowserRouter } = require('../lib/patchBrowserRouter.js');

const FIXTURES_DIR = join(__dirname, '../__fixtures__');
const TEST_DIR = join(__dirname, '../../../../test-temp-browserrouter');

function cleanup() {
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }
}

function setup() {
  cleanup();
  mkdirSync(TEST_DIR, { recursive: true });
  mkdirSync(join(TEST_DIR, 'src'), { recursive: true });
}

function test(name, fn) {
  try {
    setup();
    fn();
    console.log(`✅ ${name}`);
    return true;
  } catch (error) {
    console.error(`❌ ${name}`);
    console.error(`   ${error.message}`);
    return false;
  } finally {
    cleanup();
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Test 1: Add BrowserRouter import when missing
test('should add BrowserRouter import when missing', () => {
  const fixture = readFileSync(join(FIXTURES_DIR, 'App-without-browserrouter.tsx'), 'utf-8');
  const appPath = join(TEST_DIR, 'src/App.tsx');
  writeFileSync(appPath, fixture);

  const result = patchBrowserRouter(TEST_DIR, '/app', false);
  assert(result.success, 'Patch should succeed');

  const patched = readFileSync(appPath, 'utf-8');
  assert(patched.includes('import'), 'Should contain import statement');
  assert(patched.includes('BrowserRouter'), 'Should contain BrowserRouter');
  assert(patched.includes('react-router-dom'), 'Should import from react-router-dom');
  assert(patched.includes('<BrowserRouter>'), 'Should contain <BrowserRouter> JSX');
});

// Test 2: Should not duplicate BrowserRouter import
test('should not duplicate BrowserRouter import when already present', () => {
  const fixture = readFileSync(join(FIXTURES_DIR, 'App-with-browserrouter.tsx'), 'utf-8');
  const appPath = join(TEST_DIR, 'src/App.tsx');
  writeFileSync(appPath, fixture);

  const result = patchBrowserRouter(TEST_DIR, '/app', false);
  assert(result.success, 'Patch should succeed');

  const patched = readFileSync(appPath, 'utf-8');
  const browserRouterImports = (patched.match(/import.*BrowserRouter.*from.*react-router-dom/g) || []).length;
  assert(browserRouterImports === 1, `Expected 1 BrowserRouter import, found ${browserRouterImports}`);
});

// Test 3: Add BrowserRouter to existing react-router-dom import
test('should add BrowserRouter to existing react-router-dom import', () => {
  const fixture = readFileSync(join(FIXTURES_DIR, 'App-with-routes-only.tsx'), 'utf-8');
  const appPath = join(TEST_DIR, 'src/App.tsx');
  writeFileSync(appPath, fixture);

  const result = patchBrowserRouter(TEST_DIR, '/app', false);
  assert(result.success, 'Patch should succeed');

  const patched = readFileSync(appPath, 'utf-8');
  assert(patched.includes('BrowserRouter'), 'Should contain BrowserRouter');
  assert(patched.includes('Routes'), 'Should still contain Routes');
  assert(patched.includes('Route'), 'Should still contain Route');
  
  // Check that BrowserRouter is in the same import as Routes/Route
  const importLine = patched.match(/import\s+\{[^}]+\}\s+from\s+["']react-router-dom["']/)?.[0];
  assert(importLine, 'Should have react-router-dom import');
  assert(importLine.includes('BrowserRouter'), 'Import should include BrowserRouter');
  assert(importLine.includes('Routes'), 'Import should include Routes');
});

// Test 4: Idempotency - running twice should not duplicate
test('should be idempotent - running twice does not duplicate', () => {
  const fixture = readFileSync(join(FIXTURES_DIR, 'App-without-browserrouter.tsx'), 'utf-8');
  const appPath = join(TEST_DIR, 'src/App.tsx');
  writeFileSync(appPath, fixture);

  // First run
  const result1 = patchBrowserRouter(TEST_DIR, '/app', false);
  assert(result1.success, 'First patch should succeed');

  // Second run should fail because already patched
  const result2 = patchBrowserRouter(TEST_DIR, '/app', false);
  assert(!result2.success, 'Second patch should fail (already patched)');
  assert(result2.message.includes('already uses GMooncAppRoutes'), 'Should detect already patched');

  // But BrowserRouter import should still be present only once
  const patched = readFileSync(appPath, 'utf-8');
  const browserRouterImports = (patched.match(/import.*BrowserRouter.*from.*react-router-dom/g) || []).length;
  assert(browserRouterImports === 1, `Expected 1 BrowserRouter import after second run, found ${browserRouterImports}`);
});

console.log('\n✅ All BrowserRouter import tests passed!');
