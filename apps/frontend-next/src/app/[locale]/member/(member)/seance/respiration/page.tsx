"use client";

/**
 * Page de respiration guidée — version i18n
 * ----------------------------------------
 * Toutes les chaînes utilisateur sont externalisées dans le dictionnaire
 * `breathingSession`.
 *
 * Le reste de la logique (timers, phases, redirection) est inchangé.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "@/i18n/TranslationContext";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

export default function RespirationPage() {
    const router = useRouter();
    const pathname = usePathname();

    // Détermination de la locale à partir de /fr/member/... ou /en/member/...
    const raw = pathname.split("/")[1] || defaultLocale;
    const locale: Locale = isLocale(raw) ? raw : defaultLocale;

    const t = useTranslations("breathingSession");

    /** Phase actuelle */
    const [phase, setPhase] = useState<"inspirez" | "bloquez" | "expirez">("inspirez");
    /** Cycle courant */
    const [cycle, setCycle] = useState(1);
    /** Nombre total de cycles */
    const totalCycles = 3;

    /** Séquence des phases */
    const sequence = useRef([
        { p: "inspirez" as const, d: 4000 },
        { p: "bloquez" as const, d: 4000 },
        { p: "expirez" as const, d: 4000 },
    ]);

    const aliveRef = useRef(true);
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    /** Aller vers la phase suivante de la séance : humeur */
    const goNext = useCallback(() => {
        if (aliveRef.current)
            router.push(`/${locale}/member/seance/humeur`);
    }, [router, locale]);

    /** Bouton Skip → passer à l’étape astuce */
    const handleSkip = () => {
        if (aliveRef.current)
            router.push(`/${locale}/member/seance/astuce`);
    };

    /** Skip All → passer au dashboard */
    const handleSkipAll = () => {
        if (aliveRef.current)
            router.push(`/${locale}/member/world`);
    };

    /** Effet principal : boucle respiration */
    useEffect(() => {
        aliveRef.current = true;

        try {
            router.prefetch(`/${locale}/member/seance/humeur`);
        } catch {}

        let i = 0;

        const run = () => {
            if (!aliveRef.current) return;

            const cur = sequence.current[i % sequence.current.length];
            setPhase(cur.p);

            const t = setTimeout(() => {
                if (!aliveRef.current) return;

                i++;

                if (i % sequence.current.length === 0) {
                    setCycle((c) => {
                        const next = c + 1;
                        if (next > totalCycles) {
                            queueMicrotask(goNext);
                            return c;
                        }
                        return next;
                    });
                }

                run();
            }, cur.d);

            timersRef.current.push(t);
        };

        run();

        return () => {
            aliveRef.current = false;
            for (const t of timersRef.current) clearTimeout(t);
            timersRef.current = [];
        };
    }, [router, goNext, locale]);

    /** Couleurs dynamiques */
    const colorMap = {
        inspirez: "from-emerald-400 to-green-600",
        bloquez: "from-cyan-400 to-sky-500",
        expirez: "from-amber-400 to-orange-500",
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center text-center gap-8 relative">

            {/* Boutons Skip */}
            <button
                onClick={handleSkip}
                className="absolute top-4 right-4 px-4 py-2 rounded-full bg-brandGreen/20 text-brandGreen hover:bg-brandGreen/30 transition"
            >
                {t("skipStep")} ⏩
            </button>

            <button
                onClick={handleSkipAll}
                className="absolute top-4 right-40 px-4 py-2 rounded-full bg-brandGreen/20 text-brandGreen hover:bg-brandGreen/30 transition"
            >
                {t("skipAll")} ⏩
            </button>

            <h1 className="text-4xl md:text-5xl text-brandText">
                {t("title")}
            </h1>

            {/* Cercle animé */}
            <div
                className={`relative w-64 h-64 rounded-full flex items-center justify-center text-3xl md:text-5xl text-white transition-all duration-[4000ms]
                    ${
                    phase === "inspirez"
                        ? "scale-110"
                        : phase === "expirez"
                            ? "scale-90"
                            : "scale-100"
                }
                    bg-gradient-to-br ${colorMap[phase]}
                `}
            >
                <span className="drop-shadow-md">
                    {phase === "inspirez"
                        ? t("phaseInhale")
                        : phase === "bloquez"
                            ? t("phaseHold")
                            : t("phaseExhale")}
                </span>
            </div>

            {/* Infos cycle */}
            <div className="text-brandText-soft">
                <p>
                    {t("cycle")} {cycle} / {totalCycles}
                </p>
                <p>{t("followInstruction")}</p>
            </div>
        </main>
    );
}
