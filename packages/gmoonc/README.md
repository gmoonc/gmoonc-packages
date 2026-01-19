# gmoonc

Goalmoon Ctrl (gmoonc): Complete dashboard installer for React projects.

## Installation

```bash
npm install gmoonc
```

## Usage

After installing, run the installer in your React project root:

```bash
npx gmoonc
```

The installer runs automatically without prompts. Works on all platforms (Windows, macOS, Linux).

With custom base path:

```bash
npx gmoonc --base /dashboard
```

## What it does

1. **Copies dashboard templates** to `src/gmoonc/` in your project
2. **Installs required dependencies** (react-router-dom, lucide-react, etc.)
3. **Injects CSS** into your entrypoint (`src/main.tsx` or similar)
4. **Patches your router** (BrowserRouter) to integrate gmoonc routes

## Options

- `--base <path>`: Base path for dashboard routes (default: `/app`)
- `--skip-router-patch`: Skip automatic router integration (only copy files and inject CSS)
- `--dry-run`: Show what would be done without making changes

## After installation

Your dashboard is now available at:
- Home: `/app`
- Admin: `/app/admin/*`
- Auth: `/login`, `/register`, etc.

The dashboard code is in `src/gmoonc/` and is independent. You can remove `gmoonc` from `package.json` if desired.

## Changelog

### 0.0.9
- Fix: ensure BrowserRouter import when patched into App.tsx

### 0.0.8
- Fix: BIN corrected to use CommonJS (.cjs) for Windows compatibility
- Fix: Router patch now ensures BrowserRouter import is always present
- Fix: Route order corrected (NotFound "*" route is always last)

## Uninstalling

To remove gmoonc:

1. Remove the CSS import from your entrypoint
2. Revert changes to `App.tsx` (or restore from backup)
3. Delete `src/gmoonc/` directory
4. Remove `gmoonc` from `package.json`

## License

MIT
