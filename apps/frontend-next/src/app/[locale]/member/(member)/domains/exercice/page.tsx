import { getDictionary } from "@/i18n/get-dictionary";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

/**
 * Page Domain – Exercice
 * -----------------------
 * Page vide prête pour accueillir les exercices physiques ou routines.
 */
export default async function ExercicePage({
                                               params,
                                           }: {
    params: Promise<{ locale: string }>;
}) {
    const { locale: rawLocale } = await params;
    const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

    const dict = await getDictionary(locale);
    const t = dict.domainExercice;

    return (
        <main className="mx-auto max-w-4xl px-4 py-10 text-brandText">
            <h1 className="text-3xl font-semibold mb-4">{t.title}</h1>
            <p className="text-brandText-soft mb-6">{t.subtitle}</p>

            <div className="border border-dashed rounded-xl p-6 text-center text-brandText-soft">
                {t.empty}
            </div>
        </main>
    );
}
