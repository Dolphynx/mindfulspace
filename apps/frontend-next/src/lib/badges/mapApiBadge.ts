import type { BadgeToastItem } from "@/types/badges";

/**
 * Sous-type minimal de ce que renvoie l'API pour un badge :
 * { ...badgeDefinition, userBadge }
 */
type ApiBadgeForToast = {
    id: string;
    slug: string;
    titleKey: string;
    descriptionKey?: string | null;
    iconKey?: string | null;
    userBadge?: {
        earnedAt?: string | Date | null;
    } | null;
};

export function mapApiBadgeToToastItem(apiBadge: unknown): BadgeToastItem {
    const b = apiBadge as ApiBadgeForToast;

    const earnedAtRaw = b.userBadge?.earnedAt;
    const earnedAt =
        earnedAtRaw instanceof Date
            ? earnedAtRaw.toISOString()
            : typeof earnedAtRaw === "string"
                ? earnedAtRaw
                : new Date().toISOString();

    return {
        id: String(b.id),
        slug: String(b.slug),
        titleKey: b.titleKey ?? b.slug,
        descriptionKey: b.descriptionKey ?? "",
        iconKey: b.iconKey ?? null,
        earnedAt,
    };
}
