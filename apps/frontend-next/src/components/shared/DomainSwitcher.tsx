"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "@/i18n/TranslationContext";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

type DomainKey = "sleep" | "meditation" | "exercise";

type DomainSwitcherProps = {
    current: DomainKey;
};

export default function DomainSwitcher({ current }: DomainSwitcherProps) {
    const router = useRouter();
    const pathname = usePathname();
    const raw = pathname.split("/")[1] || defaultLocale;
    const locale: Locale = isLocale(raw) ? raw : defaultLocale;

    const t = useTranslations("publicWorld");

    const domains: {
        key: DomainKey;
        iconSrc: string;
        label: string;
    }[] = [
        {
            key: "sleep",
            iconSrc: "/images/icone_sleep.png",
            label: t("sleepAlt"),
        },
        {
            key: "meditation",
            iconSrc: "/images/icone_meditation.png",
            label: t("meditationAlt"),
        },
        {
            key: "exercise",
            iconSrc: "/images/icone_exercise.png",
            label: t("exerciceAlt"),
        },
    ];

    const handleClick = (key: DomainKey) => {
        if (key === current) return;
        router.push(`/${locale}/member/domains/${key}`);
    };

    return (
        <div className="mt-6 flex justify-center">
            <div className="flex items-center gap-8 md:gap-10">
                {domains.map((domain) => {
                    const isActive = domain.key === current;

                    return (
                        <button
                            key={domain.key}
                            type="button"
                            onClick={() => handleClick(domain.key)}
                            className={`
                                group
                                flex flex-col items-center
                                transition-all duration-300
                                ${isActive ? "cursor-default" : "cursor-pointer"}
                                ${isActive ? "opacity-100" : "opacity-60 hover:opacity-95"}
                            `}
                        >
                            {/* Bulle : taille FIXE, différence uniquement via scale → pas de décalage */}
                            <div
                                className={`
                                    relative
                                    flex items-center justify-center
                                    rounded-full
                                    bg-white/40
                                    shadow-md
                                    w-24 h-24 md:w-28 md:h-28
                                    transition-transform duration-300
                                    ${
                                    isActive
                                        ? "scale-110"
                                        : "scale-95 group-hover:scale-100"
                                }
                                `}
                            >
                                {/* Halo lumineux comme avant, sans changer le layout */}
                                <div
                                    className={`
                                        pointer-events-none
                                        absolute inset-0 rounded-full
                                        bg-[radial-gradient(circle,rgba(255,255,255,0.9)_0%,transparent_70%)]
                                        transition-opacity duration-300
                                        ${
                                        isActive
                                            ? "opacity-40"
                                            : "opacity-0 group-hover:opacity-40"
                                    }
                                    `}
                                />

                                <Image
                                    src={domain.iconSrc}
                                    alt={domain.label}
                                    width={120}
                                    height={120}
                                    className="
                                        relative
                                        object-contain
                                        w-[78%] h-[78%]
                                    "
                                />
                            </div>

                            <span
                                className={`
                                    mt-2 text-sm md:text-base font-semibold
                                    text-[#1c2940]
                                    drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]
                                    transition-all
                                    ${isActive ? "tracking-wide" : "opacity-80"}
                                `}
                            >
                                {domain.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
