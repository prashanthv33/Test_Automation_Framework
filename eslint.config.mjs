import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      'allure-results/**',
      'allure-report/**',
      'blob-report/**',
      '.features-gen/**',
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ['tests/**/*.ts', 'templates/**/*.ts', 'src/steps/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // Page objects expose assertion helpers named expectXxx() (e.g. expectLoaded).
      'playwright/expect-expect': ['error', { assertFunctionPatterns: ['^expect[A-Z]'] }],
    },
  },
  {
    // Cucumber step definitions are not test blocks, but expect() is valid there.
    files: ['src/steps/**/*.ts'],
    rules: { 'playwright/no-standalone-expect': 'off' },
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
);
