"use client";

import {
    createContext,
    useCallback,
    useContext,
    useState,
    type ReactNode,
} from "react";

import type { BadgeToastItem } from "@/types/badges";
import { BadgeToast } from "./BadgeToast";

interface BadgeToastContextValue {
    /**
     * Ajoute un ensemble de badges à la file d’affichage.
     *
     * @remarks
     * Les badges sont affichés séquentiellement dans l’ordre d’insertion.
     *
     * @param badges Tableau de badges à afficher.
     */
    pushBadges: (badges: BadgeToastItem[]) => void;
}

const BadgeToastContext = createContext<BadgeToastContextValue | undefined>(undefined);

/**
 * Provider global d’affichage des badges gagnés sous forme de toasts.
 *
 * @remarks
 * Le provider maintient une file (`queue`) de {@link BadgeToastItem}.
 * Un seul toast est affiché à la fois : le premier élément de la file.
 * À la fermeture d’un toast, l’élément courant est retiré et le suivant devient actif.
 *
 * Ce provider ne déclenche volontairement aucun effet visuel global (ex. confettis).
 * Le déclenchement de confettis est géré au niveau métier via {@link useNotifications}
 * (ou d'autres orchestrateurs), afin d'éviter un burst par toast affiché.
 *
 * @param props Propriétés du provider.
 * @param props.children Arbre de composants pouvant pousser des badges via contexte.
 * @returns Le provider englobant ses enfants et le toast actif.
 */
export function BadgeToastProvider({ children }: { children: ReactNode }) {
    const [queue, setQueue] = useState<BadgeToastItem[]>([]);

    /**
     * Empile des badges dans la file d’affichage.
     *
     * @param badges Tableau de badges à ajouter.
     */
    const pushBadges = useCallback((badges: BadgeToastItem[]) => {
        if (!badges?.length) return;
        setQueue((prev) => [...prev, ...badges]);
    }, []);

    /**
     * Retire le badge en tête de file.
     *
     * @remarks
     * Appelé par le composant {@link BadgeToast} lorsque l’utilisateur ferme le toast.
     */
    const pop = useCallback(() => {
        setQueue((prev) => prev.slice(1));
    }, []);

    const active = queue[0] ?? null;

    return (
        <BadgeToastContext.Provider value={{ pushBadges }}>
            {children}
            {active && <BadgeToast badge={active} onClose={pop} />}
        </BadgeToastContext.Provider>
    );
}

/**
 * Hook d’accès à l’API du système de toasts badges.
 *
 * @remarks
 * Ce hook permet de pousser des badges dans la file gérée par {@link BadgeToastProvider}.
 * Il doit être utilisé dans un composant descendant du provider.
 *
 * @throws Error
 * Lance une erreur si le hook est invoqué en dehors de {@link BadgeToastProvider}.
 *
 * @returns L’API du contexte, incluant {@link BadgeToastContextValue.pushBadges}.
 */
export function useBadgeToasts(): BadgeToastContextValue {
    const ctx = useContext(BadgeToastContext);
    if (!ctx) {
        throw new Error("useBadgeToasts must be used within a BadgeToastProvider");
    }
    return ctx;
}
