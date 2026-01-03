/**
 * Page Mentions légales
 * --------------------
 * Cette page statique présente les informations légales du projet MindfulSpace.
 *
 * Objectifs :
 * - Identifier le cadre académique du projet
 * - Préciser l’éditeur, l’hébergement et la responsabilité
 * - Informer sur l’usage des données et des contenus
 *
 * Particularités :
 * - Page 100% statique (aucune logique métier)
 * - Destinée à être accessible depuis le footer
 * - Rédaction volontairement sobre et non commerciale
 *
 * i18n :
 * - Tous les textes sont extraits du dictionnaire `legalNoticePage`
 * - Compatible avec la structure dynamique `[locale]` de Next.js
 */

import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

/**
 * Composant de page : `/[locale]/legal-notice`
 *
 * Notes :
 * - Server Component (pas de "use client")
 * - La locale est déterminée via les params dynamiques
 * - Le dictionnaire est chargé côté serveur
 */
export default async function LegalNoticePage({
                                                  params,
                                              }: {
    params: Promise<{ locale: string }>;
}) {
    const { locale: rawLocale } = await params;
    const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

    const dict = await getDictionary(locale);
    const t = dict.legalNoticePage;

    return (
        <main className="max-w-3xl mx-auto px-4 py-10 text-sm text-brandText leading-relaxed">
            {/** -----------------------------------------------------------------
             * TITRE PRINCIPAL
             * ------------------------------------------------------------------ */}
            <h1 className="text-2xl font-semibold mb-4 text-brandText">
                {t.title}
            </h1>

            {/** INTRODUCTION ---------------------------------------------------- */}
            <p className="mb-4 text-brandText-soft">
                {t.intro}
            </p>

            {/** SECTION 1 : Éditeur --------------------------------------------- */}
            <h2 className="text-xl font-semibold mt-6 mb-2 text-brandText">
                {t.section1Title}
            </h2>
            <p className="text-brandText-soft mb-4">
                {t.section1Text}
            </p>

            {/** SECTION 2 : Hébergement ----------------------------------------- */}
            <h2 className="text-xl font-semibold mt-6 mb-2 text-brandText">
                {t.section2Title}
            </h2>
            <p className="text-brandText-soft mb-4">
                {t.section2Text}
            </p>

            {/** SECTION 3 : Responsabilité -------------------------------------- */}
            <h2 className="text-xl font-semibold mt-6 mb-2 text-brandText">
                {t.section3Title}
            </h2>
            <p className="text-brandText-soft mb-4">
                {t.section3Text}
            </p>

            {/** SECTION 4 : Propriété intellectuelle ---------------------------- */}
            <h2 className="text-xl font-semibold mt-6 mb-2 text-brandText">
                {t.section4Title}
            </h2>
            <p className="text-brandText-soft mb-4">
                {t.section4Text}
            </p>

            {/** SECTION 5 : Données personnelles -------------------------------- */}
            <h2 className="text-xl font-semibold mt-6 mb-2 text-brandText">
                {t.section5Title}
            </h2>
            <p className="text-brandText-soft mb-4">
                {t.section5Text}
            </p>

            {/** SECTION 6 : Contact --------------------------------------------- */}
            <h2 className="text-xl font-semibold mt-6 mb-2 text-brandText">
                {t.section6Title}
            </h2>
            <p className="text-brandText-soft">
                {t.section6Text}{" "}
                <strong className="text-brandText">
                    contact@mindfulspace.be
                </strong>
            </p>
        </main>
    );
}
