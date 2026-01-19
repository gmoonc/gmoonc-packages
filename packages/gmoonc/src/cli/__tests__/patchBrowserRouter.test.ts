import { readFileSync } from 'fs';
import { join } from 'path';
import { patchBrowserRouter } from '../lib/patchBrowserRouter.js';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';

const FIXTURES_DIR = join(__dirname, '../__fixtures__');
const TEST_DIR = join(__dirname, '../../../../test-temp-browserrouter');

describe('patchBrowserRouter - BrowserRouter import', () => {
  beforeEach(() => {
    // Clean test directory
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
    mkdirSync(join(TEST_DIR, 'src'), { recursive: true });
  });

  afterEach(() => {
    // Clean up
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  test('should add BrowserRouter import when missing', () => {
    const fixture = readFileSync(join(FIXTURES_DIR, 'App-without-browserrouter.tsx'), 'utf-8');
    const appPath = join(TEST_DIR, 'src/App.tsx');
    writeFileSync(appPath, fixture);

    const result = patchBrowserRouter(TEST_DIR, '/app', false);

    expect(result.success).toBe(true);
    const patched = readFileSync(appPath, 'utf-8');
    expect(patched).toContain('import { BrowserRouter');
    expect(patched).toContain('from "react-router-dom"');
    expect(patched).toContain('<BrowserRouter>');
  });

  test('should not duplicate BrowserRouter import when already present', () => {
    const fixture = readFileSync(join(FIXTURES_DIR, 'App-with-browserrouter.tsx'), 'utf-8');
    const appPath = join(TEST_DIR, 'src/App.tsx');
    writeFileSync(appPath, fixture);

    const result = patchBrowserRouter(TEST_DIR, '/app', false);

    expect(result.success).toBe(true);
    const patched = readFileSync(appPath, 'utf-8');
    const browserRouterImports = (patched.match(/import.*BrowserRouter.*from.*react-router-dom/g) || []).length;
    expect(browserRouterImports).toBe(1);
  });

  test('should add BrowserRouter to existing react-router-dom import', () => {
    const fixture = readFileSync(join(FIXTURES_DIR, 'App-with-routes-only.tsx'), 'utf-8');
    const appPath = join(TEST_DIR, 'src/App.tsx');
    writeFileSync(appPath, fixture);

    const result = patchBrowserRouter(TEST_DIR, '/app', false);

    expect(result.success).toBe(true);
    const patched = readFileSync(appPath, 'utf-8');
    expect(patched).toContain('import { BrowserRouter, Routes, Route }');
    expect(patched).toContain('from "react-router-dom"');
  });

  test('should preserve single quotes when adding import', () => {
    const fixture = readFileSync(join(FIXTURES_DIR, 'App-single-quotes.tsx'), 'utf-8');
    const appPath = join(TEST_DIR, 'src/App.tsx');
    writeFileSync(appPath, fixture);

    const result = patchBrowserRouter(TEST_DIR, '/app', false);

    expect(result.success).toBe(true);
    const patched = readFileSync(appPath, 'utf-8');
    // Should use single quotes if the file uses single quotes
    const browserRouterImport = patched.match(/import.*BrowserRouter.*from.*react-router-dom[^;]*/)?.[0];
    expect(browserRouterImport).toBeTruthy();
    // Check that it matches the quote style (this is a basic check)
    if (fixture.includes("'react-router-dom'")) {
      expect(browserRouterImport).toContain("'react-router-dom'");
    }
  });

  test('should be idempotent - running twice does not duplicate', () => {
    const fixture = readFileSync(join(FIXTURES_DIR, 'App-without-browserrouter.tsx'), 'utf-8');
    const appPath = join(TEST_DIR, 'src/App.tsx');
    writeFileSync(appPath, fixture);

    // First run
    const result1 = patchBrowserRouter(TEST_DIR, '/app', false);
    expect(result1.success).toBe(true);

    // Second run should fail because already patched (GMooncAppRoutes exists)
    const result2 = patchBrowserRouter(TEST_DIR, '/app', false);
    expect(result2.success).toBe(false);
    expect(result2.message).toContain('already uses GMooncAppRoutes');

    // But if we check the import, it should still have only one BrowserRouter
    const patched = readFileSync(appPath, 'utf-8');
    const browserRouterImports = (patched.match(/import.*BrowserRouter.*from.*react-router-dom/g) || []).length;
    expect(browserRouterImports).toBe(1);
  });
});
