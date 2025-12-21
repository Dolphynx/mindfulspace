"use client";

type Props = {
    islandPath: string;
};

/**
 * Couches SVG de la carte (outer/mid/deep) avec effets de vagues.
 *
 * @remarks
 * - Utilise `<defs>` + `<use>` pour réutiliser le même path.
 * - Applique un shrink global léger pour réduire les débordements.
 * - Anime uniquement les couches "outer" et "mid" via des classes CSS.
 */
export function IslandMapLayers({ islandPath }: Props) {
    /**
     * Shrink global léger pour contenir le rendu dans le conteneur.
     */
    const S = 0.965;

    /**
     * Translation calculée pour conserver le centrage après mise à l'échelle.
     */
    const TX = (1200 * (1 - S)) / 2;
    const TY = (700 * (1 - S)) / 2;

    return (
        <div className="absolute inset-0 pointer-events-none z-0">
            <svg
                viewBox="0 0 1200 700"
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    <path id="pOuterRaw" d={islandPath} />
                    <path id="pMidRaw" d={islandPath} transform="translate(22 14) scale(0.965)" />
                    <path id="pDeepRaw" d={islandPath} transform="translate(40 24) scale(0.93)" />
                </defs>

                <g transform={`translate(${TX} ${TY}) scale(${S})`}>
                    {/* OUTER (light) */}
                    <g className="animate-island-wave-outer">
                        <use href="#pOuterRaw" fill="hsl(var(--ocean-light))" />
                        <path d="M-80,430 Q220,380 520,430 T1280,430" fill="rgba(255,255,255,0.16)" />
                        <path d="M-80,520 Q220,475 520,520 T1280,520" fill="rgba(255,255,255,0.10)" />
                    </g>

                    {/* MID (mid) */}
                    <g className="animate-island-wave-mid">
                        <use href="#pMidRaw" fill="hsl(var(--ocean-mid))" opacity="0.92" />
                        <path d="M-80,455 Q240,420 520,455 T1280,455" fill="rgba(255,255,255,0.10)" />
                    </g>

                    {/* DEEP (base) */}
                    <use href="#pDeepRaw" fill="hsl(var(--ocean-deep))" opacity="0.92" />

                    {/* Bord blanc discret */}
                    <use href="#pOuterRaw" fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth="8" />
                </g>
            </svg>
        </div>
    );
}
