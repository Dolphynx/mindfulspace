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
 *
 * Accessibilité :
 * - Le conteneur utilise `role="listbox"` pour indiquer une sélection unique.
 * - Chaque humeur utilise `role="option"` et expose l’état sélectionné via `aria-selected`.
 * - Les emojis sont marqués `aria-hidden` pour éviter la lecture vocale redondante.
 *
 * Logique :
 * - Lors d’un clic, le parent reçoit (value, option) via `onChangeAction`.
 * - Le composant est contrôlé : il ne gère pas son propre état interne.
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
 * @param disabled - Désactive les options.
 * @param className - Classes CSS supplémentaires.
 */
export default function MoodPicker({
                                       value = null,
                                       onChangeAction,
                                       size = "md",
                                       variant = "cards",
                                       disabled,
                                       className = "",
                                   }: MoodPickerProps) {

    /**
     * Styles communs aux cartes.
     */
    const baseItem =
        "flex flex-col items-center justify-center gap-2 rounded-2xl border transition shadow-card focus:outline-none focus:ring-2 focus:ring-brandGreen";

    /**
     * Taille dynamique des éléments.
     */
    const sizeCls = size === "sm" ? "w-24 h-24 text-sm" : "w-40 h-40 text-base";

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
            {MOOD_OPTIONS.map(opt => {
                const active = value === opt.value;

                return (
                    <button
                        key={opt.value}
                        type="button"
                        disabled={disabled}
                        role="option"
                        aria-selected={active}
                        onClick={() => onChangeAction?.(opt.value, opt)}
                        className={`${baseItem} ${sizeCls} ${
                            active
                                ? "bg-brandGreen/10 border-brandGreen"
                                : "bg-white border-brandBorder hover:shadow-md"
                        }`}
                        title={opt.label}
                    >
                        {/* Émoji visuel (pas lu par lecteur d'écran) */}
                        <span
                            className={size === "sm" ? "text-3xl" : "text-5xl"}
                            aria-hidden
                        >
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
