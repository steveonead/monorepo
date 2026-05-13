import { resolve } from 'node:path';
import { defineConfig } from 'tsdown';

export default defineConfig((options) => ({
  entry: ['src/**/*.ts', '!src/**/*.test.ts', '!src/**/*.spec.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: !options.watch,
  inputOptions: {
    resolve: {
      alias: {
        '@': resolve('src'),
      },
    },
  },
}));
