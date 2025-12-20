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
 *
 * i18n :
 * - Tous les textes utilisateur sont fournis par le dictionnaire `offlinePage`.
 * - La locale est déterminée via le segment dynamique [locale].
 */

import PageHero from "@/components/layout/PageHero";
import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

/**
 * Composant de page : `/[locale]/offline`
 *
 * @returns Le JSX représentant la page affichée hors-ligne.
 *
 * Notes :
 * - Server Component (aucun état, aucun effet).
 * - Contenu léger pour être facilement mis en cache.
 */
export default async function OfflinePage({
                                              params,
                                          }: {
    params: Promise<{ locale: string }>;
}) {
    // Récupération de la locale depuis les paramètres dynamiques
    const { locale: rawLocale } = await params;
    const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

    // Chargement du dictionnaire et extraction du namespace offlinePage
    const dict = await getDictionary(locale);
    const t = dict.offlinePage;

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
                title={t.heroTitle}
                subtitle={t.heroSubtitle}
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
                        {t.card1Title}
                    </h2>

                    <p className="text-sm text-brandText-soft leading-relaxed">
                        {t.card1Intro}
                    </p>

                    <ul className="mt-4 text-sm text-brandText-soft list-disc list-inside space-y-1">
                        <li>{t.card1Item1}</li>
                        <li>{t.card1Item2}</li>
                        <li>{t.card1Item3}</li>
                    </ul>

                    <p className="mt-4 text-sm text-brandText-soft">
                        {t.card1Note}
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
                        {t.card2Title}
                    </h3>

                    <p className="text-sm text-brandText-soft leading-relaxed">
                        {t.card2Text}
                    </p>

                    <Link
                        href={`/${locale}/member/dashboard`}
                        className="inline-flex mt-4 px-4 py-2 text-sm font-medium rounded-full border border-brandBorder hover:bg-brandSurface transition"
                    >
                        <span>{t.card2Button}</span>
                    </Link>

                    <p className="text-2xl mt-4" aria-hidden="true">
                        🌙
                    </p>
                </article>
            </section>
        </div>
    );
}
