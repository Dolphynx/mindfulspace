/**
 * Contraint une valeur numérique dans un intervalle donné.
 *
 * @param n - Valeur à contraindre.
 * @param min - Borne minimale (incluse).
 * @param max - Borne maximale (incluse).
 * @returns Valeur comprise entre `min` et `max`.
 */
function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

/**
 * Sparkline minimaliste composée de points (dotted sparkline) rendue en SVG.
 *
 * Objectif :
 * - Visualiser une petite tendance (quelques points) dans un espace réduit.
 *
 * Caractéristiques :
 * - Les `dots` derniers points de `data` sont affichés.
 * - L’axe Y est normalisé entre le minimum et le maximum de la série affichée.
 * - Une baseline discrète est rendue en bas pour donner un repère visuel.
 *
 * Notes d’implémentation :
 * - Le SVG utilise une `viewBox` fixe (`w = 160`, hauteur configurable).
 * - Lorsque `max === min`, les points sont centrés verticalement (t = 0.5).
 *
 * @param props - Propriétés du composant.
 * @param props.data - Série de valeurs (ex. 7 valeurs).
 * @param props.height - Hauteur du SVG en unités de la `viewBox` (défaut : 44).
 * @param props.dots - Nombre de points affichés (défaut : 7).
 * @param props.tone - Ton visuel (défaut : `"blue"`).
 * @returns Élément SVG représentant la tendance.
 */
export function DottedSparkline({
                                    data,
                                    height = 44,
                                    dots = 7,
                                    tone = "blue",
                                }: {
    data: number[]; // e.g. 7 values
    height?: number;
    dots?: number;
    tone?: "blue" | "purple" | "green";
}) {
    /**
     * Largeur de référence de la `viewBox` (unités SVG).
     */
    const w = 160;

    /**
     * Hauteur de référence de la `viewBox` (unités SVG).
     */
    const h = height;

    /**
     * Série affichée : uniquement les `dots` derniers éléments.
     */
    const d = data.slice(-dots);

    /**
     * Bornes de normalisation verticale.
     */
    const min = Math.min(...d);
    const max = Math.max(...d);

    /**
     * Padding interne du rendu dans la `viewBox`.
     */
    const padX = 10;
    const padY = 8;

    /**
     * Couleur de remplissage des points en fonction du ton.
     *
     * Valeurs exprimées en hex afin d’être directement compatibles avec SVG.
     */
    const toneFill =
        tone === "green"
            ? "#10b981"
            : tone === "purple"
                ? "#8b5cf6"
                : "#3b82f6";

    /**
     * Positions X réparties uniformément sur la largeur utile.
     */
    const xs = d.map((_, i) => padX + (i * (w - padX * 2)) / Math.max(1, d.length - 1));

    /**
     * Positions Y normalisées sur l’intervalle [min, max] puis inversées pour l’axe SVG.
     *
     * - `t` est un ratio dans [0, 1] (0 = min, 1 = max).
     * - `y` est ensuite converti dans l’espace de la `viewBox` en respectant `padY`.
     * - Un clamp final garantit que la valeur reste dans la zone dessinable.
     */
    const ys = d.map((v) => {
        const t = max === min ? 0.5 : (v - min) / (max - min);
        const y = h - padY - t * (h - padY * 2);
        return clamp(y, padY, h - padY);
    });

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="h-11 w-full">
            {/* Ligne de base (repère bas) */}
            <line
                x1={padX}
                y1={h - padY}
                x2={w - padX}
                y2={h - padY}
                stroke="rgba(148,163,184,0.35)"
                strokeWidth="2"
                strokeLinecap="round"
            />

            {/* Points de la tendance */}
            {xs.map((x, i) => (
                <g key={i}>
                    <circle cx={x} cy={ys[i]} r="4" fill={toneFill} fillOpacity="0.85" />
                    <circle cx={x} cy={ys[i]} r="9" fill={toneFill} fillOpacity="0.10" />
                </g>
            ))}
        </svg>
    );
}
