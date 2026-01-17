#!/usr/bin/env node

// Block global installation of gmoonc
const isGlobal = process.env.npm_config_global === 'true' || 
                 process.env.npm_config_location === 'global' ||
                 process.env.npm_config_prefix && 
                 (process.env.npm_config_prefix.includes('nvm') || 
                  process.env.npm_config_prefix.includes('node_modules'));

if (isGlobal) {
  console.error('\n❌ Do not install gmoonc globally.');
  console.error('\n   Install locally in your project:');
  console.error('   npm install gmoonc');
  console.error('\n   Then run:');
  console.error('   npx gmoonc');
  console.error('');
  process.exit(1);
}
