import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

const MOCKOON_PREFIX_REGEX = /^\/mockoon/;
const API_PREFIX_REGEX = /^\/api/;

export default defineConfig(({ mode }) => {
  console.log(mode);

  return {
    plugins: [
      tailwindcss(),
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
      }),
      react(),
      babel({ presets: [reactCompilerPreset({ compilationMode: 'annotation' })] }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5011,
      proxy: {
        '/mockoon': {
          target: 'http://localhost:3133',
          changeOrigin: true,
          rewrite: (path) => path.replace(MOCKOON_PREFIX_REGEX, ''),
        },
        '/api': {
          target: 'http://localhost:5012',
          changeOrigin: true,
          rewrite: (path) => path.replace(API_PREFIX_REGEX, ''),
        },
      },
    },
  };
});
