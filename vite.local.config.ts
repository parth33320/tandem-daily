import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname, './src/client'),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@': path.resolve(__dirname, './src/client'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: path.resolve(__dirname, './dist/client'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        splash: path.resolve(__dirname, './src/client/splash.html'),
        game: path.resolve(__dirname, './src/client/game.html'),
      },
    },
  },
});