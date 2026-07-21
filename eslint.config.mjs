import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'
import importeslint from 'eslint-plugin-import'

export default defineConfig({
  files: ['**/*.{ts,tsx}'],
  plugins: {
    '@typescript-eslint': tseslint.plugin,
    import: importeslint,
  },
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { fixStyle: 'separate-type-imports' },
    ],
    '@typescript-eslint/no-import-type-side-effects': 'error',
    'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
  },
})
