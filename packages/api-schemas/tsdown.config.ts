import { resolve } from 'node:path';
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/auth/login.ts', 'src/auth/user.ts', 'src/base/api.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  inputOptions: {
    resolve: {
      alias: {
        '@': resolve('src'),
      },
    },
  },
});
