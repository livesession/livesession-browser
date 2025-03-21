import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.js'],
    outDir: 'dist',
    target: 'es6',
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    minify: false,
    skipNodeModulesBundle: false, // Include node_modules in the bundle
    splitting: false,
    bundle: true,
});