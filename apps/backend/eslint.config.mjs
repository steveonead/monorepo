import config from '@superdsp/eslint-config';
import path from 'node:path';

function createPreferAliasRule(aliases) {
  return {
    meta: {
      type: 'suggestion',
      fixable: 'code',
      messages: {
        useAlias: "Use '{{fixed}}' instead of '{{source}}'",
      },
      schema: [],
    },
    create(context) {
      return {
        ImportDeclaration(node) {
          const source = node.source.value;
          if (!source.startsWith('.')) return;

          const absImport = path.resolve(path.dirname(context.filename), source);

          for (const [aliasName, aliasDir] of Object.entries(aliases)) {
            const absAlias = path.resolve(context.cwd, aliasDir);
            if (absImport.startsWith(absAlias + path.sep) || absImport === absAlias) {
              const rel = path.relative(absAlias, absImport).replaceAll('\\', '/');
              const fixed = `${aliasName}/${rel}`;
              context.report({
                node: node.source,
                messageId: 'useAlias',
                data: { fixed, source },
                fix: (fixer) => fixer.replaceText(node.source, `'${fixed}'`),
              });
              break;
            }
          }
        },
      };
    },
  };
}

export default config(
  {
    ignores: ['dist', 'src/generated/**'],
  },
  {
    plugins: {
      local: { rules: { 'prefer-alias': createPreferAliasRule({ '@': './src' }) } },
    },
    rules: {
      'local/prefer-alias': 'error',
    },
  },
);
