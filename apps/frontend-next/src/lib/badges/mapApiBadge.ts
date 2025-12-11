import type { BadgeToastItem } from "@/types/badges";

/**
 * Sous-type minimal représentant la structure reçue depuis l'API
 * pour un badge mis en avant.
 *
 * Il correspond au format renvoyé par l'endpoint `/badges/me/highlighted`
 * après flattening côté backend.
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

/**
 * Convertit un objet brut renvoyé par l'API en structure
 * normalisée `BadgeToastItem`, directement exploitable par
 * le système de toasts du front.
 *
 * Comporte plusieurs sécurités :
 * - normalisation de l'ID et du slug en `string`,
 * - fallback cohérent pour `titleKey` et `descriptionKey`,
 * - conversion systématique de `earnedAt` vers un ISO string,
 * - application d'une icône par défaut (`default`) si nécessaire.
 *
 * @param apiBadge Objet brut provenant de l'API.
 * @returns Un objet `BadgeToastItem` prêt à l’utilisation.
 */
export function mapApiBadgeToToastItem(apiBadge: unknown): BadgeToastItem {
    const b = apiBadge as ApiBadgeForToast;

    /**
     * Normalisation de la valeur `earnedAt`.
     * La valeur peut être :
     * - une instance de Date,
     * - une chaîne ISO,
     * - null ou undefined : utilisation d’un fallback.
     */
    const rawEarnedAt = b.userBadge?.earnedAt;
    const earnedAt =
        rawEarnedAt instanceof Date
            ? rawEarnedAt.toISOString()
            : typeof rawEarnedAt === "string"
                ? rawEarnedAt
                : new Date().toISOString();

    return {
        id: String(b.id),
        slug: String(b.slug),

        // fallback : titre = slug si titleKey absent
        titleKey: b.titleKey ?? b.slug,

        // fallback description vide si non fournie
        descriptionKey: b.descriptionKey ?? "",

        // icône : si absente → "default" pour cohérence avec le strip et les toasts
        iconKey: b.iconKey ?? "default",

        earnedAt,
    };
}
