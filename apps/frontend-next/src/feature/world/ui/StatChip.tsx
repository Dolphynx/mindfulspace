/**
 * Chip statistique utilisée pour afficher un couple libellé / valeur.
 *
 * Objectifs UI :
 * - Présenter une information compacte et lisible.
 * - S’intégrer visuellement dans des zones de résumé ou de dashboard.
 * - Supporter plusieurs tons visuels cohérents avec le World Hub.
 *
 * Le composant est volontairement simple, stateless et purement présentatif.
 */
export function StatChip({
                             label,
                             value,
                             tone = "neutral",
                         }: {
    /** Libellé descriptif de la statistique. */
    label: string;

    /** Valeur affichée associée au libellé. */
    value: string;

    /**
     * Ton visuel de la chip.
     *
     * - `"neutral"` : ton par défaut.
     * - `"blue"`, `"purple"`, `"green"` : déclinaisons colorées.
     */
    tone?: "neutral" | "blue" | "purple" | "green";
}) {
    /**
     * Classes Tailwind déterminées par le ton sélectionné.
     *
     * Chaque variante définit :
     * - la couleur de fond,
     * - la couleur du texte,
     * - la couleur de la bordure.
     */
    const toneClass =
        tone === "blue"
            ? "bg-blue-50/70 text-blue-900 border-blue-100"
            : tone === "purple"
                ? "bg-violet-50/70 text-violet-900 border-violet-100"
                : tone === "green"
                    ? "bg-emerald-50/70 text-emerald-900 border-emerald-100"
                    : "bg-slate-50/70 text-slate-900 border-slate-100";

    return (
        <div
            className={[
                "inline-flex items-baseline gap-2 rounded-2xl border px-4 py-3",
                toneClass,
            ].join(" ")}
        >
            <span className="text-xs font-medium text-slate-600">
                {label}
            </span>
            <span className="text-base font-semibold">
                {value}
            </span>
        </div>
    );
}
