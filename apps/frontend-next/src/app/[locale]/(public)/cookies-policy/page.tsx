/**
 * Page Politique de cookies
 * -------------------------
 * Cette page statique décrit la gestion des cookies au sein du projet MindfulSpace.
 *
 * Objectifs :
 * - Informer l’utilisateur sur les cookies utilisés (essentiels, analytiques, personnalisation)
 * - Expliquer le fonctionnement du consentement dans l’application
 * - Rappeler que le projet ne collecte aucune donnée réelle (cadre académique)
 *
 * Particularités :
 * - Page 100% statique : pas de logique métier ni d’interaction.
 * - Rédigée pour accompagner la bannière de consentement présente dans le frontend.
 * - Utilise exclusivement des classes TailwindCSS pour la mise en forme.
 *
 * i18n :
 * - Tous les textes sont extraits du dictionnaire `cookiesPolicyPage`.
 * - Adaptée à la structure dynamique `[locale]` de Next.js 15.
 */

import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

/**
 * Composant de page : `/[locale]/cookies-policy`
 *
 * Notes :
 * - Server Component (pas de "use client")
 * - La locale est déterminée à partir des params dynamiques.
 * - Le dictionnaire est chargé côté serveur pour de meilleures performances.
 */
export default async function CookiesPolicyPage({
                                                    params,
                                                }: {
    params: Promise<{ locale: string }>;
}) {
    // Récupération asynchrone de la locale
    const { locale: rawLocale } = await params;
    const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

    // Chargement du dictionnaire correspondant
    const dict = await getDictionary(locale);
    const t = dict.cookiesPolicyPage;

    return (
        /**
         * Conteneur principal :
         * - `max-w-3xl mx-auto` : largeur limitée et centrage
         * - `px-4 py-10`        : marges internes confortables
         * - `text-sm leading-relaxed` : lisibilité optimale pour du texte juridique
         */
        <main className="max-w-3xl mx-auto px-4 py-10 text-sm text-brandText leading-relaxed">

            {/** -----------------------------------------------------------------
             * TITRE PRINCIPAL
             * Sert d’en-tête à la page.
             * ------------------------------------------------------------------ */}
            <h1 className="text-2xl font-semibold mb-4 text-brandText">
                {t.title}
            </h1>

            {/**
             * Introduction générale
             * ----------------------
             * Explique le cadre académique du projet et l’absence de collecte
             * commerciale ou réelle de données.
             */}
            <p className="mb-4 text-brandText-soft">
                {t.intro}
            </p>

            {/** SECTION 1 : Définition -------------------------------------------------- */}
            <h2 className="text-xl font-semibold mt-6 mb-2 text-brandText">
                {t.section1Title}
            </h2>
            <p className="text-brandText-soft mb-4">
                {t.section1Text}
            </p>

            {/** SECTION 2 : Types de cookies ------------------------------------------- */}
            <h2 className="text-xl font-semibold mt-6 mb-2 text-brandText">
                {t.section2Title}
            </h2>

            <ul className="list-disc pl-6 space-y-2 text-brandText-soft mb-4">
                <li>
                    <strong className="text-brandText">{t.section2EssentialTitle}</strong>{" "}
                    {t.section2EssentialDesc}
                </li>
                <li>
                    <strong className="text-brandText">{t.section2AnalyticsTitle}</strong>{" "}
                    {t.section2AnalyticsDesc}
                </li>
                <li>
                    <strong className="text-brandText">{t.section2PersonalizationTitle}</strong>{" "}
                    {t.section2PersonalizationDesc}
                </li>
            </ul>

            {/** SECTION 3 : Consentement ------------------------------------------------ */}
            <h2 className="text-xl font-semibold mt-6 mb-2 text-brandText">
                {t.section3Title}
            </h2>
            <p className="text-brandText-soft mb-4">
                {t.section3Text}
            </p>

            {/** SECTION 4 : Données personnelles --------------------------------------- */}
            <h2 className="text-xl font-semibold mt-6 mb-2 text-brandText">
                {t.section4Title}
            </h2>
            <p className="text-brandText-soft mb-4">
                {t.section4Text}
            </p>

            {/** SECTION 5 : Contact ----------------------------------------------------- */}
            <h2 className="text-xl font-semibold mt-6 mb-2 text-brandText">
                {t.section5Title}
            </h2>
            <p className="text-brandText-soft">
                {t.section5Text}{" "}
                <strong className="text-brandText">contact@mindfulspace.be</strong>
            </p>
        </main>
    );
}
