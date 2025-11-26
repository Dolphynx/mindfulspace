/**
 * Page d’entrée de l’espace member : /[locale]/member
 *
 * Comportement :
 * - Lit la locale à partir du segment dynamique [locale]
 * - Récupère les préférences utilisateur via `getUserPrefs()`
 * - Redirige vers la bonne page en incluant la locale :
 *     • /[locale]/member/seance/respiration si launchBreathingOnStart === true
 *     • /[locale]/member/dashboard sinon
 *
 * Aucun UI n’est rendu : cette page est purement une route de décision.
 */

import { redirect } from "next/navigation";
import { getUserPrefs } from "@/lib";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

export default async function Entry({
                                        params,
                                    }: {
    params: Promise<{ locale: string }>;
}) {
    // 1️⃣ Récupérer et sécuriser la locale depuis l’URL
    const { locale: rawLocale } = await params;
    const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

    // 2️⃣ Récupère les préférences utilisateur depuis l’API Nest
    const prefs = await getUserPrefs();

    // 3️⃣ Redirection conditionnelle, en tenant compte de la locale et du segment /member
    if (prefs.launchBreathingOnStart) {
        redirect(`/${locale}/member/seance/respiration`);
    }

    redirect(`/${locale}/member/dashboard`);

    // Jamais exécuté : redirect() interrompt le rendu SSR
    return null;
}
