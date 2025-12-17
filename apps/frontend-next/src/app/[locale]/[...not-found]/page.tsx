/**
 * Localized 404 (Server)
 * ----------------------
 * Cette page attrape toutes les routes inconnues sous `/[locale]/*`.
 *
 * IMPORTANT (Next TS):
 * - Une page Next (`page.tsx`) ne peut accepter que `{ params, searchParams }`.
 * - On calcule la locale ici, puis on la passe à un composant client.
 * - Next.js 15+ requires params to be awaited
 */

import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import LocalizedNotFoundClient from "./LocalizedNotFoundClient";

type PageProps = {
    params: Promise<{
        locale: string;
        // le catch-all existe mais on n'en a pas besoin
        // "not-found"?: string[];
    }>;
};

export default async function Page({ params }: PageProps) {
    const resolvedParams = await params;
    const locale: Locale = isLocale(resolvedParams.locale) ? resolvedParams.locale : defaultLocale;
    return <LocalizedNotFoundClient locale={locale} />;
}
