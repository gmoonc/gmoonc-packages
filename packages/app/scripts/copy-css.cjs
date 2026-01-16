const fs = require('fs');
const path = require('path');

const srcCss = path.resolve(__dirname, '../src/styles/app.css');
const distCss = path.resolve(__dirname, '../dist/styles.css');
const distDir = path.resolve(__dirname, '../dist');

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy CSS file
if (fs.existsSync(srcCss)) {
  fs.copyFileSync(srcCss, distCss);
  console.log('✓ CSS copied to dist/styles.css');
} else {
  console.warn('⚠️  src/styles/app.css not found, skipping CSS copy');
}
