module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'prettier', 'prefer-arrow'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  env: { node: true, es2022: true },
  rules: {
    'prettier/prettier': 'error',
    'no-console': 'off',
    'prefer-const': 'error',
    'no-var': 'error',

    'prefer-arrow/prefer-arrow-functions': [
      'warn',
      {
        disallowPrototype: true,
        singleReturnOnly: false,
        classPropertiesAllowed: false,
      },
    ],

    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/no-misused-promises': 'warn',
  },
  ignorePatterns: [
    'node_modules',
    'dist',
    '*.log',
    '.env',
    '.cache',
    '.bun',
    'coverage',
  ],
};
