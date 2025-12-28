"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import MoodPicker from "@/components/shared/MoodPicker";
import type { MoodValue } from "@/lib";

import { isLocale, defaultLocale, type Locale } from "@/i18n/config";
import { useTranslations } from "@/i18n/TranslationContext";

import { useConfetti } from "@/components/confetti/ConfettiProvider";
import { useAppToasts } from "@/components/toasts/AppToastProvider";

import { fetchMeditationTypes } from "@/lib/api/meditation";
import { apiFetch } from "@/lib/api/client";

import { formatLocalYYYYMMDD } from "@/lib/date";

/**
 * Étapes du flux unifié de respiration.
 *
 * @remarks
 * Cette page regroupe :
 * - humeur avant,
 * - respiration guidée,
 * - humeur après,
 * - récapitulatif (mantra IA) + enregistrement.
 */
type Step = "MOOD_BEFORE" | "BREATHING" | "MOOD_AFTER" | "RECAP";

/**
 * Nombre total de cycles de respiration.
 */
const BREATHING_TOTAL_CYCLES = 3;

/**
 * Durées (ms) des phases d’un cycle : inspiration / pause / expiration.
 */
const BREATHING_PHASES_MS = [4000, 4000, 4000] as const;

/**
 * Durée totale (en secondes) calculée à partir des cycles et des phases.
 */
const BREATHING_DURATION_SECONDS =
    (BREATHING_TOTAL_CYCLES * BREATHING_PHASES_MS.reduce((a, b) => a + b, 0)) /
    1000;

/**
 * Slug stable du type de méditation correspondant à la respiration.
 */
const BREATHING_TYPE_SLUG = "breathing";

/**
 * Source fixée pour une séance créée via un flux automatisé.
 *
 * @remarks
 * Doit correspondre à l’enum Prisma `MeditationSessionSource`.
 */
const BREATHING_SOURCE = "QUICK_TIMER";

/**
 * DTO minimal des types de méditation consommés côté frontend.
 */
type MeditationTypeItem = {
    id: string;
    slug: string;
    isActive: boolean;
};

/**
 * Payload de création d'une séance de méditation.
 */
type CreateMeditationSessionPayload = {
    source?: string;
    meditationTypeId: string;
    meditationContentId?: string;
    dateSession: string;
    durationSeconds: number;
    moodBefore?: number;
    moodAfter?: number;
    notes?: string;
};

/**
 * Réponse de `POST /me/meditation-sessions`.
 */
type CreateMeditationSessionResponse = {
    session: unknown;
    newBadges: unknown[];
};

/**
 * Phases affichées pendant la respiration.
 */
type BreathingPhase = "inhale" | "hold" | "exhale";

/**
 * Mapping UI des phases (texte + styles).
 */
const PHASE_UI: Record<
    BreathingPhase,
    {
        labelKey: "phaseInhale" | "phaseHold" | "phaseExhale";
        gradient: string;
        scale: string;
    }
> = {
    inhale: {
        labelKey: "phaseInhale",
        gradient: "from-emerald-400 to-green-600",
        scale: "scale-110",
    },
    hold: {
        labelKey: "phaseHold",
        gradient: "from-cyan-400 to-sky-500",
        scale: "scale-100",
    },
    exhale: {
        labelKey: "phaseExhale",
        gradient: "from-amber-400 to-orange-500",
        scale: "scale-90",
    },
};

/**
 * Page unifiée du flux de respiration.
 *
 * @remarks
 * Dépendances :
 * - Les providers `ConfettiProvider` et `AppToastProvider` doivent englober l’application.
 * - La fonction {@link apiFetch} centralise la communication avec l'API (base URL, cookies, refresh).
 */
