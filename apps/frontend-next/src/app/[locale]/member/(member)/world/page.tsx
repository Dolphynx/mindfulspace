"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "@/i18n/TranslationContext";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";
import { Island } from "@/components/Island";

export default function SerenityLanding() {
    const router = useRouter();

    // Locale detection
    const pathname = usePathname();
    const raw = pathname.split("/")[1] || defaultLocale;
    const locale: Locale = isLocale(raw) ? raw : defaultLocale;
    const t = useTranslations("publicWorld");

    const handleIslandClick = (type: "sleep" | "meditation" | "exercise") => {
        router.push(`/${locale}/member/domains/${type}`);
    };

    return (
        <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-[#eef4fa] to-[#dbe8f1] flex flex-col items-center">
            {/* --- MAIN CANVAS --- */}
            <div className="relative w-full max-w-6xl mx-auto mt-24 px-4">
                <svg
                    viewBox="0 0 1200 700"
                    className="w-full h-auto"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* --- OCEAN WAVES WITH ANIMATION --- */}
                    <g className="animate-wave opacity-30">
                        <path
                            d="M0 350 Q 300 320, 600 350 T 1200 350 L 1200 700 L 0 700 Z"
                            fill="hsl(var(--ocean-light))"
                        />
                    </g>

                    <g className="animate-wave opacity-40" style={{ animationDelay: "1s" }}>
                        <path
                            d="M0 380 Q 300 350, 600 380 T 1200 380 L 1200 700 L 0 700 Z"
                            fill="hsl(var(--ocean-mid))"
                        />
                    </g>

                    <g className="opacity-60">
                        <path
                            d="M0 420 Q 300 390, 600 420 T 1200 420 L 1200 700 L 0 700 Z"
                            fill="hsl(var(--ocean-deep))"
                        />
                    </g>

                    {/* --- Islands (Sleep / Meditation / Exercise) --- */}
                    <foreignObject x="150" y="280" width="250" height="250">
                        <Island
                            type="sleep"
                            label={t("sleepAlt")}
                            icon="🌙"
                            onClick={() => handleIslandClick("sleep")}
                        />
                    </foreignObject>

                    <foreignObject x="475" y="180" width="250" height="250">
                        <Island
                            type="meditation"
                            label={t("meditationAlt")}
                            icon="🧘"
                            onClick={() => handleIslandClick("meditation")}
                        />
                    </foreignObject>

                    <foreignObject x="800" y="280" width="250" height="250">
                        <Island
                            type="exercise"
                            label={t("exerciceAlt")}
                            icon="💪"
                            onClick={() => handleIslandClick("exercise")}
                        />
                    </foreignObject>
                </svg>
            </div>
        </div>
    );
}
