# @gmoonc/cli

CLI do Goalmoon Ctrl (gmoonc): install and configure @gmoonc/app in React projects.

## Installation

```bash
npm install @gmoonc/cli
```

## Usage

Run the default command to install and configure @gmoonc/app:

```bash
npx gmoonc
```

The default command will:

1. **Detect your project**: Verify `package.json` exists and identify package manager (npm/pnpm/yarn)
2. **Install dependencies**: Add `@gmoonc/app@^0.0.1` (which includes `@gmoonc/ui` and `@gmoonc/core`) and `react-router-dom@^6.0.0` if needed
3. **Find entrypoint**: Look for `src/main.tsx`, `src/main.jsx`, `src/main.ts` or `src/main.js`
4. **Inject CSS**: Add CSS imports to your entrypoint:
   ```ts
   import "@gmoonc/ui/styles.css";
   import "@gmoonc/app/styles.css";
   ```
5. **Integrate routes**: Automatically patch `createBrowserRouter` to include gmoonc routes (if detected)

### Options

- `--yes` / `-y`: Skip confirmations and install automatically
- `--base <path>`: Base path for dashboard routes (default: `/app`)
- `--skip-router-patch`: Skip automatic router integration (only install and inject CSS)
- `--dry-run`: Show what would be done without making changes

### Examples

```bash
# Default setup with base path /app
npx gmoonc

# Custom base path
npx gmoonc --base /dashboard

# Skip router integration
npx gmoonc --skip-router-patch

# Dry run (see what would be done)
npx gmoonc --dry-run

# Skip confirmations
npx gmoonc --yes
```

### Manual Integration

If automatic router integration is not possible, the CLI will print minimal instructions:

1. Import `createGmooncRoutes` from `@gmoonc/app`
2. Add routes to your router:
   ```ts
   import { createGmooncRoutes } from "@gmoonc/app";
   
   createBrowserRouter([
     ...createGmooncRoutes({ basePath: "/app" }),
     // ... your other routes
   ])
   ```
3. Ensure CSS imports are present in your entrypoint

## Requirements

- Node.js 18+
- Existing React project with `package.json`
- Entrypoint in `src/main.*` (tsx, jsx, ts or js)

## Security

- Existing files are automatically backed up before modification
- Backup format: `file.gmoonc.bak-YYYYMMDDTHHMMSS.ext`
- CSS imports are not duplicated if they already exist

## Site

https://gmoonc.com
