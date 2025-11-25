"use client";

import { useEffect, useState } from "react";

type BreathingLotusProps = {
    frames: string[];      // chemins d'images
    frameIndex: number;    // 0..frames.length-1
    size?: number;
    fadeDurationMs?: number;
};

export function BreathingLotus({
                                   frames,
                                   frameIndex,
                                   size = 256,
                                   fadeDurationMs = 400,
                               }: BreathingLotusProps) {
    // image actuellement visible
    const [currentSrc, setCurrentSrc] = useState(() => {
        const idx = Math.max(0, Math.min(frames.length - 1, frameIndex));
        return frames[idx];
    });

    // image précédente (celle qui va s’estomper)
    const [prevSrc, setPrevSrc] = useState<string | null>(null);
    const [isFading, setIsFading] = useState(false);

    // Quand frameIndex change, on prépare un cross-fade
    useEffect(() => {
        if (frames.length === 0) return;

        const clamped = Math.max(0, Math.min(frames.length - 1, frameIndex));
        const newSrc = frames[clamped];

        setCurrentSrc((prev) => {
            if (!prev || prev === newSrc) {
                // première image ou pas de changement
                return newSrc;
            }
            // on garde l’ancienne pour la faire disparaître
            setPrevSrc(prev);
            setIsFading(true);
            return newSrc;
        });
    }, [frameIndex, frames]);

    // On nettoie l’ancienne image après le fade
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
            <img
                src={currentSrc}
                alt="Lotus animé"
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
                <img
                    src={prevSrc}
                    alt=""
                    aria-hidden="true"
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
