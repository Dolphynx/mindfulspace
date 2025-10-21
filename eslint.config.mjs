// eslint.config.mjs (RACINE)
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextConfig from 'eslint-config-next';

// Limiter la config Next au dossier front
const nextForFrontend = nextConfig().map(cfg => ({
    ...cfg,
    files: ['apps/frontend-next/**/*.{js,jsx,ts,tsx}'],
}));

export default [
    // ---- Ignorer partout les artefacts ET les tests API
    {
        ignores: [
            '**/node_modules/**',
            '**/dist/**',
            '**/.next/**',
            '**/coverage/**',
            '**/build/**',
            '**/.turbo/**',
            '**/.vercel/**',

            // Ignorer les tests Nest pour éviter les conflits avec le type-check
            'apps/api-nest/test/**',
            'apps/api-nest/src/**/*.spec.ts',
            'apps/api-nest/**/*.e2e-spec.ts',
        ],
    },

    // ---- Base JS pour tout le repo
    js.configs.recommended,

    // ---- FRONT (Next.js) limité au dossier front
    ...nextForFrontend,

    // --- API (NestJS) — code applicatif AVEC type-check (tests exclus)
    ...tseslint.config({
        files: ['apps/api-nest/src/**/*.ts'],
        ignores: ['apps/api-nest/src/**/*.spec.ts'],
        extends: [...tseslint.configs.recommendedTypeChecked],
        languageOptions: {
            parserOptions: {
                // Tsconfig dédié qui n'inclut QUE src/**
                project: 'apps/api-nest/tsconfig.eslint.json',
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/consistent-type-imports': 'warn',
        },
    }),
];
