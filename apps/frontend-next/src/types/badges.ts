// types/badges.ts

/**
 * Représentation minimale d’un badge à afficher en toast.
 * On ne garde que ce dont l’UI a vraiment besoin.
 */
export interface BadgeToastItem {
    id: string;
    slug: string;

    titleKey: string;
    descriptionKey: string;
    iconKey: string | null;

    earnedAt: string; // ISO date string
}
