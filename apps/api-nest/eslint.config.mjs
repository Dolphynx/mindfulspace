// apps/api-nest/eslint.config.mjs
import tseslint from 'typescript-eslint';

export default [
  // --- Ignorer build & node_modules dans CETTE app
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      // on ignore aussi tout le dossier test ici (il sera géré par le bloc tests)
      'test/**/*.ts',
      'src/**/*.spec.ts',
    ],
  },

  // --- Code applicatif (src/**) AVEC type-check
  ...tseslint.config({
    files: ['src/**/*.ts'], // ⬅️ ne prend QUE le code app
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json', // ⬅️ inclut seulement src/**
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/consistent-type-imports': 'warn',
    },
  }),

  // --- TESTS SANS type-check (src/**/*.spec.ts + test/**)
  ...tseslint.config({
    files: ['src/**/*.spec.ts', 'test/**/*.ts'],
    // pas de Type-Checked ici
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname, // pas de "project"
      },
    },
    rules: {
      // règles de tests
    },
  }),
];
