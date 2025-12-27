"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "@/i18n/TranslationContext";

import { HomeBadgesStrip } from "@/components/badges/HomeBadgesStrip";

import SleepManualForm from "@/components/sleep/SleepManualForm";
import MeditationManualForm from "@/components/meditation/MeditationManualForm";
import ExerciseManualForm from "@/components/exercise/ExerciseManualForm";

import { useMeditationSessions } from "@/hooks/useMeditationSessions";
import { useExerciseSessions } from "@/hooks/useExerciseSessions";
import { useSleepSessions } from "@/hooks/useSleepSessions";

import type { MoodValue } from "@/lib";

/**
 * Identifiant de domaine supporté par le panneau.
 *
 * @remarks
 * Sert à piloter l'état (onglet actif) et le rendu des formulaires.
 */
type DomainKey = "sleep" | "meditation" | "exercise";

/**
 * Définition d'un onglet (domaine) dans le panneau "Quick log".
 */
type DomainTab = {
    /** Clé unique du domaine. */
    key: DomainKey;

    /** Clé de traduction (scope `publicWorld`) associée au label/alt du domaine. */
    labelKey: "sleepAlt" | "meditationAlt" | "exerciceAlt";

    /** Source de l'icône (dans `/public/images/...`). */
    iconSrc: string;
};

/**
 * Liste des onglets disponibles dans le panneau "Quick log".
 *
 * @remarks
 * Centraliser cette config évite la duplication du mapping
 * (domaine -> label -> icône).
 */
const TABS: DomainTab[] = [
    { key: "sleep", labelKey: "sleepAlt", iconSrc: "/images/icone_sleep.png" },
    { key: "meditation", labelKey: "meditationAlt", iconSrc: "/images/icone_meditation.png" },
    { key: "exercise", labelKey: "exerciceAlt", iconSrc: "/images/icone_exercise.png" },
];

/**
 * Panneau "Quick log" (legacy) permettant d'encoder une session
 * via des formulaires dédiés (sleep/meditation/exercise).
 *
 * @remarks
 * - L'UI propose une "strip" d'icônes (onglets).
 * - Sur desktop : le formulaire apparaît dans un panneau absolu.
 * - Sur mobile : le formulaire est rendu dans le flux, uniquement si ouvert.
 *
 * **Note d'architecture :**
 * Dans la future page SPA "My World", ce panneau est un candidat à être
 * remplacé par une vue interne "QuickLogView" unique et transversale :
 * - un quick log global,
 * - sélection du domaine à l'intérieur,
 * - compatibilité avec l'historique et les badges.
 */
