import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import checkFile from 'eslint-plugin-check-file';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },

  // Конфігурація для тотального kebab-case всередині папки src
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'check-file': checkFile,
    },
    rules: {
      'check-file/filename-naming-convention': [
        'error',
        {
          // Тепер абсолютно всі файли (.ts та .tsx) мають бути в kebab-case
          '**/*.{ts,tsx}': 'KEBAB_CASE',
        },
        {
          ignoreMiddleExtensions: true, // Пропускає крапки у файлах на кшталт auth.types.ts або button.test.tsx
        },
      ],
      'check-file/folder-naming-convention': [
        'error',
        {
          // Усі папки без винятку теж у нижньому регістрі з дефісами
          'src/**/': 'KEBAB_CASE',
        },
      ],
    },
  },

  eslintConfigPrettier,
]);
