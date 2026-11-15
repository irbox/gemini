import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.VITE_BASE || '/gemini/',
  root: '.',
  server: {
    port: 3000,
    open: false,
    host: '0.0.0.0'
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext'
  }
});
