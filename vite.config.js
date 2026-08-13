import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html',
        terms: 'terms.html',
        privacy: 'privacy.html',
      }
    }
  },
  server: {
    port: 3000
  }
});