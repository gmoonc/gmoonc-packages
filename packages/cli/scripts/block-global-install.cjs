#!/usr/bin/env node

// Block global installation of @gmoonc/cli
const isGlobal = process.env.npm_config_global === 'true' || 
                 process.env.npm_config_location === 'global' ||
                 process.env.npm_config_prefix && 
                 (process.env.npm_config_prefix.includes('nvm') || 
                  process.env.npm_config_prefix.includes('node_modules'));

if (isGlobal) {
  console.error('\n❌ Do not install @gmoonc/cli globally.');
  console.error('\n   Install locally in your project:');
  console.error('   npm install @gmoonc/cli');
  console.error('\n   Then run:');
  console.error('   npx gmoonc');
  console.error('');
  process.exit(1);
}
