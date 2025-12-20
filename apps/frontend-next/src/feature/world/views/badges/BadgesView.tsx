"use client";

import { usePathname } from "next/navigation";
import { BadgesList } from "@/components/badges/BadgesList";
import { localeFromPathname, useUserBadges } from "@/components/badges/useUserBadges";

/**
 * Vue “Badges” intégrée au panneau (drawer) du World Hub.
 *
 * Responsabilités :
 * - Déterminer la locale courante à partir de l’URL.
 * - Charger les badges de l’utilisateur via un hook dédié.
 * - Déléguer entièrement le rendu à `BadgesList`.
 *
 * Contraintes d’architecture :
 * - La navigation (retour / fermeture) n’est pas gérée ici.
 *   Elle est prise en charge par `PanelHeader`.
 * - La vue réutilise strictement la même UI que la page “legacy”,
 *   assurant une cohérence visuelle et fonctionnelle.
 *
 * Notes d’intégration :
 * - Le rendu est adapté au contexte du drawer via la prop `variant="drawer"`.
 * - La logique métier liée aux badges reste encapsulée dans
 *   `useUserBadges` et `BadgesList`.
 */
export function BadgesView() {
    const pathname = usePathname();
    const locale = localeFromPathname(pathname);

    /**
     * Chargement des badges utilisateur.
     *
     * Le hook expose :
     * - `badges` : liste des badges à afficher,
     * - `loading` : indicateur de chargement pour l’état UI.
     */
    const { badges, loading } = useUserBadges();

    return (
        <BadgesList
            badges={badges}
            loading={loading}
            locale={locale}
            variant="drawer"
        />
    );
}
