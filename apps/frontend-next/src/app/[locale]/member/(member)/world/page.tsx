"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "@/i18n/TranslationContext";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";
import { useEffect, useRef, useState } from "react";

import Island from "@/components/Island";
import DomainTabsPanel from "@/components/DomainTabsPanel";

export default function SerenityLanding() {
    const router = useRouter();

    const pathname = usePathname();
    const raw = pathname.split("/")[1] || defaultLocale;
    const locale: Locale = isLocale(raw) ? raw : defaultLocale;

    const t = useTranslations("publicWorld");

    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [needsScroll, setNeedsScroll] = useState(false);

    const handleIslandClick = (type: "sleep" | "meditation" | "exercise") => {
        router.push(`/${locale}/member/domains/${type}`);
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const compute = () => {
            setNeedsScroll(el.scrollHeight > el.clientHeight + 1);
        };

        compute();

        const ro = new ResizeObserver(compute);
        ro.observe(el);

        window.addEventListener("resize", compute);
        return () => {
            ro.disconnect();
            window.removeEventListener("resize", compute);
        };
    }, []);

    return (
        <div
            className="
        fixed
        top-[80px]
        left-0
        w-full
        h-[calc(100vh-80px)]
        bg-gradient-to-b from-[#eef4fa] to-[#dbe8f1]
        z-0
      "
        >
            {/* BACKGROUND WAVES (ne scrollent pas) */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[80vh] z-0">
                <svg
                    viewBox="0 0 1200 700"
                    className="w-[105%] h-full -ml-[2.5%] object-fill"
                    preserveAspectRatio="none"
                >
                    <g className="animate-wave opacity-30">
                        <path
                            d="M -100 350 Q 300 320, 600 350 T 1300 350 L 1300 700 L -100 700 Z"
                            fill="hsl(var(--ocean-light))"
                        />
                    </g>
                    <g className="animate-wave opacity-40" style={{ animationDelay: "1s" }}>
                        <path
                            d="M -100 380 Q 300 350, 600 380 T 1300 380 L 1300 700 L -100 700 Z"
                            fill="hsl(var(--ocean-mid))"
                        />
                    </g>
                    <g className="opacity-60">
                        <path
                            d="M -100 420 Q 300 390, 600 420 T 1300 420 L 1300 700 L -100 700 Z"
                            fill="hsl(var(--ocean-deep))"
                        />
                    </g>
                </svg>
            </div>

            {/* SCROLL AREA (seul ça bouge) */}
            <div
                ref={scrollRef}
                className={[
                    "relative z-10 h-full overscroll-contain",
                    needsScroll ? "overflow-y-auto" : "overflow-y-hidden",
                ].join(" ")}
            >
                {/* Espace haut/bas + centrage horizontal */}
                <div className="mx-auto w-[92%] max-w-6xl pt-6 pb-8">
                    <div className="flex flex-col items-center gap-8">
                        {/* ISLANDS (descendus pour ne jamais passer sous le header pendant l'animation) */}
                        <div className="mt-10 grid grid-cols-3 gap-3 justify-items-center md:mt-14 md:flex md:gap-12 lg:gap-16">
                            <Island
                                type="sleep"
                                label={t("sleepAlt")}
                                iconSrc="/images/icone_sleep.png"
                                onClick={() => handleIslandClick("sleep")}
                                size="xs"
                            />

                            <Island
                                type="meditation"
                                label={t("meditationAlt")}
                                iconSrc="/images/icone_meditation.png"
                                onClick={() => handleIslandClick("meditation")}
                                size="xs"
                            />

                            <Island
                                type="exercise"
                                label={t("exerciceAlt")}
                                iconSrc="/images/icone_exercise.png"
                                onClick={() => handleIslandClick("exercise")}
                                size="xs"
                            />
                        </div>

                        <DomainTabsPanel />
                    </div>
                </div>
            </div>
        </div>
    );
}
