import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  bundle: true,
  treeshake: true,
  external: ['react', 'react-dom', 'react-router-dom'],
  esbuildOptions(options) {
    options.resolveExtensions = ['.tsx', '.ts', '.jsx', '.js', '.json'];
    options.platform = 'browser';
    options.mainFields = ['module', 'main'];
  },
});
