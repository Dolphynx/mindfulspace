"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * Props du composant BreathingLotus.
 */
type BreathingLotusProps = {
    /**
     * Liste des chemins d’images (frames) à afficher.
     */
    frames: string[];

    /**
     * Index courant dans `frames` (0..frames.length-1).
     */
    frameIndex: number;

    /**
     * Taille (largeur/hauteur) en pixels.
     *
     * @default 256
     */
    size?: number;

    /**
     * Durée du fondu (cross-fade) en millisecondes.
     *
     * @default 400
     */
    fadeDurationMs?: number;
};

/**
 * Affiche une animation image-par-image d’un lotus avec transition de type cross-fade.
 *
 * @remarks
 * Le composant conserve l’image précédente pour l’estomper pendant l’affichage
 * de la nouvelle image, puis nettoie l’ancienne après la durée configurée.
 */
export function BreathingLotus({
                                   frames,
                                   frameIndex,
                                   size = 256,
                                   fadeDurationMs = 400,
                               }: BreathingLotusProps) {
    /**
     * Image actuellement visible.
     */
    const [currentSrc, setCurrentSrc] = useState(() => {
        const idx = Math.max(0, Math.min(frames.length - 1, frameIndex));
        return frames[idx];
    });

    /**
     * Image précédente (celle qui va s’estomper).
     */
    const [prevSrc, setPrevSrc] = useState<string | null>(null);
    const [isFading, setIsFading] = useState(false);

    /**
     * Quand `frameIndex` change, prépare un cross-fade entre l’ancienne et la nouvelle frame.
     */
    useEffect(() => {
        if (frames.length === 0) return;

        const clamped = Math.max(0, Math.min(frames.length - 1, frameIndex));
        const newSrc = frames[clamped];

        setCurrentSrc((prev) => {
            if (!prev || prev === newSrc) {
                return newSrc;
            }

            setPrevSrc(prev);
            setIsFading(true);
            return newSrc;
        });
    }, [frameIndex, frames]);

    /**
     * Nettoie l’ancienne image après la durée de fondu.
     */
    useEffect(() => {
        if (!isFading) return;

        const timer = window.setTimeout(() => {
            setPrevSrc(null);
            setIsFading(false);
        }, fadeDurationMs);

        return () => window.clearTimeout(timer);
    }, [isFading, fadeDurationMs]);

    if (!currentSrc) return null;

    return (
        <div
            style={{
                width: size,
                height: size,
                position: "relative",
            }}
            className="select-none"
        >
            {/* image actuelle */}
            <Image
                src={currentSrc}
                alt="Lotus animé"
                width={size}
                height={size}
                style={{
                    width: size,
                    height: size,
                    position: "absolute",
                    inset: 0,
                    objectFit: "contain",
                }}
            />

            {/* ancienne image qui fade vers 0 */}
            {prevSrc && (
                <Image
                    src={prevSrc}
                    alt=""
                    aria-hidden="true"
                    width={size}
                    height={size}
                    style={{
                        width: size,
                        height: size,
                        position: "absolute",
                        inset: 0,
                        objectFit: "contain",
                        opacity: isFading ? 0 : 1,
                        transition: `opacity ${fadeDurationMs}ms ease-in-out`,
                    }}
                />
            )}
        </div>
    );
}
