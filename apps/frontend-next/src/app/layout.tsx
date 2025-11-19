/**
 * RootLayout – Layout racine de l’application Next.js
 *
 * Rôle :
 * - Définit la structure HTML globale de l’application.
 * - Définit la configuration des polices (Geist + Geist Mono).
 * - Importe les styles globaux.
 * - Enveloppe toutes les pages dans le composant `AppChrome`,
 *   qui gère la navigation, le footer, la bannière cookies, etc.
 *
 * Fonctionnement Next.js :
 * - Ce fichier correspond à `app/layout.tsx` et s’applique à toutes les routes de l’application.
 * - Le composant doit retourner un document HTML complet (`<html>`, `<body>`).
 * - L’attribut `metadata` est utilisé par Next.js pour générer les balises `<title>`,
 *   `<meta name="description">`, ainsi que d'autres métadonnées SEO.
 *
 * Particularité de MindfulSpace :
 * - Projet d'école non destiné à être indexé → `robots: { index: false, follow: false }`.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/globals.css";

import AppChrome from "@/components/AppChrome";

import ServiceWorkerRegister from "../../pwa/ServiceWorkerRegister";


/**
 * Déclaration des polices utilisées dans l’application.
 * - Next.js gère automatiquement le chargement et l’optimisation.
 * - Chaque police est exposée via une CSS variable.
 */
const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

/**
 * Métadonnées globales appliquées à toutes les pages de l’application.
 * - Titre par défaut + template dynamique.
 * - Description générale.
 * - Bloc robots empêchant l’indexation (application projet étudiant).
 */
export const metadata: Metadata = {
    title: {
        default: "MindfulSpace – Prends soin de ton esprit",
        template: "%s · MindfulSpace",
    },
    description:
        "MindfulSpace t'aide à suivre ton bien-être (sommeil, respiration, méditation) et à développer une routine plus apaisée. Projet étudiant HELMo.",
    robots: {
        index: false,
        follow: false,
    },
    manifest: "/manifest.json",
    themeColor: "#000000",
};

/**
 * Layout racine.
 *
 * @param children – Contenu propre à chaque page.
 *
 * Structure :
 * <html>
 *   <body class="fonts + antialias">
 *     <AppChrome>
 *       {children}
 *     </AppChrome>
 *   </body>
 * </html>
 *
 * - `AppChrome` enveloppe toutes les pages pour ajouter :
 *     • Navbar
 *     • Footer
 *     • Bannière cookies
 *     • Notice globale
 * - Cela garantit une cohérence UI sur tout le site.
 */
export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fr">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <ServiceWorkerRegister/>
        <AppChrome>{children}</AppChrome>
        </body>
        </html>
    );
}
