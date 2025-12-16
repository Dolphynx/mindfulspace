"use client";

import { useEffect, useState } from "react";

type Petal = {
    id: number;
    left: number;
    delay: number;
    duration: number;
    size: number;
};

const PETAL_IMAGES: string[] = [
    "/images/lotus-confetti/petal1.png",
    "/images/lotus-confetti/petal2.png",
    "/images/lotus-confetti/petal3.png",
    "/images/lotus-confetti/petal4.png",
];

interface LotusConfettiProps {
    /**
     * Si true, déclenche une “salve” de confettis.
     */
    fire: boolean;
    /**
     * Nombre de pétales par salve.
     */
    count?: number;
    /**
     * Durée totale avant nettoyage (doit recouvrir la durée max d’animation).
     */
    totalDurationMs?: number;
}

export function LotusConfetti({
                                  fire,
                                  count = 40,
                                  totalDurationMs = 4000,
                              }: LotusConfettiProps) {
    const [petals, setPetals] = useState<Petal[]>([]);

    useEffect(() => {
        if (!fire) return;

        // Génère une salve de pétales
        const generated: Petal[] = Array.from({ length: count }).map(
            (_, index) => ({
                id: index,
                left: Math.random() * 100, // position horizontale (0–100%)
                delay: Math.random() * 0.8, // léger décalage
                duration: 2.3 + Math.random() * 1.7, // durée de chute
                size: 24 + Math.random() * 18, // taille en px
            }),
        );

        setPetals(generated);

        // Nettoyage après la durée totale
        const timer = setTimeout(() => {
            setPetals([]);
        }, totalDurationMs);

        return () => clearTimeout(timer);
    }, [fire, count, totalDurationMs]);

    if (!fire || petals.length === 0) return null;

    return (
        <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
            {petals.map((p) => (
                <img
                    key={p.id}
                    src={PETAL_IMAGES[p.id % PETAL_IMAGES.length]}
                    aria-hidden="true"
                    className="absolute animate-lotus-fall"
                    style={{
                        left: `${p.left}%`,
                        top: "-10%", // départ légèrement hors écran
                        width: p.size,
                        height: "auto",
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${p.duration}s`,
                    }}
                />
            ))}
        </div>
    );
}
