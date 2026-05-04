import config from '@superdsp/eslint-config';
import pluginQuery from '@tanstack/eslint-plugin-query';
import pluginRouter from '@tanstack/eslint-plugin-router';
import pluginCheckFile from 'eslint-plugin-check-file';
import pluginJestDom from 'eslint-plugin-jest-dom';
import pluginTestingLibrary from 'eslint-plugin-testing-library';

export default config(
  {
    react: {
      overrides: {
        'react/no-unstable-default-props': 'error',
        'react/no-unstable-context-value': 'error',
        'react-refresh/only-export-components': [
          'error',
          {
            allowConstantExport: true,
            extraHOCs: [
              'createFileRoute',
              'createLazyFileRoute',
              'createRootRoute',
              'createRootRouteWithContext',
              'createLink',
              'createRoute',
              'createLazyRoute',
            ],
          },
        ],
      },
    },
    ignores: [
      'src/routeTree.gen.ts',
      'src/components/ui/**',
      'e2e',
      '.agents',
      '.claude',
      'dist',
      'mockoon.json',
      '**/*.md/*',
    ],
  },

  // Check file/folder naming convention
  {
    name: 'check-file',
    plugins: {
      'check-file': pluginCheckFile,
    },
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'check-file/filename-naming-convention': [
        'error',
        { '**/!(__)*': 'KEBAB_CASE' },
        { ignoreMiddleExtensions: true },
      ],
      'check-file/folder-naming-convention': ['error', { '**/!(__*)': 'KEBAB_CASE' }],
    },
    ignores: ['src/routes/**/*'],
  },

  // Tanstack plugins
  ...pluginRouter.configs['flat/recommended'],
  ...pluginQuery.configs['flat/recommended'],

  // testing-library + jest-dom — only for component test files
  {
    files: ['src/**/*.test.tsx'],
    ...pluginTestingLibrary.configs['flat/react'],
    ...pluginJestDom.configs['flat/recommended'],
  },
);
