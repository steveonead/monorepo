import { resolve } from 'node:path';
import process from 'node:process';
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/**/*.ts', '!src/**/*.test.ts', '!src/**/*.spec.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: process.env.NODE_ENV !== 'production',
  inputOptions: {
    resolve: {
      alias: {
        '@': resolve('src'),
      },
    },
  },
});
