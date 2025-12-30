"use client";

import Image from "next/image";

import { MOOD_OPTIONS, type MoodOption, type MoodValue } from "@/lib";
import { useTranslations } from "@/i18n/TranslationContext";

/**
 * Props du composant MoodPicker.
 */
type MoodPickerProps = {
    /**
     * Valeur actuellement sélectionnée.
     */
    value?: MoodValue | null;

    /**
     * Callback déclenché lors d’un changement de sélection.
     */
    onChangeAction?: (v: MoodValue, opt: MoodOption) => void;

    /**
     * Taille visuelle des items.
     *
     * @default "md"
     */
    size?: "sm" | "md";

    /**
     * Variante d’affichage.
     *
     * - `cards` : grille de cartes
     * - `row` : ligne horizontale
     *
     * @default "cards"
     */
    variant?: "cards" | "row";

    /**
     * Style visuel des items.
     *
     * - `card` : carte avec bordure et ombre
     * - `minimal` : icône compacte
     *
     * @default "card"
     */
    tone?: "card" | "minimal";

    /**
     * Désactive l’ensemble du sélecteur.
     */
    disabled?: boolean;

    /**
     * Classes CSS supplémentaires.
     */
    className?: string;
};

/**
 * Sélecteur de mood basé sur une liste d’options prédéfinies.
 *
 * @remarks
 * Ce composant expose une interface accessible (`listbox / option`)
 * et supporte plusieurs variantes visuelles selon le contexte d’usage.
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
     * Namespace i18n du composant.
     */
    const t = useTranslations("moodPicker");

    /**
     * Classes de base pour le mode "card".
     */
    const baseItemCard =
        "flex flex-col items-center justify-center gap-2 rounded-2xl border transition shadow-card focus:outline-none focus:ring-2 focus:ring-brandGreen";

    /**
     * Classes de base pour le mode "minimal".
     */
    const baseItemMinimal =
        "flex flex-col items-center justify-center gap-1 rounded-full transition focus:outline-none focus:ring-2 focus:ring-brandGreen";

    /**
     * Classes de base selon le tone sélectionné.
     */
    const baseItem = tone === "minimal" ? baseItemMinimal : baseItemCard;

    /**
     * Classes de taille selon le format et le tone.
     */
    const sizeCls =
        size === "sm"
            ? tone === "minimal"
                ? "px-1 py-1 text-sm"
                : "w-24 h-24 text-sm"
            : tone === "minimal"
                ? "px-2 py-2 text-base"
                : "w-40 h-40 text-base";

    return (
        <div
            className={
                variant === "cards"
                    ? `grid grid-cols-2 md:grid-cols-5 gap-4 ${className}`
                    : `flex items-center gap-2 ${className}`
            }
            role="listbox"
            aria-label={t("ariaLabel")}
        >
            {MOOD_OPTIONS.map((opt) => {
                const active = value === opt.value;

                /**
                 * Classes appliquées à l’état actif.
                 */
                const activeCls =
                    tone === "minimal"
                        ? "text-brandGreen scale-110"
                        : "bg-brandGreen/10 border-brandGreen";

                /**
                 * Classes appliquées à l’état inactif.
                 */
                const inactiveCls =
                    tone === "minimal"
                        ? "text-gray-500 opacity-60 hover:opacity-100"
                        : "bg-white border-brandBorder hover:shadow-md";

                return (
                    <button
                        key={opt.value}
                        type="button"
                        role="option"
                        disabled={disabled}
                        aria-selected={active}
                        onClick={() => onChangeAction?.(opt.value, opt)}
                        className={`${baseItem} ${sizeCls} ${
                            active ? activeCls : inactiveCls
                        }`}
                        title={t(opt.label)}
                    >
                        {/* Icône du mood */}
                        <Image
                            src={opt.emoji}
                            alt={t(opt.label)}
                            width={64}
                            height={64}
                            aria-hidden="true"
                            className="mx-auto"
                        />

                        {/* Libellé */}
                        <span className="text-brandText hidden sm:block">
                            {t(opt.label)}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
