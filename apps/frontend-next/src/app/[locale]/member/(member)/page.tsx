/**
 * Page d’entrée de l’espace member : /[locale]/member
 *
 * Comportement :
 * - Lit la locale depuis le segment dynamique [locale]
 * - Redirige systématiquement vers :
 *   /[locale]/member/world-v2
 *
 * Aucun UI n’est rendu : cette page est une route de redirection pure.
 */

import { redirect } from "next/navigation";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

export default async function Entry({
                                        params,
                                    }: {
    params: Promise<{ locale: string }>;
}) {
    const { locale: rawLocale } = await params;
    const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

    redirect(`/${locale}/member/world-v2`);
}
