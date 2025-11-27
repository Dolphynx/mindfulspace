"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "@/i18n/TranslationContext";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";
import Island from "@/components/Island";

export default function SerenityLanding() {
    const router = useRouter();

    const pathname = usePathname();
    const raw = pathname.split("/")[1] || defaultLocale;
    const locale: Locale = isLocale(raw) ? raw : defaultLocale;
    const t = useTranslations("publicWorld");

    const handleIslandClick = (type: "sleep" | "meditation" | "exercise") => {
        router.push(`/${locale}/member/domains/${type}`);
    };

    return (
        <div
            className="
                fixed
                top-[80px]
                left-0
                w-full
                h-[calc(100vh-80px)]
                overflow-hidden
                bg-gradient-to-b from-[#eef4fa] to-[#dbe8f1]
                z-0
            "
        >
            {/* WAVES */}
            <div
                className="
                    absolute
                    bottom-0
                    left-0
                    w-full
                    h-[80vh]
                    pointer-events-none
                    z-0
                "
            >
                <svg
                    viewBox="0 0 1200 700"
                    className="w-[105%] h-full -ml-[2.5%] object-fill"
                    preserveAspectRatio="none"
                >
                    <g className="animate-wave opacity-30">
                        <path
                            d="
                                M -100 350
                                Q 300 320, 600 350
                                T 1300 350
                                L 1300 700
                                L -100 700
                                Z
                            "
                            fill="hsl(var(--ocean-light))"
                        />
                    </g>
                    <g
                        className="animate-wave opacity-40"
                        style={{ animationDelay: "1s" }}
                    >
                        <path
                            d="
                                M -100 380
                                Q 300 350, 600 380
                                T 1300 380
                                L 1300 700
                                L -100 700
                                Z
                            "
                            fill="hsl(var(--ocean-mid))"
                        />
                    </g>
                    <g className="opacity-60">
                        <path
                            d="
                                M -100 420
                                Q 300 390, 600 420
                                T 1300 420
                                L 1300 700
                                L -100 700
                                Z
                            "
                            fill="hsl(var(--ocean-deep))"
                        />
                    </g>
                </svg>
            </div>

            {/* ISLANDS */}
            <div
                className="
                    absolute
                    top-1/2
                    left-1/2
                    -translate-x-1/2
                    -translate-y-1/2
                    flex
                    gap-12 md:gap-20 lg:gap-28
                    z-10
                "
            >
                <Island
                    type="sleep"
                    label={t("sleepAlt")}
                    iconSrc="/images/icone_sleep.png"
                    onClick={() => handleIslandClick("sleep")}
                />

                <div className="hidden md:block">
                    <Island
                        type="meditation"
                        label={t("meditationAlt")}
                        iconSrc="/images/icone_meditation.png"
                        onClick={() => handleIslandClick("meditation")}
                    />
                </div>

                <Island
                    type="exercise"
                    label={t("exerciceAlt")}
                    iconSrc="/images/icone_exercise.png"
                    onClick={() => handleIslandClick("exercise")}
                />
            </div>
        </div>
    );
}
