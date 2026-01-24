import { join, dirname } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { Client } from 'pg';
import { config } from 'dotenv';
import { logInfo, logSuccess, logError, logWarning } from './logger.js';
import { ensureDirectoryExists } from './fs.js';

// Get package root (go up from dist/cli/lib to packages/gmoonc)
// In runtime, this will be dist/cli/lib, so we go up 3 levels
// In development, this will be src/cli/lib, so we go up 3 levels
function getPackageRoot(): string {
  // Try to resolve from current file location
  // In CommonJS, __dirname is available
  try {
    // @ts-ignore - __dirname is available in CommonJS context
    const currentDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();
    // Go up from dist/cli/lib or src/cli/lib to packages/gmoonc
    return join(currentDir, '../../..');
  } catch {
    // Fallback: assume we're in node_modules/gmoonc
    return join(process.cwd(), 'node_modules', 'gmoonc');
  }
}

const PACKAGE_ROOT = getPackageRoot();

export interface SupabaseSeedOptions {
  projectDir: string;
  dryRun: boolean;
}

export async function seedSupabase(options: SupabaseSeedOptions): Promise<{ success: boolean; message?: string }> {
  const { projectDir, dryRun } = options;

  try {
    // Load environment variables from .env and .env.local
    config({ path: join(projectDir, '.env') });
    config({ path: join(projectDir, '.env.local') });

    // Check if gmoonc is installed
    const gmooncDir = join(projectDir, 'src/gmoonc');
    if (!existsSync(gmooncDir)) {
      logError('gmoonc is not installed. Run "npx gmoonc" first.');
      return { success: false, message: 'gmoonc not installed' };
    }

    // Check if supabase --vite was executed (check for supabase directory)
    const supabaseDir = join(gmooncDir, 'supabase');
    if (!existsSync(supabaseDir)) {
      logError('Supabase integration not found. Run "npx gmoonc supabase --vite" first.');
      return { success: false, message: 'Supabase not set up' };
    }

    // Check for marker file (one-shot protection)
    const markerPath = join(projectDir, '.gmoonc', 'supabase-seed.json');
    if (existsSync(markerPath)) {
      logError('supabase-seed already executed in this project.');
      logError('To re-seed, delete the marker file: .gmoonc/supabase-seed.json');
      logError('Then manually clean the database in Supabase before re-running.');
      return { success: false, message: 'Already seeded' };
    }

    // Check for SUPABASE_DB_URL
    const dbUrl = process.env.SUPABASE_DB_URL;
    if (!dbUrl) {
      logError('SUPABASE_DB_URL is not set in .env or .env.local');
      logError('');
      logError('To get the connection string:');
      logError('1. Go to your Supabase project dashboard');
      logError('2. Navigate to Settings → Database');
      logError('3. Copy the "Connection string (URI)"');
      logError('4. Add it to .env.local as:');
      logError('   SUPABASE_DB_URL=postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres');
      logError('');
      logError('⚠️  This is a server-only variable (no VITE_ prefix)');
      return { success: false, message: 'SUPABASE_DB_URL not set' };
    }

    if (dryRun) {
      logInfo('🔍 Dry run mode - would execute SQL files');
      return { success: true };
    }

    // SQL files to execute in order
    const sqlFiles = [
      { name: '001_tables.sql', order: 1 },
      { name: '003_functions_triggers.sql', order: 2 },
      { name: '002_rls.sql', order: 3 },
      { name: '004_seed.sql', order: 4 }
    ];

    // Try to find SQL files in project first (src/gmoonc/supabase/sql)
    const projectSqlDir = join(gmooncDir, 'supabase', 'sql');
    const packageSqlDir = join(PACKAGE_ROOT, 'assets', 'supabase');

    // Copy SQL files to project if they don't exist
    if (!existsSync(projectSqlDir)) {
      ensureDirectoryExists(join(projectSqlDir, 'dummy'));
      logInfo('📋 Copying SQL files to project...');
      
      for (const sqlFile of sqlFiles) {
        const packagePath = join(packageSqlDir, sqlFile.name);
        const projectPath = join(projectSqlDir, sqlFile.name);
        
        if (existsSync(packagePath)) {
          const content = readFileSync(packagePath, 'utf-8');
          writeFileSync(projectPath, content, 'utf-8');
          logSuccess(`Copied ${sqlFile.name} to src/gmoonc/supabase/sql/`);
        }
      }
    }

    // Connect to database
    logInfo('\n🔌 Connecting to Supabase database...');
    const client = new Client({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    logSuccess('Connected to database');

    // Execute SQL files in order
    const executedFiles: string[] = [];
    
    for (const sqlFile of sqlFiles) {
      logInfo(`\n📝 Applying ${sqlFile.name}...`);
      
      // Try project SQL first, then fallback to package
      let sqlPath = join(projectSqlDir, sqlFile.name);
      if (!existsSync(sqlPath)) {
        sqlPath = join(packageSqlDir, sqlFile.name);
      }
      
      if (!existsSync(sqlPath)) {
        logError(`SQL file not found: ${sqlFile.name}`);
        await client.end();
        return { success: false, message: `SQL file not found: ${sqlFile.name}` };
      }

      const sql = readFileSync(sqlPath, 'utf-8');
      
      try {
        // Execute in transaction
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        
        executedFiles.push(sqlFile.name);
        logSuccess(`✓ Applied ${sqlFile.name}`);
      } catch (error: any) {
        await client.query('ROLLBACK');
        
        // Extract error context
        const errorMessage = error.message || 'Unknown error';
        const errorPosition = error.position ? ` at position ${error.position}` : '';
        
        logError(`✗ Failed to apply ${sqlFile.name}${errorPosition}`);
        logError(`Error: ${errorMessage}`);
        
        // Try to show SQL context around error
        if (error.position && sql) {
          const lines = sql.split('\n');
          const charPos = error.position;
          let currentPos = 0;
          let errorLine = 0;
          
          for (let i = 0; i < lines.length; i++) {
            currentPos += lines[i].length + 1; // +1 for newline
            if (currentPos >= charPos) {
              errorLine = i + 1;
              break;
            }
          }
          
          if (errorLine > 0) {
            const start = Math.max(0, errorLine - 3);
            const end = Math.min(lines.length, errorLine + 2);
            logError('\nSQL context around error:');
            for (let i = start; i < end; i++) {
              const marker = i === errorLine - 1 ? '>>> ' : '    ';
              logError(`${marker}${i + 1}: ${lines[i]}`);
            }
          }
        }
        
        await client.end();
        return { success: false, message: `SQL execution failed: ${sqlFile.name}` };
      }
    }

    await client.end();
    logSuccess('\n✅ All SQL files applied successfully');

    // Create marker file
    const markerDir = join(projectDir, '.gmoonc');
    ensureDirectoryExists(join(markerDir, 'dummy'));
    
    // Get gmoonc version from package.json
    const packageJsonPath = join(PACKAGE_ROOT, 'package.json');
    let version = '0.0.22';
    try {
      if (existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        version = packageJson.version || version;
      }
    } catch {
      // Use default version
    }

    const markerContent = JSON.stringify({
      version,
      executedAt: new Date().toISOString(),
      files: executedFiles
    }, null, 2);
    
    writeFileSync(markerPath, markerContent, 'utf-8');
    logSuccess('Created marker file: .gmoonc/supabase-seed.json');

    return { success: true };

  } catch (error: any) {
    logError(`Error: ${error.message}`);
    if (error.stack && process.env.DEBUG) {
      console.error(error.stack);
    }
    return { success: false, message: error.message };
  }
}
