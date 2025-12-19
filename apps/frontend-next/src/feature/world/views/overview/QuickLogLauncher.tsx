"use client";

import Image from "next/image";
import { useTranslations } from "@/i18n/TranslationContext";
import type { Domain } from "../../hub/types";

type Props = {
    active: Domain;
    onChange: (d: Domain) => void;
};

const ITEMS: { key: Domain; labelKey: "sleepAlt" | "meditationAlt" | "exerciceAlt"; iconSrc: string }[] = [
    { key: "sleep", labelKey: "sleepAlt", iconSrc: "/images/icone_sleep.png" },
    { key: "meditation", labelKey: "meditationAlt", iconSrc: "/images/icone_meditation.png" },
    { key: "exercise", labelKey: "exerciceAlt", iconSrc: "/images/icone_exercise.png" },
];

export function QuickLogLauncher({ active, onChange }: Props) {
    const tWorld = useTranslations("publicWorld");

    return (
        <div className="flex items-center justify-start gap-3">
            {ITEMS.map((it) => {
                const isActive = it.key === active;

                return (
                    <button
                        key={it.key}
                        type="button"
                        onClick={() => onChange(it.key)}
                        aria-pressed={isActive}
                        title={tWorld(it.labelKey)}
                        className={[
                            "h-14 w-14 rounded-2xl border transition overflow-hidden",
                            "bg-white/60 backdrop-blur shadow-sm",
                            isActive ? "border-slate-300 ring-2 ring-slate-200" : "border-white/40 hover:bg-white/80",
                            "flex items-center justify-center",
                        ].join(" ")}
                    >
                        <div className="relative h-9 w-9">
                            <Image src={it.iconSrc} alt={tWorld(it.labelKey)} fill className="object-contain" />
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
