import { getDictionary } from "@/i18n/get-dictionary";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

/**
 * Page Domain – Sleep
 * --------------------
 * Page vide prête pour le contenu du domaine "Sommeil".
 *
 * i18n :
 * - Tous les textes viennent du namespace `domainSleep`.
 * - La locale est déterminée via les params `[locale]`.
 */
export default async function SleepPage({
                                            params,
                                        }: {
    params: Promise<{ locale: string }>;
}) {
    // 1️⃣ Récupération de la locale
    const { locale: rawLocale } = await params;
    const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

    // 2️⃣ Chargement du dictionnaire
    const dict = await getDictionary(locale);
    const t = dict.domainSleep;

    return (
        <main className="mx-auto max-w-4xl px-4 py-10 text-brandText">
            <h1 className="text-3xl font-semibold mb-4">{t.title}</h1>
            <p className="text-brandText-soft mb-6">{t.subtitle}</p>

            {/* Zone de contenu — ajoute ton UI ici */}
            <div className="border border-dashed rounded-xl p-6 text-center text-brandText-soft">
                {t.empty}
            </div>
        </main>
    );
}