export default function BreathingUnifiedPage() {
    const router = useRouter();

    const params = useParams<{ locale?: string }>();
    const raw = params.locale ?? defaultLocale;
    const locale: Locale = isLocale(raw) ? raw : defaultLocale;

    const tRecap = useTranslations("sessionRecap");
    const tBreathing = useTranslations("breathingSession");
    const tTip = useTranslations("tipSession");

    const { fire } = useConfetti();
    const { pushToast } = useAppToasts();

    const [step, setStep] = useState<Step>("MOOD_BEFORE");

    const [moodBefore, setMoodBefore] = useState<MoodValue | null>(null);
    const [moodAfter, setMoodAfter] = useState<MoodValue | null>(null);

    const [phase, setPhase] = useState<BreathingPhase>("inhale");
    const [remainingSeconds, setRemainingSeconds] = useState<number>(
        BREATHING_DURATION_SECONDS,
    );
    const [cycle, setCycle] = useState<number>(1);

    const [meditationTypeId, setMeditationTypeId] = useState<string | null>(null);
    const [loadingType, setLoadingType] = useState<boolean>(true);

    /**
     * Données “RECAP” : mantra IA (optionnel).
     *
     * @remarks
     * Chargées à l'entrée dans l'étape `RECAP`.
     */
    const [mantra, setMantra] = useState<string | null>(null);

    /**
     * Indique le chargement du mantra lors de l’étape `RECAP`.
     */
    const [loadingMantra, setLoadingMantra] = useState<boolean>(false);

    /**
     * Timestamps d’exécution de la respiration.
     *
     * @remarks
     * Non affichés, mais utiles si le contrat évolue ou pour diagnostic.
     */
    const startedAtRef = useRef<string | null>(null);
    const endedAtRef = useRef<string | null>(null);

    const [saving, setSaving] = useState<boolean>(false);
    const [saved, setSaved] = useState<boolean>(false);

    /**
     * Réinitialise l'état UI afin qu'une nouvelle séance puisse repartir proprement.
     *
     * @remarks
     * Cette fonction n'efface aucune donnée serveur.
     * Elle remet uniquement les états locaux dans une configuration initiale.
     */
    const resetLocalSessionState = () => {
        setStep("MOOD_BEFORE");
        setMoodBefore(null);
        setMoodAfter(null);

        setPhase("inhale");
        setRemainingSeconds(BREATHING_DURATION_SECONDS);
        setCycle(1);

        startedAtRef.current = null;
        endedAtRef.current = null;

        setSaving(false);
        setSaved(false);

        setMantra(null);
        setLoadingMantra(false);
    };

    /**
     * Abandonne la séance en cours (sans enregistrement) et redirige vers le dashboard.
     *
     * @remarks
     * - N'appelle aucune API.
     * - Réinitialise l'état local pour éviter qu'une séance incomplète persiste.
     */
    const handleSkipToDashboard = () => {
        resetLocalSessionState();
        router.push(`/${locale}/member/world-v2`);
    };

    /**
     * Résout `meditationTypeId` à partir du slug stable.
     *
     * @remarks
     * Appelle l'endpoint public des types de méditation, puis sélectionne le type actif
     * correspondant à {@link BREATHING_TYPE_SLUG}.
     */
    useEffect(() => {
        (async () => {
            try {
                const types = (await fetchMeditationTypes()) as MeditationTypeItem[];

                const breathing = types.find(
                    (t) => t.slug === BREATHING_TYPE_SLUG && t.isActive,
                );

                if (!breathing) {
                    pushToast({
                        kind: "error",
                        message: `Type de méditation '${BREATHING_TYPE_SLUG}' introuvable`,
                    });
                    return;
                }

                setMeditationTypeId(breathing.id);
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error("[BreathingUnifiedPage] fetchMeditationTypes failed", e);
                pushToast({
                    kind: "error",
                    message: "Impossible de charger les types de méditation",
                });
            } finally {
                setLoadingType(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Timer/animation de respiration basé sur `requestAnimationFrame`.
     *
     * @remarks
     * Construit un planning de phases sur `BREATHING_TOTAL_CYCLES`,
     * met à jour la phase courante, le cycle courant et le temps restant,
     * puis bascule vers `MOOD_AFTER` à la fin.
     */
    useEffect(() => {
        if (step !== "BREATHING") return;

        startedAtRef.current = new Date().toISOString();
        endedAtRef.current = null;

        setPhase("inhale");
        setCycle(1);
        setRemainingSeconds(BREATHING_DURATION_SECONDS);

        const perCycleMs = BREATHING_PHASES_MS.reduce((a, b) => a + b, 0);
        const totalMs = BREATHING_TOTAL_CYCLES * perCycleMs;

        const schedule: Array<{ at: number; phase: BreathingPhase }> = [];
        let cursor = 0;

        for (let i = 0; i < BREATHING_TOTAL_CYCLES; i++) {
            schedule.push({ at: cursor, phase: "inhale" });
            cursor += BREATHING_PHASES_MS[0];

            schedule.push({ at: cursor, phase: "hold" });
            cursor += BREATHING_PHASES_MS[1];

            schedule.push({ at: cursor, phase: "exhale" });
            cursor += BREATHING_PHASES_MS[2];
        }

        const start = Date.now();
        let raf: number | null = null;

        const tick = () => {
            const elapsed = Date.now() - start;
            const remaining = Math.max(0, totalMs - elapsed);

            setRemainingSeconds(Math.ceil(remaining / 1000));

            for (let i = schedule.length - 1; i >= 0; i--) {
                if (elapsed >= schedule[i].at) {
                    setPhase(schedule[i].phase);
                    break;
                }
            }

            const computedCycle = Math.min(
                BREATHING_TOTAL_CYCLES,
                Math.floor(elapsed / perCycleMs) + 1,
            );
            setCycle(computedCycle);

            if (remaining <= 0) {
                endedAtRef.current = new Date().toISOString();
                setStep("MOOD_AFTER");
                return;
            }

            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);

        return () => {
            if (raf !== null) cancelAnimationFrame(raf);
        };
    }, [step]);

    /**
     * Charge le mantra IA lors de l’entrée dans l’étape `RECAP`.
     *
     * @remarks
     * Le mantra est optionnel : en cas d’échec, l’UI continue sans afficher le bloc.
     */
    useEffect(() => {
        if (step !== "RECAP") return;

        let cancelled = false;

        const loadMantra = async () => {
            setLoadingMantra(true);

            try {
                const res = await apiFetch("/ai/mantra", {
                    method: "POST",
                    body: JSON.stringify({ locale }),
                });

                if (!res.ok) {
                    if (!cancelled) setMantra(null);
                    return;
                }

                const data = (await res.json()) as { mantra?: string };
                if (!cancelled) setMantra(data.mantra ?? null);
            } catch {
                if (!cancelled) setMantra(null);
            } finally {
                if (!cancelled) setLoadingMantra(false);
            }
        };

        loadMantra();

        return () => {
            cancelled = true;
        };
    }, [step, locale]);

    /**
     * Enregistre la séance en base via l'API.
     *
     * @remarks
     * Après succès, redirige vers le dashboard pour terminer le flux.
     */
    async function saveSession(): Promise<void> {
        if (!moodBefore || !moodAfter || !meditationTypeId) return;

        setSaving(true);

        try {
            const payload: CreateMeditationSessionPayload = {
                dateSession: formatLocalYYYYMMDD(),
                durationSeconds: BREATHING_DURATION_SECONDS,
                source: BREATHING_SOURCE,
                meditationTypeId,
                moodBefore: Number(moodBefore),
                moodAfter: Number(moodAfter),
            };

            const res = await apiFetch("/me/meditation-sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const contentType = res.headers.get("content-type") ?? "";
                let details = "";

                try {
                    if (contentType.includes("application/json")) {
                        const j = await res.json();
                        details = typeof j?.message === "string" ? j.message : JSON.stringify(j);
                    } else {
                        details = await res.text();
                    }
                } catch {
                    // ignore parse errors
                }

                throw new Error(`Échec enregistrement séance (${res.status}) ${details}`.trim());
            }

            const data = (await res.json()) as CreateMeditationSessionResponse;

            pushToast({
                kind: "success",
                message: "Séance de respiration enregistrée.",
            });

            if (Array.isArray(data.newBadges) && data.newBadges.length > 0) {
                fire(4000);
            }

            setSaved(true);
            router.push(`/${locale}/member/world-v2`);
        } catch (e) {
            pushToast({
                kind: "error",
                message:
                    e instanceof Error ? e.message : "Erreur lors de l’enregistrement",
            });
        } finally {
            setSaving(false);
        }
    }

    /**
     * Score dérivé de l'humeur finale (convention UI).
     *
     * @remarks
     * Non affiché dans cette page, conservé si une réintégration ultérieure est souhaitée.
     */
    const scoreAfter = useMemo<number>(
        () => (moodAfter ? Number(moodAfter) * 20 : 0),
        [moodAfter],
    );

    /**
     * Classe Tailwind pour le bouton principal.
     */
    const primaryBtn =
        "px-6 py-3 rounded-full bg-brandGreen text-white hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed";

    if (loadingType) {
        return <main className="p-8 text-center">Chargement…</main>;
    }

    return (
        <main className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-8 text-center px-4 relative">
            {(step === "BREATHING" ||
                step === "MOOD_BEFORE" ||
                step === "MOOD_AFTER") && (
                <button
                    onClick={handleSkipToDashboard}
                    className="absolute top-4 right-4 px-4 py-2 rounded-full bg-brandGreen/20 text-brandGreen hover:bg-brandGreen/30 transition"
                    type="button"
                >
                    {tBreathing("skip")}
                </button>
            )}

            {step === "MOOD_BEFORE" && (
                <>
                    <h1 className="text-3xl">{tBreathing("title")}</h1>

                    <MoodPicker value={moodBefore} onChangeAction={setMoodBefore} />

                    <button
                        disabled={!moodBefore || !meditationTypeId}
                        onClick={() => setStep("BREATHING")}
                        className={primaryBtn}
                        type="button"
                    >
                        Commencer la respiration
                    </button>
                </>
            )}

            {step === "BREATHING" && (
                <>
                    <h1 className="text-4xl md:text-5xl text-brandText">
                        {tBreathing("title")}
                    </h1>

                    <div
                        className={[
                            "relative w-64 h-64 rounded-full flex items-center justify-center",
                            "text-3xl md:text-5xl text-white",
                            "transition-all duration-[4000ms]",
                            "bg-gradient-to-br",
                            PHASE_UI[phase].gradient,
                            PHASE_UI[phase].scale,
                        ].join(" ")}
                    >
            <span className="drop-shadow-md">
              {tBreathing(PHASE_UI[phase].labelKey)}
            </span>
                    </div>

                    <div className="text-brandText-soft">
                        <p>
                            {tBreathing("cycle")} {cycle} / {BREATHING_TOTAL_CYCLES}
                        </p>
                        <p>{tBreathing("followInstruction")}</p>
                        <p className="mt-2 text-sm opacity-75">{remainingSeconds}s</p>
                    </div>
                </>
            )}

            {step === "MOOD_AFTER" && (
                <>
                    <h1 className="text-3xl">Et maintenant ?</h1>

                    <MoodPicker value={moodAfter} onChangeAction={setMoodAfter} />

                    <button
                        disabled={!moodAfter}
                        onClick={() => setStep("RECAP")}
                        className={primaryBtn}
                        type="button"
                    >
                        Continuer
                    </button>
                </>
            )}

            {step === "RECAP" && (
                <>
                    <h1 className="text-4xl">{tRecap("title")}</h1>

                    {mantra && (
                        <div className="bg-white border border-brandBorder rounded-2xl shadow-card px-6 py-8 max-w-2xl text-xl italic text-brandText-soft">
                            « {mantra} »
                            <br />
                            {/* <small className="top-0 text-xs">{tTip("mantraSourceLabel")}</small> */}
                        </div>
                    )}

                    {!mantra && loadingMantra && (
                        <div className="text-brandText-soft">Chargement…</div>
                    )}

                    <button
                        onClick={saveSession}
                        disabled={saving || saved}
                        className={primaryBtn}
                        type="button"
                    >
                        {saved ? "Enregistré ✓" : saving ? "Enregistrement…" : "Enregistrer"}
                    </button>
                </>
            )}
        </main>
    );
}
