"use client";
import { MOOD_OPTIONS, MoodOption, MoodValue } from "@/lib/mood";

type MoodPickerProps = {
    value?: MoodValue | null;
    onChangeAction?: (v: MoodValue, opt: MoodOption) => void;
    size?: "sm" | "md";           // taille des cartes
    variant?: "cards" | "row";    // grille cartes ou rangée compacte
    disabled?: boolean;
    className?: string;
};

export default function MoodPicker({
                                       value = null,
                                       onChangeAction,
                                       size = "md",
                                       variant = "cards",
                                       disabled,
                                       className = "",
                                   }: MoodPickerProps) {

    const baseItem =
        "flex flex-col items-center justify-center gap-2 rounded-2xl border transition shadow-card focus:outline-none focus:ring-2 focus:ring-brandGreen";
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
            <span className={size === "sm" ? "text-3xl" : "text-5xl"} aria-hidden>
              {opt.emoji}
            </span>
                        <span className="text-brandText">{opt.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
