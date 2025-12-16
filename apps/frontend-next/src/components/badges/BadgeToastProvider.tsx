"use client";

import {
    createContext,
    useState,
    useCallback,
    useContext,
    ReactNode, useEffect,
} from "react";
import type { BadgeToastItem } from "@/types/badges";
import { BadgeToast } from "./BadgeToast";
import { LotusConfetti } from "./LotusConfetti";

/**
 * Structure de la valeur exposée par le contexte BadgeToastContext.
 * Permet à n’importe quel composant enfant d’ajouter un ou plusieurs
 * nouveaux badges à afficher sous forme de toast.
 */
interface BadgeToastContextValue {
    /**
     * Ajoute un ensemble de badges à la file d'affichage.
     *
     * @param badges Tableau de badges à afficher séquentiellement.
     */
    pushBadges: (badges: BadgeToastItem[]) => void;
}

/**
 * Contexte React permettant à l’application de déclencher des toasts
 * d’affichage de badges, sans passer manuellement les props à travers
 * l’arborescence.
 *
 * La valeur par défaut est `undefined`, ce qui permet de détecter un usage
 * du hook `useBadgeToasts()` en dehors du provider.
 */
const BadgeToastContext = createContext<BadgeToastContextValue | undefined>(
    undefined,
);

/**
 * Provider global gérant l’affichage séquentiel de notifications (toasts)
 * lorsqu’un ou plusieurs badges sont remportés.
 *
 * Fonctionnement :
 * - Maintient une file (`queue`) de badges à afficher.
 * - Le premier badge de la file est rendu dans le composant `<BadgeToast>`.
 * - Lorsque l’utilisateur ferme le toast, la fonction `pop` retire l’élément
 *   courant, révélant automatiquement le suivant.
 *
 * Le provider doit encapsuler toute la zone de l’application où l’on souhaite
 * pouvoir déclencher des toasts via `useBadgeToasts()`.
 *
 * @param children Composants enfants faisant partie du scope du provider.
 */
export function BadgeToastProvider({ children }: { children: ReactNode }) {
    /**
     * File d’attente des badges à afficher.
     * Le premier élément est toujours celui actuellement montré.
     */
    const [queue, setQueue] = useState<BadgeToastItem[]>([]);

    /**
     * Ajoute un ou plusieurs badges à la file d'affichage.
     *
     * Utilise `useCallback` pour éviter des recréations inutiles de la fonction,
     * ce qui optimise les dépendances des composants enfants.
     */
    const pushBadges = useCallback((badges: BadgeToastItem[]) => {
        if (!badges || badges.length === 0) return;

        setQueue((prev) => [...prev, ...badges]);
    }, []);

    /**
     * Retire le premier badge de la file.
     * Appelé par le composant `<BadgeToast>` lors de la fermeture.
     */
    const pop = useCallback(() => {
        setQueue((prev) => prev.slice(1));
    }, []);

    const hasActiveToast = queue.length > 0;

    return (
        <BadgeToastContext.Provider value={{ pushBadges }}>
            {children}

            {/* Effet confettis global dès qu’un badge est affiché */}
            <LotusConfetti fire={hasActiveToast} />

            {/* Toast du badge en tête de file */}
            {hasActiveToast && <BadgeToast badge={queue[0]} onClose={pop} />}
        </BadgeToastContext.Provider>
    );
}

/**
 * Hook permettant d’accéder à l’API du système global de toasts.
 *
 * Doit impérativement être utilisé à l’intérieur du `<BadgeToastProvider>`.
 *
 * @throws Error Si le hook est utilisé en dehors du provider.
 * @returns La valeur du contexte, incluant la méthode `pushBadges`.
 */
export function useBadgeToasts(): BadgeToastContextValue {
    const ctx = useContext(BadgeToastContext);

    if (!ctx) {
        throw new Error(
            "useBadgeToasts must be used within a BadgeToastProvider",
        );
    }

    return ctx;
}
