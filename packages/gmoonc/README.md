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

## Supabase Integration

### Setup Supabase Auth + RBAC

```bash
npx gmoonc supabase --vite
```

This command:
- Installs `@supabase/supabase-js` dependency
- Generates Supabase client, env validation, and RBAC helpers
- Creates/updates `.env.example` with Supabase variables
- Automatically patches existing code to use Supabase provider

### Seed Database

After setting up Supabase integration, seed your database with the complete schema:

```bash
npx gmoonc supabase-seed --vite
```

**Prerequisites:**
- `gmoonc` must be installed (`npx gmoonc`)
- `supabase --vite` must have been executed
- `.env.local` must contain `SUPABASE_DB_URL` (connection string from Supabase Dashboard → Settings → Database)

**What it does:**
- Executes SQL files in order: tables → functions/triggers → RLS → seed data
- Creates marker file `.gmoonc/supabase-seed.json` to prevent duplicate execution
- One-shot by default (delete marker to re-seed)

**To get `SUPABASE_DB_URL`:**
1. Go to your Supabase project dashboard
2. Navigate to Settings → Database
3. Copy the "Connection string (URI)"
4. Add to `.env.local` as: `SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

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

### 0.0.24
- **New:** `supabase-add-admin --email <email> --vite` command to create admin users
- **Enhanced:** `supabase-seed --vite` now automatically creates default admin user (`neil@goalmoon.com`)
- **New:** Admin credentials are saved to `.gmoonc/admin-credentials.json` (auto-added to `.gitignore`)
- **New:** Strong password generation (20 characters) for admin users
- **New:** Automatic RBAC linking (administrator role) for created admin users

### 0.0.23
- Fix: Improved package root detection for SQL files in supabase-seed command
- Fix: Added validation to check SQL files exist before attempting to copy
- Fix: Better error messages showing where SQL files are being searched
- Fix: SQL files are now correctly located when package is installed from npm

### 0.0.22
- Feature: New `supabase-seed --vite` command to seed Supabase database
- Feature: Automatic SQL file execution (tables, functions, RLS, seed data)
- Feature: One-shot protection with marker file
- Feature: SQL files copied to project for transparency
- Feature: SUPABASE_DB_URL added to .env.example

### 0.0.21
- Fix: Navigate import now always added when route protection is present in GMooncAppLayout.tsx
- Fix: Improved Navigate import detection - checks for route protection code, not just usage
- Fix: More robust regex matching for react-router-dom imports (handles both single and double quotes)

### 0.0.20
- Fix: Navigate import now always added to GMooncAppLayout.tsx when patching
- Fix: Improved Navigate import detection and addition logic

### 0.0.19
- Fix: Added Navigate import to GMooncAppLayout.tsx template
- Fix: Corrected route protection order - isLoading checked before isAuthenticated
- Fix: Automatic update of all session context imports to use GMooncSupabaseSessionProvider
- Fix: All components now use Supabase provider instead of mock context

### 0.0.18
- Fix: env.ts no longer throws when .env is missing - only logs warning
- Fix: client.ts import corrected - hasSupabaseEnv imported from env.ts
- Fix: GMooncSupabaseSessionProvider imports corrected - hasSupabaseEnv from env.ts
- Fix: createMissingEnvClient improved - more robust mock client
- Fix: GMooncAppLayout route protection added - redirects to /login when not authenticated
- Fix: All imports in generated files now without .js suffix
- Fix: client.ts syntax error fixed - removed extra closing brace

### 0.0.17
- Feature: New `supabase --vite` command to setup Supabase integration
- Feature: Supabase Auth + RBAC integration with session provider
- Feature: Automatic installation of @supabase/supabase-js dependency
- Feature: Generated Supabase client, env validation, and RBAC helpers
- Feature: Automatic patching of existing code to use Supabase provider
- Feature: .env.example creation/update with Supabase variables

### 0.0.16
- Fix: Removed "farm" references from message forms - changed "Company/Farm" to "Company" throughout
- Fix: Updated field name from `empresa_fazenda`/`company_farm` to `company` in all message-related components
- Fix: Updated placeholder text from "Your company or farm name" to "Your company name"
- Fix: Updated notification template variables from `{{company_farm}}` to `{{company}}`

### 0.0.15
- Feature: Complete Account page implementation (equivalent to Sicoop reference)
- Feature: Personal Information, Account Security, and Change Email sections
- Feature: Password strength indicator and recommendations
- Feature: Responsive grid layout (desktop: 1+2 columns, mobile: stack)

### 0.0.14
- Fix: Auth pages now have proper theme scoping (gmoonc-root class added)
- Fix: Logo uses Vite-friendly import instead of public path

### 0.0.13
- Fix: Logo navigation to basePath (dynamic, not hardcoded)
- Fix: Submenu item colors (dark, legible text)
- Fix: UserEdit page styles aligned with reference
- Fix: Account page completed with proper styling
- Fix: Permissions modals typography using CSS tokens

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
