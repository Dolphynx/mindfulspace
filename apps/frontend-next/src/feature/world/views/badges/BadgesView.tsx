"use client";

import { usePathname } from "next/navigation";
import { BadgesList } from "@/components/badges/BadgesList";
import { localeFromPathname, useUserBadges } from "@/components/badges/useUserBadges";

/**
 * Vue "Badges" intégrée au panel SPA.
 *
 * @remarks
 * - Ne gère pas le back/close : c’est le `PanelHeader` qui s’en charge.
 * - Réutilise exactement la même UI que la page legacy (via `BadgesList`).
 */
export function BadgesView() {
    const pathname = usePathname();
    const locale = localeFromPathname(pathname);

    const { badges, loading } = useUserBadges();

    return <BadgesList badges={badges} loading={loading} locale={locale} variant="drawer" />;
}
