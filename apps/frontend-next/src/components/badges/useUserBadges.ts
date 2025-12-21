"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { useWorldHubOptional } from "@/feature/world/hub/WorldHubProvider";

export function stripBadgesNamespace(key?: string | null): string {
    if (!key) return "";
    return key.startsWith("badges.") ? key.slice("badges.".length) : key;
}

export type ApiUserBadgeDto = {
    id: string;
    earnedAt: string;
    metricValueAtEarn: number;
    badge: {
        id: string;
        slug: string;
        titleKey: string;
        descriptionKey: string | null;
        iconKey: string | null;
    };
};

export type UiUserBadge = {
    id: string;
    earnedAt: Date;
    titleKey: string;
    descriptionKey: string | null;
    iconKey: string | null;
    slug: string;
};

export function formatEarnedAt(d: Date, locale: Locale): string {
    try {
        return new Intl.DateTimeFormat(locale, {
            year: "numeric",
            month: "short",
            day: "2-digit",
        }).format(d);
    } catch {
        return d.toLocaleDateString();
    }
}

export function localeFromPathname(pathname: string): Locale {
    const raw = pathname.split("/")[1] || defaultLocale;
    return isLocale(raw) ? raw : defaultLocale;
}

export function useUserBadges() {
    const world = useWorldHubOptional();
    const refreshKey = world?.refreshKey ?? 0;

    const [badges, setBadges] = useState<UiUserBadge[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            try {
                const res = await apiFetch("/badges/me", { cache: "no-store" });

                if (!res.ok) {
                    console.error("[useUserBadges] Unexpected response:", res.status);
                    return;
                }

                const raw = (await res.json()) as unknown;
                if (!Array.isArray(raw)) {
                    console.warn("[useUserBadges] Expected array, got:", raw);
                    return;
                }

                const mapped: UiUserBadge[] = (raw as ApiUserBadgeDto[]).map((ub) => ({
                    id: ub.id,
                    earnedAt: new Date(ub.earnedAt),
                    titleKey: ub.badge?.titleKey ?? "",
                    descriptionKey: ub.badge?.descriptionKey ?? null,
                    iconKey: ub.badge?.iconKey ?? null,
                    slug: ub.badge?.slug ?? "",
                }));

                if (!cancelled) setBadges(mapped);
            } catch (err) {
                console.error("[useUserBadges] Loading error:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [refreshKey]);

    return { badges, loading };
}
