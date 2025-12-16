/**
 * Localized 404 (Server)
 * ----------------------
 * Cette page attrape toutes les routes inconnues sous `/[locale]/*`.
 *
 * IMPORTANT (Next TS):
 * - Une page Next (`page.tsx`) ne peut accepter que `{ params, searchParams }`.
 * - On calcule la locale ici, puis on la passe à un composant client.
 */

import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import LocalizedNotFoundClient from "./LocalizedNotFoundClient";

type PageProps = {
    params: {
        locale: string;
        // le catch-all existe mais on n’en a pas besoin
        // "not-found"?: string[];
    };
};

export default function Page({ params }: PageProps) {
    const locale: Locale = isLocale(params.locale) ? params.locale : defaultLocale;
    return <LocalizedNotFoundClient locale={locale} />;
}
