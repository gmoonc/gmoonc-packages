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

## Customization

### Theme

Edit `src/gmoonc/styles/theme.css` to customize colors, fonts, and spacing. All styles use CSS variables that you can override.

### Logo

The logo is installed at `src/gmoonc/assets/gmoonc-logo.png`. You can replace it with your own logo (recommended size: 600x74px).

## Important Notes

- **One-shot installer**: The installer will abort if `src/gmoonc/` directory or `.gmoonc-installed.json` marker file already exists. To reinstall, remove the directory and restore backups.
- **No prompts**: The installer runs automatically without any flags like `--yes` or `--auto`.

## Changelog

### 0.0.12
- Feature: Logo in menu header (replaces "Home" item)
- Fix: Rename defaultMenu.ts to .tsx (fixes build error with JSX)
- Fix: Profile icon positioning on mobile devices
- Fix: Submenu text colors using CSS tokens
- Fix: Permissions page colors using CSS tokens

### 0.0.11
- Feature: Menu icons (lucide-react) properly rendered
- Fix: Text colors using CSS tokens throughout
- Fix: Typography (Montserrat) applied consistently
- Fix: Profile positioning on tablet

### 0.0.10
- Fix: ensure BrowserRouter import when patched into App.tsx (definitive fix)
- Fix: prevent re-installation if src/gmoonc or marker file exists
- Fix: create marker file (.gmoonc-installed.json) after successful installation

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
