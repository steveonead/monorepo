import config from '@superdsp/eslint-config';

export default config(
  // antfu config
  {
    ignores: ['dist', 'build', 'coverage', 'node_modules', 'AGENTS.md'],
  },
  // 複寫強制使用 alias 的規則，因為這個 package 是給其他 package 使用的，不能使用 alias。
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    rules: {
      '@dword-design/import-alias/prefer-alias': 'off',
    },
  },
);
