export default {
  '**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx,md,json,jsonc,yaml,yml,toml}':
    'eslint --no-warn-ignored --fix',
  '**/*': 'prettier --write',
};
