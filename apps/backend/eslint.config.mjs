import config from '@superdsp/eslint-config'

export default config({
  typescript: { tsconfigPath: './tsconfig.json' },
  ignores: ['dist', 'src/generated/**'],
})
