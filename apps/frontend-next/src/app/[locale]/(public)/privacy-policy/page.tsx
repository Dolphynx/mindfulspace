/**
 * Page Politique de confidentialité
 * ---------------------------------
 * Cette page statique décrit la gestion des données personnelles
 * au sein du projet MindfulSpace.
 *
 * Objectifs :
 * - Informer sur les données manipulées dans l’application
 * - Expliquer leur finalité et leur durée de conservation
 * - Rappeler le cadre strictement académique du projet
 *
 * Particularités :
 * - Page 100% statique : aucune logique métier
 * - Destinée à être liée depuis le footer
 * - Rédaction volontairement non commerciale
 *
 * i18n :
 * - Tous les textes sont extraits du dictionnaire `privacyPolicyPage`
 * - Compatible avec la structure dynamique `[locale]` de Next.js
 */

import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

/**
 * Composant de page : `/[locale]/privacy-policy`
 *
 * Notes :
 * - Server Component (pas de "use client")
 * - La locale est déterminée à partir des params dynamiques
 * - Le dictionnaire est chargé côté serveur
 */
export default async function PrivacyPolicyPage({
                                                    params,
                                                }: {
    params: Promise<{ locale: string }>;
}) {
    const { locale: rawLocale } = await params;
    const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

    const dict = await getDictionary(locale);
    const t = dict.privacyPolicyPage;

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

            {/** SECTION 1 : Champ d’application -------------------------------- */}
            <h2 className="text-xl font-semibold mt-6 mb-2 text-brandText">
                {t.section1Title}
            </h2>
            <p className="text-brandText-soft mb-4">
                {t.section1Text}
            </p>

            {/** SECTION 2 : Données collectées --------------------------------- */}
            <h2 className="text-xl font-semibold mt-6 mb-2 text-brandText">
                {t.section2Title}
            </h2>
            <p className="text-brandText-soft mb-4">
                {t.section2Text}
            </p>

            {/** SECTION 3 : Finalité du traitement ----------------------------- */}
            <h2 className="text-xl font-semibold mt-6 mb-2 text-brandText">
                {t.section3Title}
            </h2>
            <p className="text-brandText-soft mb-4">
                {t.section3Text}
            </p>

            {/** SECTION 4 : Durée de conservation ------------------------------ */}
            <h2 className="text-xl font-semibold mt-6 mb-2 text-brandText">
                {t.section4Title}
            </h2>
            <p className="text-brandText-soft mb-4">
                {t.section4Text}
            </p>

            {/** SECTION 5 : Partage des données -------------------------------- */}
            <h2 className="text-xl font-semibold mt-6 mb-2 text-brandText">
                {t.section5Title}
            </h2>
            <p className="text-brandText-soft mb-4">
                {t.section5Text}
            </p>

            {/** SECTION 6 : Droits des utilisateurs ---------------------------- */}
            <h2 className="text-xl font-semibold mt-6 mb-2 text-brandText">
                {t.section6Title}
            </h2>
            <p className="text-brandText-soft mb-4">
                {t.section6Text}
            </p>

            {/** SECTION 7 : Contact -------------------------------------------- */}
            <h2 className="text-xl font-semibold mt-6 mb-2 text-brandText">
                {t.section7Title}
            </h2>
            <p className="text-brandText-soft">
                {t.section7Text}{" "}
                <strong className="text-brandText">
                    contact@mindfulspace.be
                </strong>
            </p>
        </main>
    );
}
