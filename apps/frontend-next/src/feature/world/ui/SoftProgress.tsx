"use client";

/**
 * Barre de progression “soft” destinée à afficher une valeur normalisée (0..100).
 *
 * Caractéristiques :
 * - Rendu compact (hauteur 2px Tailwind `h-2`).
 * - Remplissage en dégradé horizontal selon un ton (`blue`, `purple`, `green`).
 * - Libellés optionnels à gauche et à droite au-dessus de la barre.
 *
 * Contraintes :
 * - La valeur est bornée côté client dans l’intervalle [0, 100] avant rendu.
 *
 * @param props - Propriétés du composant.
 * @param props.value - Valeur de progression attendue dans l’intervalle 0..100.
 * @param props.tone - Ton visuel (défaut : `"blue"`).
 * @param props.labelLeft - Libellé optionnel affiché à gauche (au-dessus de la barre).
 * @param props.labelRight - Libellé optionnel affiché à droite (au-dessus de la barre).
 * @returns Élément React représentant une barre de progression.
 */
export function SoftProgress({
                                 value,
                                 tone = "blue",
                                 labelLeft,
                                 labelRight,
                             }: {
    value: number; // 0..100
    tone?: "blue" | "purple" | "green";
    labelLeft?: string;
    labelRight?: string;
}) {
    /**
     * Classes Tailwind du dégradé de remplissage selon le ton.
     *
     * Utilise `bg-gradient-to-r` + `from/to` semi-transparents pour une apparence douce.
     */
    const cl =
        tone === "green"
            ? "from-emerald-400/70 to-emerald-600/70"
            : tone === "purple"
                ? "from-violet-400/70 to-violet-600/70"
                : "from-blue-400/70 to-blue-600/70";

    /**
     * Valeur bornée à [0, 100] pour garantir un style width valide.
     */
    const v = Math.max(0, Math.min(100, value));

    return (
        <div>
            {(labelLeft || labelRight) && (
                <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
                    <span>{labelLeft}</span>
                    <span>{labelRight}</span>
                </div>
            )}

            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/60">
                <div
                    className={`h-full rounded-full bg-gradient-to-r ${cl}`}
                    style={{ width: `${v}%` }}
                />
            </div>
        </div>
    );
}
