"use client";

import type { ReactNode } from "react";

type OceanWavesBackgroundProps = {
    /**
     * Contenu rendu au-dessus du décor (scroll normal).
     */
    children: ReactNode;

    /**
     * Classes Tailwind additionnelles appliquées au wrapper principal.
     */
    className?: string;

    /**
     * Hauteur du header sticky, utilisée pour calculer la hauteur minimale du layout.
     *
     * @defaultValue 80
     */
    headerOffsetPx?: number;

    /**
     * Hauteur visuelle du bloc de vagues fixé en bas de la fenêtre.
     *
     * @remarks
     * Exemples : `"80vh"`, `"70vh"`, `"520px"`.
     *
     * @defaultValue "80vh"
     */
    wavesHeight?: string;
};

/**
 * Fond "océan" avec vagues SVG fixes en bas de la fenêtre et contenu scrollable au-dessus.
 *
 * @remarks
 * - Les vagues sont rendues dans un conteneur `fixed` afin de rester immobiles au scroll.
 * - Le contenu est rendu dans un calque supérieur (`z-10`) pour rester interactif.
 * - Le wrapper applique un dégradé de fond identique à la page Serenity.
 * - La classe CSS `animate-ocean-wave` doit être définie globalement (animation horizontale).
 */
export default function OceanWavesBackground({
                                                 children,
                                                 className = "",
                                                 headerOffsetPx = 80,
                                                 wavesHeight = "80vh",
                                             }: OceanWavesBackgroundProps) {
    return (
        <div
            className={[
                "relative w-full",
                `min-h-[calc(100vh-${headerOffsetPx}px)]`,
                "bg-gradient-to-b from-[#eef4fa] to-[#dbe8f1]",
                className,
            ].join(" ")}
        >
            {/* Décor (vagues) fixé en bas, non-interactif. */}
            <div
                className="pointer-events-none fixed inset-x-0 bottom-0 z-0"
                style={{ height: wavesHeight }}
                aria-hidden="true"
            >
                <svg
                    viewBox="0 0 1200 700"
                    className="w-[105%] h-full -ml-[2.5%] object-fill"
                    preserveAspectRatio="none"
                >
                    {/* Vague 1 (lente). */}
                    <path
                        className="animate-ocean-wave opacity-30"
                        style={{ animationDuration: "18s" }}
                        d="M -100 350 Q 300 320, 600 350 T 1300 350 L 1300 700 L -100 700 Z"
                        fill="hsl(var(--ocean-light))"
                    />

                    {/* Vague 2 (plus dynamique). */}
                    <path
                        className="animate-ocean-wave opacity-40"
                        style={{ animationDuration: "14s", animationDelay: "-4s" }}
                        d="M -100 380 Q 300 350, 600 380 T 1300 380 L 1300 700 L -100 700 Z"
                        fill="hsl(var(--ocean-mid))"
                    />

                    {/* Vague 3 (ancre visuelle). */}
                    <path
                        className="animate-ocean-wave opacity-60"
                        style={{ animationDuration: "22s", animationDelay: "-8s" }}
                        d="M -100 420 Q 300 390, 600 420 T 1300 420 L 1300 700 L -100 700 Z"
                        fill="hsl(var(--ocean-deep))"
                    />
                </svg>
            </div>

            {/* Contenu au-dessus du décor. */}
            <div className="relative z-10">{children}</div>
        </div>
    );
}
