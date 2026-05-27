import process from 'node:process';

import type { Awaitable, OptionsConfig, TypedFlatConfigItem } from '@antfu/eslint-config';
import type { Linter } from 'eslint';
import type { FlatConfigComposer } from 'eslint-flat-config-utils';
import antfu from '@antfu/eslint-config';
import pluginImportAlias from '@dword-design/eslint-plugin-import-alias';
import eslintConfigPrettier from 'eslint-config-prettier';

export type ConfigOptions = OptionsConfig & Omit<TypedFlatConfigItem, 'files'>;

export type UserConfig = Awaitable<
  TypedFlatConfigItem | TypedFlatConfigItem[] | FlatConfigComposer<any, any> | Linter.Config[]
>;

export default function config(options: ConfigOptions = {}, ...userConfigs: UserConfig[]) {
  return antfu(
    {
      vue: false,
      formatters: false,
      stylistic: false,
      javascript: {
        overrides: {
          'sort-imports': 'off',
          'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
          'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
          'unused-imports/no-unused-vars': [
            'warn',
            { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
          ],
          'unused-imports/no-unused-imports': 'off',
          'no-nested-ternary': 'error',
          'no-empty': ['error', { allowEmptyCatch: false }],
          'max-params': ['error', { max: 3 }],
          eqeqeq: ['error', 'always'],
        },
      },
      typescript: {
        overrides: {
          'ts/consistent-type-definitions': ['error', 'type'],
          'ts/consistent-type-imports': [
            'error',
            { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
          ],
          'ts/no-explicit-any': 'error',
          'ts/no-dynamic-delete': 'error',
          'no-restricted-syntax': [
            'error',
            {
              selector: 'TSEnumDeclaration',
              message: 'Use `as const` objects instead of enums.',
            },
          ],
          'ts/no-non-null-assertion': 'error',
        },
      },
      test: {
        overrides: {
          'test/max-nested-describe': ['error', { max: 3 }],
        },
      },
      e18e: {
        overrides: {
          'e18e/prefer-array-to-sorted': 'error',
          'e18e/prefer-array-to-reversed': 'error',
          'e18e/prefer-array-to-spliced': 'error',
        },
      },

      ...options,
    },

    // Sort imports with perfectionist
    {
      files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      rules: {
        'perfectionist/sort-exports': ['error', { order: 'asc', type: 'natural' }],
        'perfectionist/sort-imports': [
          'error',
          {
            groups: [
              'type-import',
              ['value-builtin', 'value-external'],
              'type-internal',
              'value-internal',
              ['type-parent', 'type-sibling', 'type-index'],
              ['value-parent', 'value-sibling', 'value-index'],
              'side-effect',
              'unknown',
            ],
            newlinesBetween: 1,
            order: 'asc',
            type: 'natural',
          },
        ],
        'perfectionist/sort-named-exports': [
          'error',
          {
            groups: [
              'type-import',
              ['value-builtin', 'value-external'],
              'type-internal',
              'value-internal',
              ['type-parent', 'type-sibling', 'type-index'],
              ['value-parent', 'value-sibling', 'value-index'],
              'side-effect',
              'unknown',
            ],
            newlinesBetween: 1,
            order: 'asc',
            type: 'natural',
          },
        ],
        'perfectionist/sort-named-imports': ['error', { order: 'asc', type: 'natural' }],
      },
    },

    {
      files: ['package.json'],
      rules: {
        'pnpm/json-enforce-catalog': 'off',
      },
    },

    pluginImportAlias.configs.recommended,
    {
      files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      rules: {
        '@dword-design/import-alias/prefer-alias': ['error', { aliasForSubpaths: true }],
      },
    },

    ...userConfigs,
  ).append(eslintConfigPrettier);
}
