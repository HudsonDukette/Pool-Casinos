import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@workspace/api-client-react',
        replacement: path.resolve(__dirname, 'lib/api-client-react/src/index.ts')
      }
    ]
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});