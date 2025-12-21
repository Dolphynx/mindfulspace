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
 * Le composant {@link LotusConfetti} est rendu une seule fois à ce niveau,
 * garantissant un overlay global unique.
 *
 * Un mécanisme de limitation temporelle (cooldown) empêche le déclenchement
 * de plusieurs bursts trop rapprochés (ex. confirmation + badges “au même moment”),
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
     * Timestamp (ms) jusqu’auquel tout nouvel appel à `fire` est ignoré.
     */
    const cooldownUntilRef = useRef<number>(0);

    /**
     * Déclenche un burst de confettis.
     *
     * @remarks
     * Si l’appel intervient pendant la fenêtre de cooldown, il est ignoré.
     * Le composant de confettis est re-mount pour garantir un burst distinct
     * à chaque déclenchement valide.
     *
     * @param ms Durée du burst en millisecondes.
     */
    const fire = useCallback((ms: number = 4000) => {
        const now = Date.now();
        if (now < cooldownUntilRef.current) return;

        // Marge de sécurité pour absorber des triggers quasi simultanés.
        const bufferMs = 200;
        cooldownUntilRef.current = now + ms + bufferMs;

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
 * @throws Error
 * Lance une erreur si le hook est utilisé en dehors du provider associé.
 */
export function useConfetti(): ConfettiContextValue {
    const ctx = useContext(ConfettiContext);
    if (!ctx) {
        throw new Error("useConfetti must be used within a ConfettiProvider");
    }
    return ctx;
}
