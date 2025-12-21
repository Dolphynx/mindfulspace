"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";

import { LotusConfetti } from "@/components/confetti/LotusConfetti";

type ConfettiContextValue = {
    /**
     * Déclenche un burst de confettis.
     *
     * @param ms Durée du burst en millisecondes.
     * Si non fournie, une valeur par défaut est utilisée.
     */
    fire: (ms?: number) => void;
};

const ConfettiContext = createContext<ConfettiContextValue | undefined>(undefined);

/**
 * Provider global de gestion des confettis.
 *
 * @remarks
 * Ce provider expose une API minimale permettant de déclencher des confettis
 * depuis n’importe quel composant descendant, indépendamment des mécanismes
 * de notification (toasts, badges, etc.).
 *
 * Le composant {@link LotusConfetti} est rendu une seule fois à ce niveau,
 * garantissant :
 * - un overlay global unique,
 * - un comportement homogène dans toute l’application,
 * - l’absence de duplication des effets visuels.
 *
 * Un mécanisme de limitation temporelle (cooldown) empêche le déclenchement
 * de plusieurs bursts trop rapprochés (ex. confirmation + badge gagné),
 * afin de préserver la lisibilité et le confort visuel.
 *
 * @param props Propriétés du provider.
 * @param props.children Arbre de composants consommateurs du contexte.
 * @returns Le provider de confettis englobant l’application.
 */
export function ConfettiProvider({ children }: { children: ReactNode }) {
    const [burstId, setBurstId] = useState(0);
    const [isFiring, setIsFiring] = useState(false);

    /**
     * Référence interne utilisée pour limiter les déclenchements successifs.
     *
     * Elle stocke le timestamp (en millisecondes) jusqu’auquel
     * tout nouvel appel à `fire` est ignoré.
     */
    const cooldownUntilRef = useRef<number>(0);

    /**
     * Déclenche un burst de confettis.
     *
     * @remarks
     * Si un burst est déjà en cours (ou si l’appel intervient dans la fenêtre
     * de cooldown), l’appel est ignoré afin d’éviter des rafales visuelles.
     *
     * @param ms Durée du burst en millisecondes.
     * Une valeur par défaut est utilisée si non spécifiée.
     */
    const fire = useCallback((ms: number = 1200) => {
        const now = Date.now();

        // Si un burst est déjà en cours ou dans la fenêtre de cooldown,
        // ignorer le déclenchement.
        if (now < cooldownUntilRef.current) {
            return;
        }

        /**
         * Marge de sécurité ajoutée à la durée du burst.
         *
         * Elle permet d’absorber les appels quasi simultanés
         * (ex. toast de confirmation + toast de badge).
         */
        const bufferMs = 200;
        cooldownUntilRef.current = now + ms + bufferMs;

        // Forcer un re-mount du composant de confettis afin de garantir
        // l’exécution d’un burst distinct à chaque appel valide.
        setBurstId((x) => x + 1);
        setIsFiring(true);

        window.setTimeout(() => {
            setIsFiring(false);
        }, ms);
    }, []);

    const value = useMemo(() => ({ fire }), [fire]);

    return (
        <ConfettiContext.Provider value={value}>
            {children}

            <LotusConfetti key={burstId} fire={isFiring} />
        </ConfettiContext.Provider>
    );
}

/**
 * Hook d’accès au contexte des confettis.
 *
 * @remarks
 * Permet à un composant descendant de déclencher un burst de confettis
 * via l’API exposée par {@link ConfettiProvider}.
 *
 * @throws Error
 * Lance une erreur si le hook est utilisé en dehors du provider associé,
 * afin de garantir une configuration correcte de l’arbre de composants.
 *
 * @returns L’API de déclenchement des confettis.
 */
export function useConfetti(): ConfettiContextValue {
    const ctx = useContext(ConfettiContext);
    if (!ctx) {
        throw new Error("useConfetti must be used within a ConfettiProvider");
    }
    return ctx;
}
