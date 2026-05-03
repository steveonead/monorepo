import type { Awaitable, OptionsConfig, TypedFlatConfigItem } from '@antfu/eslint-config';
import type { Linter } from 'eslint';
import type { FlatConfigComposer } from 'eslint-flat-config-utils';
import antfu from '@antfu/eslint-config';

export type ConfigOptions = OptionsConfig & Omit<TypedFlatConfigItem, 'files'>;

export type UserConfig = Awaitable<
  TypedFlatConfigItem | TypedFlatConfigItem[] | FlatConfigComposer<any, any> | Linter.Config[]
>;

export default function config(options: ConfigOptions = {}, ...userConfigs: UserConfig[]) {
  return antfu(
    {
      typescript: true,
      stylistic: false,
      javascript: {
        overrides: {
          'sort-imports': 'off',
          'no-console': 'off',
          'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
          'unused-imports/no-unused-vars': ['warn'],
          'unused-imports/no-unused-imports': 'off',
          'no-nested-ternary': 'error',
          'no-empty': ['error', { allowEmptyCatch: false }],
          'max-params': ['error', { max: 3 }],
        },
      },
      ...options,
    },

    {
      files: ['package.json'],
      rules: {
        'pnpm/json-enforce-catalog': 'off',
      },
    },

    ...userConfigs,
  );
}
