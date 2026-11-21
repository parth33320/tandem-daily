import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwind()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/client'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/client/__tests__/setup.ts',
    include: ['src/client/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});