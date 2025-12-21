"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * Représente un pétale de confetti à animer.
 */
type Petal = {
    /**
     * Identifiant unique du pétale dans la salve.
     */
    id: number;

    /**
     * Position horizontale (en pourcentage, 0–100).
     */
    left: number;

    /**
     * Délai avant démarrage de l’animation (en secondes).
     */
    delay: number;

    /**
     * Durée de l’animation (en secondes).
     */
    duration: number;

    /**
     * Largeur d’affichage du pétale (en pixels).
     */
    size: number;
};

/**
 * Liste des images de pétales utilisées pour le rendu des confettis.
 */
const PETAL_IMAGES: string[] = [
    "/images/lotus-confetti/petal1.png",
    "/images/lotus-confetti/petal2.png",
    "/images/lotus-confetti/petal3.png",
    "/images/lotus-confetti/petal4.png",
];

/**
 * Props du composant LotusConfetti.
 */
interface LotusConfettiProps {
    /**
     * Si true, déclenche une “salve” de confettis.
     */
    fire: boolean;

    /**
     * Nombre de pétales par salve.
     *
     * @default 40
     */
    count?: number;

    /**
     * Durée totale avant nettoyage (doit recouvrir la durée max d’animation).
     *
     * @default 4000
     */
    totalDurationMs?: number;
}

/**
 * Affiche une salve de pétales animés en overlay plein écran.
 *
 * @remarks
 * Le composant génère des pétales aléatoires à chaque déclenchement de `fire`,
 * puis nettoie le DOM après `totalDurationMs`.
 */
export function LotusConfetti({
                                  fire,
                                  count = 40,
                                  totalDurationMs = 4000,
                              }: LotusConfettiProps) {
    const [petals, setPetals] = useState<Petal[]>([]);

    useEffect(() => {
        if (!fire) return;

        /**
         * Génère une salve de pétales.
         */
        const generated: Petal[] = Array.from({ length: count }).map(
            (_, index) => ({
                id: index,
                left: Math.random() * 100,
                delay: Math.random() * 0.8,
                duration: 2.3 + Math.random() * 1.7,
                size: 24 + Math.random() * 18,
            }),
        );

        setPetals(generated);

        /**
         * Nettoyage après la durée totale.
         */
        const timer = setTimeout(() => {
            setPetals([]);
        }, totalDurationMs);

        return () => clearTimeout(timer);
    }, [fire, count, totalDurationMs]);

    if (!fire || petals.length === 0) return null;

    return (
        <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
            {petals.map((p) => (
                <Image
                    key={p.id}
                    src={PETAL_IMAGES[p.id % PETAL_IMAGES.length]}
                    alt=""
                    aria-hidden="true"
                    className="absolute animate-lotus-fall"
                    width={p.size}
                    height={p.size}
                    style={{
                        left: `${p.left}%`,
                        top: "-10%",
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
