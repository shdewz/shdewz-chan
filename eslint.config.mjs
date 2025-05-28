// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylisticTs from '@stylistic/eslint-plugin-ts'

export default tseslint.config({
    files: ['**/*.ts'],
    plugins: {
        '@stylistic/ts': stylisticTs
    },
    extends: [
        eslint.configs.recommended,
        tseslint.configs.recommended,
    ],
    rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
            'warn',
            {
                'argsIgnorePattern': '^_',
                'varsIgnorePattern': '^_',
                'caughtErrorsIgnorePattern': '^_'
            }
        ],
        '@typescript-eslint/no-explicit-any': 'off',
        'no-irregular-whitespace': 'off',
        'eol-last': ['error', 'always'],

        // stylistic
        '@stylistic/ts/indent': ['warn', 4],
        '@stylistic/ts/quotes': ['warn', 'single'],
        '@stylistic/ts/semi': ['error', 'always'],
        '@stylistic/ts/block-spacing': ['warn', 'always'],
    },
});