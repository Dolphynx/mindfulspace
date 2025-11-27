"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "@/i18n/TranslationContext";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";
import { Island } from "@/components/Island";

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
                fixed      /* ⬅️ KEY: pins the page so it cannot scroll */
                top-[80px] /* ⬅️ your navbar height */
                left-0
                w-full
                h-[calc(100vh-80px)]  /* ⬅️ exact remaining space */
                overflow-hidden       /* ⬅️ prevents scrollbar */
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
                    h-[80vh]        /* ocean fills half screen */
                    pointer-events-none
                    z-0
                  "
            >


            <svg
                    viewBox="0 0 1200 700"
                    className="w-full h-full object-fill"
                    preserveAspectRatio="none"
                >
                    <g className="animate-wave opacity-30">
                        <path d="M0 350 Q 300 320, 600 350 T 1200 350 L 1200 700 L 0 700 Z"
                              fill="hsl(var(--ocean-light))" />
                    </g>
                    <g className="animate-wave opacity-40" style={{ animationDelay: "1s" }}>
                        <path d="M0 380 Q 300 350, 600 380 T 1200 380 L 1200 700 L 0 700 Z"
                              fill="hsl(var(--ocean-mid))" />
                    </g>
                    <g className="opacity-60">
                        <path d="M0 420 Q 300 390, 600 420 T 1200 420 L 1200 700 L 0 700 Z"
                              fill="hsl(var(--ocean-deep))" />
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
                    icon="🌙"
                    onClick={() => handleIslandClick("sleep")}
                />

                <div className="hidden md:block">
                    <Island
                        type="meditation"
                        label={t("meditationAlt")}
                        icon="🧘"
                        onClick={() => handleIslandClick("meditation")}
                    />
                </div>

                <Island
                    type="exercise"
                    label={t("exerciceAlt")}
                    icon="💪"
                    onClick={() => handleIslandClick("exercise")}
                />
            </div>

        </div>
    );
}
