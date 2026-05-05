import config from '@superdsp/eslint-config';

export default config(
  {
    ignores: ['dist', 'src/generated/**'],
  },
  // 告知 ESLint parser 目前啟用了 emitDecoratorMetadata 與 experimentalDecorators，
  // 讓 ts/consistent-type-imports 規則自動跳過含有 decorator 的檔案（controller、service、module 等），
  // 避免 ESLint auto-fix 將 class import 改成 import type，導致 NestJS DI 在 runtime 無法解析依賴。
  // 參考：https://typescript-eslint.io/blog/changes-to-consistent-type-imports-with-decorators/
  {
    languageOptions: {
      parserOptions: {
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
      },
    },
  },
  {
    rules: {
      'node/prefer-global/process': 'off',
    },
  },
);
