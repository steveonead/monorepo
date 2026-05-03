import config from '@superdsp/eslint-config';

export default config({
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
  typescript: {
    tsconfigPath: './tsconfig.json',
    overridesTypeAware: {
      'ts/no-misused-promises': [
        'error',
        {
          checksVoidReturn: { attributes: false },
        },
      ],
    },
  },
  ignores: ['src/routeTree.gen.ts', 'dist', 'src/components/ui'],
});
