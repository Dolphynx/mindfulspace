"use client";

import type { ReactNode } from "react";

type OceanWavesBackgroundProps = {
    children: ReactNode;
    className?: string;

    /**
     * Hauteur du header sticky (si tu veux garder le calcul).
     * Mets 80 par défaut comme dans Serenity.
     */
    headerOffsetPx?: number;

    /**
     * Hauteur visuelle de la zone des vagues.
     * (80vh rend bien sur ta page Serenity)
     */
    wavesHeight?: string; // ex: "80vh"
};

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
            {/* WAVES FIXED (toujours en bas de la fenêtre, ne bougent pas au scroll) */}
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
                    {/* Wave 1 – la plus lente */}
                    <path
                        className="animate-ocean-wave opacity-30"
                        style={{ animationDuration: "18s" }}
                        d="M -100 350 Q 300 320, 600 350 T 1300 350 L 1300 700 L -100 700 Z"
                        fill="hsl(var(--ocean-light))"
                    />

                    {/* Wave 2 – un peu plus dynamique */}
                    <path
                        className="animate-ocean-wave opacity-40"
                        style={{ animationDuration: "14s", animationDelay: "-4s" }}
                        d="M -100 380 Q 300 350, 600 380 T 1300 380 L 1300 700 L -100 700 Z"
                        fill="hsl(var(--ocean-mid))"
                    />

                    {/* Wave 3 – quasi statique (ancre visuelle) */}
                    <path
                        className="animate-ocean-wave opacity-60"
                        style={{ animationDuration: "22s", animationDelay: "-8s" }}
                        d="M -100 420 Q 300 390, 600 420 T 1300 420 L 1300 700 L -100 700 Z"
                        fill="hsl(var(--ocean-deep))"
                    />
                </svg>
            </div>

            {/* CONTENT (scroll normal, au-dessus des vagues) */}
            <div className="relative z-10">{children}</div>
        </div>
    );
}
