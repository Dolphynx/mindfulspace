/**
 * Localized 404 (Server)
 * ----------------------
 * Cette page attrape toutes les routes inconnues sous `/[locale]/*`.
 *
 * IMPORTANT (Next):
 * - Dans les routes dynamiques, `params` peut être une Promise → il faut l'await.
 * - Une page Next (`page.tsx`) ne peut accepter que `{ params, searchParams }`.
 * - On calcule la locale ici, puis on la passe à un composant client.
 */

import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import LocalizedNotFoundClient from "./LocalizedNotFoundClient";

type PageProps = {
    params: Promise<{
        locale: string;
        // catch-all présent mais inutile ici
        // "not-found"?: string[];
    }>;
};

export default async function Page({ params }: PageProps) {
    const { locale: rawLocale } = await params;

    const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
    return <LocalizedNotFoundClient locale={locale} />;
}
