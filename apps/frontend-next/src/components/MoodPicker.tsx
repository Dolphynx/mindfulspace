"use client";

import { MOOD_OPTIONS, MoodOption, MoodValue } from "@/lib";
import { useTranslations } from "@/i18n/TranslationContext";

type MoodPickerProps = {
    value?: MoodValue | null;
    onChangeAction?: (v: MoodValue, opt: MoodOption) => void;
    size?: "sm" | "md";
    variant?: "cards" | "row";
    tone?: "card" | "minimal";
    disabled?: boolean;
    className?: string;
};

export default function MoodPicker({
                                       value = null,
                                       onChangeAction,
                                       size = "md",
                                       variant = "cards",
                                       tone = "card",
                                       disabled,
                                       className = "",
                                   }: MoodPickerProps) {

    /** i18n moodPicker namespace */
    const t = useTranslations("moodPicker");

    /** classes */
    const baseItemCard =
        "flex flex-col items-center justify-center gap-2 rounded-2xl border transition shadow-card focus:outline-none focus:ring-2 focus:ring-brandGreen";

    const baseItemMinimal =
        "flex flex-col items-center justify-center gap-1 rounded-full transition focus:outline-none focus:ring-2 focus:ring-brandGreen";

    const baseItem = tone === "minimal" ? baseItemMinimal : baseItemCard;

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
            aria-label={t("ariaLabel")}
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
                        role="option"
                        disabled={disabled}
                        aria-selected={active}
                        onClick={() => onChangeAction?.(opt.value, opt)}
                        className={`${baseItem} ${sizeCls} ${
                            active ? activeCls : inactiveCls
                        }`}
                        title={t(`labels.${opt.label}`)} // i18n label
                    >
                        {/* image emoji */}
                        <img
                            src={opt.emoji}
                            alt={t(`labels.${opt.label}`)}
                            aria-hidden="true"
                            className="w-16 h-16 mx-auto"
                        />

                        {/* Texte visible si souhaité */}
                        {/* <span className="text-brandText">{t(`labels.${opt.key}`)}</span> */}
                    </button>
                );
            })}
        </div>
    );
}
