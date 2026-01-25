import { join } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { logInfo, logSuccess, logError, logWarning } from './logger.js';
import { ensureDirectoryExists } from './fs.js';

// Default admin email for seed
const DEFAULT_ADMIN_EMAIL = 'neil@goalmoon.com';

/**
 * Generate a strong password (16-24 characters)
 */
export function generateStrongPassword(): string {
  const length = 20;
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude I and O (confusing)
  const lowercase = 'abcdefghijkmnpqrstuvwxyz'; // Exclude l and o (confusing)
  const digits = '23456789'; // Exclude 0, 1 (confusing)
  const symbols = '!@#$%&*';
  
  const allChars = uppercase + lowercase + digits + symbols;
  
  // Ensure at least one of each type
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += digits[Math.floor(Math.random() * digits.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Get Supabase Admin client using service role key
 */
function getSupabaseAdminClient(projectDir: string): { client: SupabaseClient | null; error?: string } {
  // Load environment variables
  config({ path: join(projectDir, '.env') });
  config({ path: join(projectDir, '.env.local') });
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl) {
    return {
      client: null,
      error: 'VITE_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is not set in .env or .env.local'
    };
  }
  
  if (!serviceRoleKey) {
    return {
      client: null,
      error: 'SUPABASE_SERVICE_ROLE_KEY is not set in .env or .env.local'
    };
  }
  
  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
  
  return { client };
}

/**
 * Ensure admin user exists in Supabase Auth and RBAC
 * @param projectDir - Project directory
 * @param email - Admin email
 * @param password - Optional password (auto-generated if not provided)
 * @param updatePasswordIfExists - If true, update password even if user exists (default: false for seed, true for add-admin)
 */
export async function ensureAdminUser(
  projectDir: string,
  email: string,
  password?: string,
  updatePasswordIfExists: boolean = false
): Promise<{ success: boolean; email?: string; password?: string; error?: string }> {
  const { client, error } = getSupabaseAdminClient(projectDir);
  
  if (!client || error) {
    logError(error || 'Failed to create Supabase admin client');
    logError('');
    logError('To get the service role key:');
    logError('1. Go to your Supabase project dashboard');
    logError('2. Navigate to Settings → API');
    logError('3. Copy the "service_role" key (keep it secret!)');
    logError('4. Add it to .env.local as:');
    logError('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
    logError('');
    logError('⚠️  This is a server-only variable (no VITE_ prefix)');
    return { success: false, error: error || 'Failed to create admin client' };
  }
  
  // Generate password if not provided
  const adminPassword = password || generateStrongPassword();
  
  try {
    // Check if user already exists in Auth
    const { data: existingUsers, error: listError } = await client.auth.admin.listUsers();
    
    if (listError) {
      logError(`Failed to list users: ${listError.message}`);
      return { success: false, error: listError.message };
    }
    
    const existingUser = existingUsers?.users?.find(u => u.email === email);
    
    let userId: string;
    
    if (existingUser) {
      userId = existingUser.id;
      
      if (updatePasswordIfExists) {
        // Update password if explicitly requested (from supabase-add-admin command)
        logWarning(`User ${email} already exists in Supabase Auth`);
        logInfo('Updating password...');
        
        const { error: updateError } = await client.auth.admin.updateUserById(
          existingUser.id,
          { password: adminPassword }
        );
        
        if (updateError) {
          logError(`Failed to update password: ${updateError.message}`);
          return { success: false, error: updateError.message };
        }
        
        logSuccess('Password updated successfully');
        // Continue to ensure profile has admin role
      } else {
        // Don't reset password automatically (from seed command)
        logWarning(`User ${email} already exists in Supabase Auth`);
        logInfo('Skipping password update (user already exists)');
        logInfo('To generate a new password, use: npx gmoonc supabase-add-admin --email ' + email + ' --vite');
        
        // Return success but without password (user needs to use supabase-add-admin)
        // Still ensure profile has admin role below
      }
    } else {
      // Create new user
      logInfo(`Creating admin user: ${email}`);
      
      const { data: newUser, error: createError } = await client.auth.admin.createUser({
        email,
        password: adminPassword,
        email_confirm: true
      });
      
      if (createError) {
        logError(`Failed to create user: ${createError.message}`);
        return { success: false, error: createError.message };
      }
      
      if (!newUser.user) {
        logError('User creation returned no user data');
        return { success: false, error: 'User creation failed' };
      }
      
      userId = newUser.user.id;
      logSuccess('Admin user created in Supabase Auth');
    }
    
    // Ensure profile exists with administrator role
    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = not found
      logError(`Failed to check profile: ${profileError.message}`);
      return { success: false, error: profileError.message };
    }
    
    if (!profile) {
      // Create profile
      logInfo('Creating profile with administrator role...');
      const { error: insertError } = await client
        .from('profiles')
        .insert({
          id: userId,
          email,
          name: email.split('@')[0], // Use email prefix as name
          role: 'administrator'
        });
      
      if (insertError) {
        logError(`Failed to create profile: ${insertError.message}`);
        return { success: false, error: insertError.message };
      }
      
      logSuccess('Profile created with administrator role');
    } else if (profile.role !== 'administrator') {
      // Update role to administrator
      logInfo('Updating profile role to administrator...');
      const { error: updateError } = await client
        .from('profiles')
        .update({ role: 'administrator' })
        .eq('id', userId);
      
      if (updateError) {
        logError(`Failed to update profile role: ${updateError.message}`);
        return { success: false, error: updateError.message };
      }
      
      logSuccess('Profile role updated to administrator');
    } else {
      logInfo('Profile already has administrator role');
    }
    
    // Return password only if it was generated/updated
    return {
      success: true,
      email,
      password: existingUser && !updatePasswordIfExists ? undefined : adminPassword
    };
    
  } catch (error: any) {
    logError(`Error ensuring admin user: ${error.message}`);
    if (error.stack && process.env.DEBUG) {
      console.error(error.stack);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Save admin credentials to file
 */
export function saveAdminCredentials(
  projectDir: string,
  email: string,
  password: string
): void {
  const credentialsDir = join(projectDir, '.gmoonc');
  const credentialsPath = join(credentialsDir, 'admin-credentials.json');
  
  ensureDirectoryExists(join(credentialsDir, 'dummy'));
  
  const credentials = {
    email,
    password,
    generatedAt: new Date().toISOString(),
    warning: '⚠️ Keep this file secure and do not commit it to version control'
  };
  
  writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2), 'utf-8');
  logSuccess(`Credentials saved to: ${credentialsPath}`);
}

/**
 * Patch .gitignore to exclude admin-credentials.json
 */
export function patchGitignore(projectDir: string): void {
  const gitignorePath = join(projectDir, '.gitignore');
  const entry = '.gmoonc/admin-credentials.json';
  
  if (!existsSync(gitignorePath)) {
    // Create .gitignore if it doesn't exist
    writeFileSync(gitignorePath, `${entry}\n`, 'utf-8');
    logSuccess('Created .gitignore and added admin-credentials.json');
    return;
  }
  
  const gitignoreContent = readFileSync(gitignorePath, 'utf-8');
  
  if (gitignoreContent.includes(entry)) {
    // Already exists
    return;
  }
  
  // Add entry to .gitignore
  const newContent = gitignoreContent.trim() + '\n' + entry + '\n';
  writeFileSync(gitignorePath, newContent, 'utf-8');
  logSuccess('Added admin-credentials.json to .gitignore');
}

/**
 * Print admin credentials in a clear format
 */
export function printAdminCredentials(
  email: string,
  password: string,
  basePath: string = '/app'
): void {
  logSuccess('\n✅ Admin created/updated successfully!\n');
  logInfo('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  logInfo('📧 Email:');
  logInfo(`   ${email}`);
  logInfo('');
  logInfo('🔑 Password:');
  logInfo(`   ${password}`);
  logInfo('');
  logInfo('🌐 Login URL:');
  logInfo(`   http://localhost:5173/login`);
  logInfo('');
  logInfo('📊 Dashboard:');
  logInfo(`   ${basePath}`);
  logInfo('');
  logInfo('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  logWarning('⚠️  Change the password after first login.');
  logInfo('');
}

/**
 * Ensure default admin user after seed (called from supabase-seed)
 */
export async function ensureDefaultAdminAfterSeed(
  projectDir: string,
  basePath: string = '/app'
): Promise<{ success: boolean }> {
  logInfo('\n👤 Ensuring default admin user...');
  
  const result = await ensureAdminUser(projectDir, DEFAULT_ADMIN_EMAIL);
  
  if (!result.success) {
    logError('Failed to create default admin user');
    logError('You can create an admin manually using:');
    logError('  npx gmoonc supabase-add-admin --email your@email.com --vite');
    return { success: false };
  }
  
  // Save credentials only if password was generated (new user)
  if (result.email && result.password) {
    saveAdminCredentials(projectDir, result.email, result.password);
    patchGitignore(projectDir);
    printAdminCredentials(result.email, result.password, basePath);
  } else if (result.email) {
    // User already exists - just inform
    logInfo(`\n✅ Default admin user already exists: ${result.email}`);
    logInfo('To generate a new password, use:');
    logInfo(`  npx gmoonc supabase-add-admin --email ${result.email} --vite`);
  }
  
  return { success: true };
}
