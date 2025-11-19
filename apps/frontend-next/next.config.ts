import type { NextConfig } from "next";
import * as path from "node:path";
//import withPWA from "next-pwa";

/**
 * Détection de l'environnement Windows.
 * (process.platform renvoie "win32" sous Windows)
 */
const isWindows = process.platform === "win32";
const isExport = process.env.NEXT_OUTPUT === "export";

/*const withPWAConfig = withPWA({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: false,
});/*


/**
 * Configuration Next.js adaptée au monorepo et au build Docker.
 * - Standalone désactivé sur Windows pour éviter les erreurs de symlink (EPERM)
 * - Actif sur Linux (CI/CD, VPS)
 */
const nextConfig: NextConfig = {

    reactStrictMode: true,

    /**
     * En prod (CI, Docker) => output standalone pour une image légère.
     * En dev local sous Windows => désactivé pour éviter les erreurs de symlink.
     */
    //...(isWindows ? {} : { output: "standalone" }),
    ...(isExport
        ? { output: "export" } // for Capacitor
        : !isWindows
            ? { output: "standalone" } // for Docker/prod
            : {}),


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
//module.exports = withPWA(nextConfig);
//export default withPWAConfig(nextConfig);
