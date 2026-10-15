import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  base: '/monde-pour-miroir/',
  root: 'client',
  publicDir: 'public',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'client/src') } },
  build: { outDir: '../dist', emptyOutDir: true },
});
