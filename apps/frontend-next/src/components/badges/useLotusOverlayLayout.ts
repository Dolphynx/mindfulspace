/**
 * @file useLotusOverlayLayout.ts
 * @description
 * Hook dérivé (sans effets, sans DOM) pour fournir le layout des lotus :
 * - positions en %
 * - tailles responsive via classes Tailwind
 */

type LotusPosition = { xPct: number; yPct: number };

/**
 * Positions (en %) dans le conteneur `relative aspect-[16/9]`.
 *
 * @remarks
 * Les positions sont indexées dans l’ordre d’affichage des badges.
 */
const LOTUS_POSITIONS: LotusPosition[] = [
    { xPct: 20, yPct: 30 },
    { xPct: 28, yPct: 60 },
    { xPct: 36, yPct: 35 },
    { xPct: 47, yPct: 60 },
    { xPct: 53, yPct: 25 },
    { xPct: 70, yPct: 50 },
    { xPct: 80, yPct: 20 },
];

/**
 * Taille responsive du marker lotus.
 *
 * @remarks
 * - base: 64
 * - sm: 76
 * - lg: 80
 */
const MARKER_SIZE_CLASS = "w-[64px] h-[64px] sm:w-[76px] sm:h-[76px] lg:w-[80px] lg:h-[80px]";

export function useLotusOverlayLayout() {
    /**
     * Retourne la position (% left/top) pour un index de badge.
     * Fallback : dernière position.
     */
    function getPositionForIndex(i: number): LotusPosition {
        return LOTUS_POSITIONS[i] ?? LOTUS_POSITIONS.at(-1)!;
    }

    return {
        getPositionForIndex,
        markerSizeClass: MARKER_SIZE_CLASS,
    } as const;
}
