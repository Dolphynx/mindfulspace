/**
 * Page Offline
 * ------------
 * Cette page est affichée lorsque l'application MindfulSpace
 * n'arrive pas à joindre le serveur (mode hors ligne).
 *
 * Objectifs :
 * - informer calmement l'utilisateur qu'il est hors connexion ;
 * - proposer quelques actions simples (vérifier la connexion, réessayer) ;
 * - rester cohérente avec l'identité visuelle de MindfulSpace.
 *
 * Particularités :
 * - Page purement statique, idéale pour être servie hors-ligne par le Service Worker.
 * - Pas de logique interactive (pas de hooks, pas de "use client").
 */

import PageHero from "@/components/PageHero";
import Link from "next/link";

/**
 * Composant de page : `/offline`
 *
 * @returns Le JSX représentant la page affichée hors-ligne.
 *
 * Notes :
 * - Server Component (aucun état, aucun effet).
 * - Contenu léger pour être facilement mis en cache.
 */
export default function OfflinePage() {
    return (
        /**
         * Conteneur principal :
         * - `text-brandText` : couleur de texte par défaut
         * - `flex flex-col`   : structure verticale comme les autres pages
         */
        <div className="text-brandText flex flex-col min-h-screen bg-brandBackground">
            {/**
             * HERO VISUEL
             * -----------
             * Réutilise le composant PageHero pour garder
             * une mise en page cohérente avec le reste du site.
             */}
            <PageHero
                title="Vous êtes hors connexion"
                subtitle="Certaines fonctionnalités de MindfulSpace ne sont pas disponibles sans internet."
            />

            {/**
             * SECTION PRINCIPALE DU CONTENU
             * ------------------------------
             * Contient deux "cartes" :
             * 1. Explication de la situation + conseils.
             * 2. Rappel que les données restent locales / possibilité de revenir plus tard.
             */}
            <section className="mx-auto max-w-3xl w-full px-4 py-8 space-y-6">

                {/**
                 * PREMIÈRE CARTE : Message principal
                 * ----------------------------------
                 * Donne des indications concrètes à l'utilisateur.
                 */}
                <article className="bg-white border border-brandBorder rounded-card shadow-card p-6">
                    <h2 className="text-xl font-semibold text-brandText mb-2">
                        Impossible de joindre le serveur
                    </h2>

                    <p className="text-sm text-brandText-soft leading-relaxed">
                        MindfulSpace n&apos;arrive pas à se connecter. Cela peut être
                        dû à une coupure de votre connexion internet ou à un problème réseau
                        temporaire.
                    </p>

                    <ul className="mt-4 text-sm text-brandText-soft list-disc list-inside space-y-1">
                        <li>Vérifiez que votre Wi-Fi ou vos données mobiles sont activés.</li>
                        <li>Si possible, rapprochez-vous de votre routeur ou d&apos;une zone de meilleure couverture.</li>
                        <li>Essayez de recharger la page une fois la connexion rétablie.</li>
                    </ul>

                    <p className="mt-4 text-sm text-brandText-soft">
                        Si vous aviez déjà ouvert certaines pages, elles peuvent encore être
                        visibles même hors connexion.
                    </p>
                </article>

                {/**
                 * DEUXIÈME CARTE : Retour à l'application
                 * ---------------------------------------
                 * Permet de revenir facilement au point d'entrée principal
                 * lorsque la connexion revient.
                 */}
                <article className="bg-white border border-brandBorder rounded-card shadow-card p-6">
                    <h3 className="text-lg font-semibold text-brandText mb-2">
                        Revenir à MindfulSpace
                    </h3>

                    <p className="text-sm text-brandText-soft leading-relaxed">
                        Dès que votre connexion est rétablie, vous pouvez revenir au tableau
                        de bord principal pour continuer à suivre vos habitudes de bien-être.
                    </p>

                    <Link
                        href="/"
                        className= "inline-flex mt-4 px-4 py-2 text-sm font-medium rounded-full border border-brandBorder hover:bg-brandSurface transition"
                    >
                        <span>Retour au tableau de bord</span>
                    </Link>

                    <p className="text-2xl mt-4" aria-hidden="true">
                        🌙
                    </p>
                </article>
            </section>
        </div>
    );
}
