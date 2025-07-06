import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import typescriptEslintParser from '@typescript-eslint/parser'
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin'

export default [
  {
    ignores: ['dist', 'dev-dist'],
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: 'detect' } }, // Changed to 'detect'
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'react/prop-types': 'off', // Disable prop-types as we are using TypeScript
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        project: './tsconfig.json', // Re-added this line
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: { ...globals.browser, ...globals.dom, ...globals.jsx }, // Removed CanvasTextAlign
    },
    settings: { react: { version: 'detect' } }, // Changed to 'detect'
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...typescriptEslintPlugin.configs.recommended.rules,
      ...typescriptEslintPlugin.configs['eslint-recommended'].rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Disable rules that conflict with Prettier or are not necessary
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      'react/prop-types': 'off', // Disable prop-types as we are using TypeScript
    },
  },
  {
    files: ['**/*.d.ts'], // New entry for declaration files
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        project: null, // Do not use project for .d.ts files
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: { ...globals.browser, ...globals.dom, ...globals.jsx },
    },
    rules: {
      // Adjust rules for declaration files if needed
      '@typescript-eslint/no-unused-vars': 'off', // Often unused vars in d.ts
      'no-undef': 'off', // Allow global types like JSX
    },
  },
  {
    files: ['server/**/*.js', 'generate-key.js', 'tailwind.config.js', 'vite.config.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      'no-undef': 'off', // Allow require and other node globals
    },
  },
  {
    files: ['public/quagga.worker.js', 'src/service-worker.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: { ...globals.worker, Quagga: true }, // Added Quagga global
    },
    rules: {
      'no-undef': 'off', // Allow Quagga global
    },
  },
  {
    files: ['src/extension-browser-polyfill.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: globals.browser,
    },
    rules: {
      'no-undef': 'off', // Allow chrome global
    },
  },
  {
    files: ['**/*.test.js', '**/*.test.ts'],
    languageOptions: {
      globals: { ...globals.jest, ...globals.browser, global: true }, // Added global for test files
    },
  },
]