export default function DomainTabsPanel() {
    const tWorld = useTranslations("publicWorld");
    const tCommon = useTranslations("common");

    const [active, setActive] = useState<DomainKey | null>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    /**
     * Configuration de l'onglet actif (si défini).
     */
    const activeTab = useMemo(() => (active ? TABS.find((x) => x.key === active) : null), [active]);

    // --- Data/hooks domain-specific ------------------------------------------------

    const {
        types: meditationTypes,
        loading: meditationLoading,
        errorType: meditationErrorType,
        createSession: createMeditationSession,
    } = useMeditationSessions();

    const {
        types: exerciceTypes,
        loading: exerciceLoading,
        errorType: exerciceErrorType,
        createSession: createExerciceSession,
    } = useExerciseSessions();

    const { loading: sleepLoading, errorType: sleepErrorType, createSession: createSleepSession } =
        useSleepSessions();

    /**
     * Indique si au moins un domaine est en chargement.
     */
    const anyLoading = meditationLoading || exerciceLoading || sleepLoading;

    /**
     * Message d'erreur générique si un hook signale une erreur.
     *
     * @remarks
     * Si tu veux être plus précis : mapper les `errorType` vers des messages dédiés.
     */
    const errorText =
        meditationErrorType || exerciceErrorType || sleepErrorType
            ? tCommon?.("genericError") ?? "Une erreur est survenue."
            : null;

    /**
     * Ouvre/ferme le panneau selon l'onglet sélectionné.
     *
     * @param next - Domaine sélectionné.
     */
    function handleTabClick(next: DomainKey) {
        if (active === next) {
            setIsOpen((v) => !v);
            return;
        }
        setActive(next);
        setIsOpen(true);
    }

    // --- Action wrappers (typed, no any) -------------------------------------------

    /**
     * Handler de création de session de méditation.
     *
     * @param payload - Données nécessaires à la création côté API.
     */
    const onCreateMeditationSessionAction = async (payload: {
        durationSeconds: number;
        moodAfter?: MoodValue;
        dateSession: string;
        meditationTypeId: string;
    }) => createMeditationSession(payload);

    /**
     * Handler de création de session d'exercice.
     *
     * @param payload - Données nécessaires à la création côté API.
     */
    const onCreateExerciceSessionAction = async (payload: {
        dateSession: string;
        quality?: MoodValue;
        exercices: { exerciceContentId: string; repetitionCount: number }[];
    }) => createExerciceSession(payload);

    /**
     * Handler de création de session de sommeil.
     *
     * @param payload - Données nécessaires à la création côté API.
     */
    const onCreateSleepSessionAction = async (payload: {
        hours: number;
        quality?: MoodValue;
        dateSession: string;
    }) => createSleepSession(payload);

    return (
        <div className="w-full lg:w-[380px]">
            {/* BADGES (au-dessus) */}
            <div className="mb-3 flex flex-col items-end">
                <HomeBadgesStrip compact />
            </div>

            {/* QUICK LOG + PANNEAUX */}
            <div className="relative flex flex-col items-end">
                {/* Strip Quick log */}
                <div className="rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow-md backdrop-blur">
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500 text-right">
                        {tWorld("encodeSessionTitle")}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        {TABS.map((tab) => {
                            const isActive = tab.key === active;

                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => handleTabClick(tab.key)}
                                    aria-selected={isActive}
                                    title={tWorld(tab.labelKey)}
                                    className={[
                                        "relative h-9 w-9 rounded-full overflow-hidden transition",
                                        "bg-transparent",
                                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2",
                                        isActive ? "ring-2 ring-slate-300" : "hover:bg-slate-50/40",
                                    ].join(" ")}
                                >
                                    <Image src={tab.iconSrc} alt={tWorld(tab.labelKey)} fill className="object-contain" />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* DESKTOP: panneau sous la strip (positionné en absolu) */}
                <div
                    className={[
                        "hidden lg:block",
                        "absolute right-0 top-[calc(100%+12px)]",
                        "transition-all duration-500",
                        isOpen ? "opacity-100" : "pointer-events-none opacity-0",
                    ].join(" ")}
                >
                    <div className="w-[520px] rounded-3xl bg-white/80 shadow-lg backdrop-blur p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="text-sm font-semibold text-slate-800">
                                    {activeTab ? tWorld(activeTab.labelKey) : tWorld("encodeSessionTitle")}
                                </div>
                                <div className="mt-1 text-xs text-slate-500">
                                    {anyLoading ? (tCommon?.("loading") ?? "Chargement…") : ""}
                                    {!anyLoading && errorText ? errorText : ""}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                            >
                                {tCommon?.("close") ?? "Fermer"}
                            </button>
                        </div>

                        <div className="mt-4">
                            {active === "sleep" && <SleepManualForm onCreateSessionAction={onCreateSleepSessionAction} />}

                            {active === "meditation" && (
                                <MeditationManualForm
                                    types={meditationTypes ?? []}
                                    onCreateSessionAction={onCreateMeditationSessionAction}
                                    defaultOpen
                                    compact
                                />
                            )}

                            {active === "exercise" && (
                                <ExerciseManualForm
                                    types={exerciceTypes ?? []}
                                    onCreateSessionAction={onCreateExerciceSessionAction}
                                    defaultOpen
                                    compact
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* MOBILE: panneau sous la strip (dans le flux) */}
                {isOpen ? (
                    <div className="lg:hidden mt-3 w-full rounded-3xl bg-white/75 shadow-md backdrop-blur p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div className="text-sm font-semibold text-slate-800">
                                {activeTab ? tWorld(activeTab.labelKey) : tWorld("encodeSessionTitle")}
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                            >
                                {tCommon?.("close") ?? "Fermer"}
                            </button>
                        </div>

                        <div className="mt-2 min-h-[18px] text-xs text-slate-500">
                            {anyLoading ? (tCommon?.("loading") ?? "Chargement…") : ""}
                            {!anyLoading && errorText ? <span className="text-rose-700">{errorText}</span> : null}
                        </div>

                        <div className="mt-3">
                            {active === "sleep" && <SleepManualForm onCreateSessionAction={onCreateSleepSessionAction} />}

                            {active === "meditation" && (
                                <MeditationManualForm
                                    types={meditationTypes ?? []}
                                    onCreateSessionAction={onCreateMeditationSessionAction}
                                    defaultOpen
                                    compact
                                />
                            )}

                            {active === "exercise" && (
                                <ExerciseManualForm
                                    types={exerciceTypes ?? []}
                                    onCreateSessionAction={onCreateExerciceSessionAction}
                                    defaultOpen
                                    compact
                                />
                            )}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
