"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

type LotusSpriteProps = {
    spriteUrl: string;
    columns: number;
    rows: number;
    frameCount: number;      // nombre de frames vraiment utilisées (<= columns*rows)
    duration: number;        // durée d’un cycle complet en ms
    size?: number;           // taille affichée (px), ex: 256
    loopMode?: "loop" | "pingpong";  // loop = 0→n→0, pingpong = 0→n→0 sans dupliquer la dernière
    fade?: boolean;          // petit fondu entre les frames
};

export function LotusSprite({
                                spriteUrl,
                                columns,
                                rows,
                                frameCount,
                                duration,
                                size = 256,
                                loopMode = "loop",
                                fade = false,
                            }: LotusSpriteProps) {
    const [frame, setFrame] = useState(0);
    const [fadeOn, setFadeOn] = useState(false);

    // total réel de frames dans le sprite
    const totalFrames = columns * rows;

    const effectiveFrameCount = Math.min(frameCount, totalFrames);

    useEffect(() => {
        if (effectiveFrameCount <= 1) return;

        const step = duration / effectiveFrameCount;
        let direction = 1;

        const id = setInterval(() => {
            setFadeOn(fade);
            if (fade) {
                // on laisse un peu de temps pour le fondu
                setTimeout(() => {
                    setFrame((prev) => {
                        if (loopMode === "loop") {
                            return (prev + 1) % effectiveFrameCount;
                        }

                        // ping-pong
                        if (direction === 1 && prev === effectiveFrameCount - 1) {
                            direction = -1;
                        } else if (direction === -1 && prev === 0) {
                            direction = 1;
                        }
                        return prev + direction;
                    });
                    setFadeOn(false);
                }, step / 2);
            } else {
                setFrame((prev) => {
                    if (loopMode === "loop") {
                        return (prev + 1) % effectiveFrameCount;
                    }

                    if (direction === 1 && prev === effectiveFrameCount - 1) {
                        direction = -1;
                    } else if (direction === -1 && prev === 0) {
                        direction = 1;
                    }
                    return prev + direction;
                });
            }
        }, step);

        return () => clearInterval(id);
    }, [duration, effectiveFrameCount, fade, loopMode]);

    // Calcule la position d’une frame dans la grille
    const getBackgroundPosition = (frameIndex: number) => {
        const col = frameIndex % columns;
        const row = Math.floor(frameIndex / columns);
        // On considère que le sprite sera redimensionné pour que chaque case fasse size×size
        const x = -col * size;
        const y = -row * size;
        return `${x}px ${y}px`;
    };

    const currentPos = getBackgroundPosition(frame);
    const nextPos = getBackgroundPosition(
        (frame + 1) % effectiveFrameCount
    );

    return (
        <div
            className="relative overflow-hidden"
            style={{ width: size, height: size }}
        >
            {/* frame actuelle */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `url(${spriteUrl})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: `${columns * size}px ${rows * size}px`,
                    backgroundPosition: currentPos,
                }}
            />

            {/* frame suivante en fondu (optionnel) */}
            {fade && (
                <div
                    className={clsx(
                        "absolute inset-0 transition-opacity",
                        fadeOn ? "opacity-100" : "opacity-0"
                    )}
                    style={{
                        backgroundImage: `url(${spriteUrl})`,
                        backgroundRepeat: "no-repeat",
                        backgroundSize: `${columns * size}px ${rows * size}px`,
                        backgroundPosition: nextPos,
                    }}
                />
            )}
        </div>
    );
}
