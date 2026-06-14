const { defineConfig, globalIgnores } = require('eslint/config');

const tsParser = require('@typescript-eslint/parser');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const prettier = require('eslint-plugin-prettier');
const preferArrow = require('eslint-plugin-prefer-arrow');
const globals = require('globals');
const js = require('@eslint/js');

const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = defineConfig([
  {
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',

      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
      },

      globals: {
        ...globals.node,
      },
    },

    plugins: {
      '@typescript-eslint': typescriptEslint,
      prettier,
      'prefer-arrow': preferArrow,
    },

    extends: compat.extends(
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier',
    ),

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
  },
  globalIgnores([
    '**/node_modules',
    '**/dist',
    '**/*.log',
    '**/.env',
    '**/.cache',
    '**/.bun',
    '**/coverage',
  ]),
]);
