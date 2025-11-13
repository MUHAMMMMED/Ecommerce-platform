import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // اختياري لتسهيل الاستيراد
    },
  },
  esbuild: {
    loader: 'jsx',
    include: /\.js$|\.jsx$/
  },
  build: {
    outDir: 'build', // مهم: يتوافق مع Dockerfile
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    open: true,
  }
});