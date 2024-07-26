module.exports = {
  env: {
    node: true,
  },
  extends: ['@solana/eslint-config-solana'],
  ignorePatterns: ['tsup.config.ts', 'env-shim.ts'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/sort-type-constituents': 'off',
    'prefer-destructuring': 'off',
    'simple-import-sort/imports': 'off',
    'sort-keys-fix/sort-keys-fix': 'off',
    'typescript-sort-keys/interface': 'off',
  },
  overrides: [
    {
      // Parse this file itself with espree instead of TypeScript parser.
      files: ['.eslintrc.cjs'],
      parser: 'espree',
      parserOptions: {
        ecmaVersion: 2020,
      },
    },
  ],
};
