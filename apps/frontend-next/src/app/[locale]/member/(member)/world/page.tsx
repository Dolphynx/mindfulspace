"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useTranslations } from "@/i18n/TranslationContext";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

import Island from "@/components/Island";
import DomainTabsPanel from "@/components/DomainTabsPanel";

/**
 * Page "Serenity / World" (espace member).
 *
 * @remarks
 * Cette page affiche :
 * - un décor de fond (dégradé + vagues SVG) fixe et non interactif,
 * - une zone centrale contenant :
 *   - les 3 îlots (Sommeil / Méditation / Exercice),
 *   - le panneau badges + encodage de session (`DomainTabsPanel`).
 *
 * Particularités UI :
 * - Les vagues ne doivent jamais intercepter les clics (`pointer-events-none`).
 * - La page crée une zone scrollable interne (dans l’espace sous le header),
 *   afin de conserver le décor fixe pendant le scroll.
 * - Les îlots sont légèrement abaissés (`mt-*`) pour éviter qu’ils passent sous
 *   le header lorsqu’ils flottent (animation `animate-float`).
 *
 * i18n :
 * - Le namespace utilisé ici est `publicWorld` (labels et accessibilité).
 *
 * Routing :
 * - Les clics sur les îlots redirigent vers `/{locale}/member/domains/{type}`.
 */
export default function SerenityLanding() {
    const router = useRouter();

    /**
     * Déduit la locale depuis le pathname (premier segment).
     *
     * @example
     * /fr/member/world -> fr
     */
    const pathname = usePathname();
    const raw = pathname.split("/")[1] || defaultLocale;
    const locale: Locale = isLocale(raw) ? raw : defaultLocale;

    /**
     * Traducteur pour les libellés/alt de la page.
     */
    const t = useTranslations("publicWorld");

    /**
     * Référence de la zone scrollable interne.
     *
     * @remarks
     * Sert à déterminer si un scroll est nécessaire (contenu > hauteur viewport).
     */
    const scrollRef = useRef<HTMLDivElement | null>(null);

    /**
     * Indique si la zone interne nécessite un scroll vertical.
     *
     * @remarks
     * - `true`  => on active `overflow-y-auto`
     * - `false` => on force `overflow-y-hidden` pour éviter les micro-scrolls inutiles
     */
    const [needsScroll, setNeedsScroll] = useState(false);

    /**
     * Navigation vers un domaine "îlot".
     */
    const handleIslandClick = (type: "sleep" | "meditation" | "exercise") => {
        router.push(`/${locale}/member/domains/${type}`);
    };

    /**
     * Observe la zone scrollable interne afin d’activer/désactiver le scroll
     * selon la hauteur réelle du contenu.
     *
     * @remarks
     * - `ResizeObserver` réagit aux changements de taille (ex: responsive, contenus dynamiques).
     * - On recalcule aussi au `resize` fenêtre pour rester robuste.
     */
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const compute = () => {
            // +1 pour éviter les oscillations sur certains navigateurs (arrondis)
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
            {/* ------------------------------------------------------------------ */}
            {/* Background décor : vagues fixes (non scrollées)                      */}
            {/* ------------------------------------------------------------------ */}
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

            {/* ------------------------------------------------------------------ */}
            {/* Zone scrollable interne : seul le contenu bouge                      */}
            {/* ------------------------------------------------------------------ */}
            <div
                ref={scrollRef}
                className={[
                    "relative z-10 h-full overscroll-contain",
                    needsScroll ? "overflow-y-auto" : "overflow-y-hidden",
                ].join(" ")}
            >
                {/* Contrainte de largeur + padding vertical */}
                <div className="mx-auto w-[92%] max-w-6xl pt-6 pb-8">
                    <div className="flex flex-col items-center gap-8">
                        {/* -------------------------------------------------------------- */}
                        {/* Îlots (navigation domaines)                                     */}
                        {/* -------------------------------------------------------------- */}
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

                        {/* -------------------------------------------------------------- */}
                        {/* Panneau badges + encodage session                                */}
                        {/* -------------------------------------------------------------- */}
                        <DomainTabsPanel />
                    </div>
                </div>
            </div>
        </div>
    );
}
