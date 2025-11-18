"use client";

/**
 * Sélecteur d’humeur (MoodPicker)
 *
 * - Affiche une liste de boutons représentant différentes humeurs (émoticônes + libellés).
 * - Permet de sélectionner une humeur via un clic.
 * - Deux variantes d’affichage :
 *   - `cards` : cartes avec grille responsive.
 *   - `row`   : rangée compacte horizontale.
 * - Deux tailles : `sm` ou `md`.
 * - Deux tons visuels :
 *   - `card` (par défaut) : cartes avec bordure/ombre.
 *   - `minimal` : version légère (idéal dans un autre composant, comme QuickLog).
 */

import { MOOD_OPTIONS, MoodOption, MoodValue } from "@/lib";

/**
 * Props du MoodPicker.
 */
type MoodPickerProps = {
    /** Valeur d'humeur actuellement sélectionnée (contrôlé par le parent). */
    value?: MoodValue | null;
    /**
     * Callback appelé lorsqu'une humeur est sélectionnée.
     * @param v - La valeur pure (MoodValue).
     * @param opt - L'objet MoodOption complet, utile si le parent a besoin du label/emoji.
     */
    onChangeAction?: (v: MoodValue, opt: MoodOption) => void;

    /** Taille des cartes : petite (`sm`) ou normale (`md`). */
    size?: "sm" | "md";

    /** Mode d’affichage : `cards` (grille) ou `row` (ligne compacte). */
    variant?: "cards" | "row";

    /** Style visuel : cartes (par défaut) ou minimaliste. */
    tone?: "card" | "minimal";

    /** Désactivation complète du sélecteur. */
    disabled?: boolean;

    /** Classes additionnelles sur le conteneur. */
    className?: string;
};

/**
 * MoodPicker – composant stateless qui affiche un ensemble d’humeurs sélectionnables.
 *
 * @param value - Humeur sélectionnée.
 * @param onChangeAction - Callback lors d’un changement.
 * @param size - Taille des cartes.
 * @param variant - Layout global.
 * @param tone - Style visuel (card ou minimal).
 * @param disabled - Désactive les options.
 * @param className - Classes CSS supplémentaires.
 */
export default function MoodPicker({
                                       value = null,
                                       onChangeAction,
                                       size = "md",
                                       variant = "cards",
                                       tone = "card",
                                       disabled,
                                       className = "",
                                   }: MoodPickerProps) {
    /**
     * Styles communs : on différencie le style "card" et le style "minimal".
     */
    const baseItemCard =
        "flex flex-col items-center justify-center gap-2 rounded-2xl border transition shadow-card focus:outline-none focus:ring-2 focus:ring-brandGreen";

    const baseItemMinimal =
        "flex flex-col items-center justify-center gap-1 rounded-full transition focus:outline-none focus:ring-2 focus:ring-brandGreen";

    const baseItem = tone === "minimal" ? baseItemMinimal : baseItemCard;

    /**
     * Taille dynamique des éléments.
     */
    const sizeCls =
        size === "sm"
            ? tone === "minimal"
                ? "px-1 py-1 text-sm"
                : "w-24 h-24 text-sm"
            : tone === "minimal"
                ? "px-2 py-2 text-base"
                : "w-40 h-40 text-base";

    const emojiSizeCls =
        size === "sm"
            ? tone === "minimal"
                ? "text-2xl"
                : "text-3xl"
            : "text-5xl";

    return (
        <div
            className={
                variant === "cards"
                    ? `grid grid-cols-2 md:grid-cols-5 gap-4 ${className}`
                    : `flex items-center gap-2 ${className}`
            }
            role="listbox"
            aria-label="Sélection de l'humeur"
        >
            {MOOD_OPTIONS.map((opt) => {
                const active = value === opt.value;

                const activeCls =
                    tone === "minimal"
                        ? "text-brandGreen scale-110"
                        : "bg-brandGreen/10 border-brandGreen";

                const inactiveCls =
                    tone === "minimal"
                        ? "text-gray-500 opacity-60 hover:opacity-100"
                        : "bg-white border-brandBorder hover:shadow-md";

                return (
                    <button
                        key={opt.value}
                        type="button"
                        disabled={disabled}
                        role="option"
                        aria-selected={active}
                        onClick={() => onChangeAction?.(opt.value, opt)}
                        className={`${baseItem} ${sizeCls} ${active ? activeCls : inactiveCls}`}
                        title={opt.label}
                    >
                        {/* Émoji visuel (pas lu par lecteur d'écran) */}
                        <span className={emojiSizeCls} aria-hidden>
                            {opt.emoji}
                        </span>

                        {/* Label textuel affiché sous l’émoji */}
                        <span className="text-brandText">{opt.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
