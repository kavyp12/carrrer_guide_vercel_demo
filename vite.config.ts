import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  resolve: {
    mainFields: ['module', 'main'],  // Prefer ESM
  },
  // Remove or comment out proxy for Vercel (keep for local dev if needed)
  // server: {
  //   proxy: {
  //     '/api': {
  //       target: 'http://localhost:3000',
  //       changeOrigin: true
  //     }
  //   }
  // }
});