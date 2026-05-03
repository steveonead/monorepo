/** @type {import("prettier").Config} */
export default {
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindFunctions: ['cn', 'clsx', 'cva'],
  printWidth: 100,
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  singleAttributePerLine: true,
};
