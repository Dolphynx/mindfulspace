import type { NextConfig } from "next";
import path from "node:path";

/**
 * Détection de l'environnement Windows.
 * (process.platform renvoie "win32" sous Windows)
 */
const isWindows = process.platform === "win32";

/**
 * Configuration Next.js adaptée au monorepo et au build Docker.
 * - Standalone désactivé sur Windows pour éviter les erreurs de symlink (EPERM)
 * - Actif sur Linux (CI/CD, VPS)
 */
const nextConfig: NextConfig = {
    /**
     * En prod (CI, Docker) => output standalone pour une image légère.
     * En dev local sous Windows => désactivé pour éviter les erreurs de symlink.
     */
    ...(isWindows ? {} : { output: "standalone" }),

    /**
     * IMPORTANT: ne pas échouer le build à cause d’ESLint en prod.
     * Les vérifications lint se font en CI ou en local uniquement.
     */
    eslint: {
        ignoreDuringBuilds: true,
    },

    /**
     * Turbopack: définir un root ABSOLU pour le monorepo.
     * (__dirname = apps/frontend-next)
     */
    turbopack: {
        root: path.resolve(__dirname, "../../"),
    },

    /**
     * Optionnel: optimisation pour le tracing des dépendances
     * (utile quand output=standalone est actif sur Linux/Docker)

    experimental: {
        outputFileTracingRoot: path.join(__dirname, "../../"),
    },*/
};

export default nextConfig;
