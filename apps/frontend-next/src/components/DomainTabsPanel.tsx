"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "@/i18n/TranslationContext";

import { HomeBadgesStrip } from "@/components/badges/HomeBadgesStrip";

import SleepManualForm from "@/components/sleep/SleepManualForm";
import MeditationManualForm from "@/components/meditation/MeditationManualForm";
import ExerciceManualForm from "@/components/exercise/ExerciceManualForm";

import { useMeditationSessions } from "@/hooks/useMeditationSessions";
import { useExerciceSessions } from "@/hooks/useExerciceSessions";
import { useSleepSessions } from "@/hooks/useSleepSessions";

import type { MoodValue } from "@/lib";

/**
 * Identifiants des domaines supportés par le panneau.
 *
 * @remarks
 * Ces clés servent à :
 * - piloter l’état (onglet actif),
 * - décider quel formulaire afficher,
 * - garder une API stable côté UI.
 */
type DomainKey = "sleep" | "meditation" | "exercise";

/**
 * Configuration d’un onglet du panneau.
 */
type DomainTab = {
    /**
     * Clé interne du domaine.
     */
    key: DomainKey;

    /**
     * Clé i18n (namespace `publicWorld`) utilisée pour le libellé et l’accessibilité.
     */
    labelKey: "sleepAlt" | "meditationAlt" | "exerciceAlt";

    /**
     * Chemin de l’icône (les mêmes images que les îlots).
     */
    iconSrc: string;
};

/**
 * Liste des onglets affichés.
 *
 * @remarks
 * L’ordre de ce tableau correspond à l’ordre visuel dans l’UI.
 */
const TABS: DomainTab[] = [
    { key: "sleep", labelKey: "sleepAlt", iconSrc: "/images/icone_sleep.png" },
    {
        key: "meditation",
        labelKey: "meditationAlt",
        iconSrc: "/images/icone_meditation.png",
    },
    { key: "exercise", labelKey: "exerciceAlt", iconSrc: "/images/icone_exercise.png" },
];

/**
 * Panneau "Badges + Encoder une session" affiché sur la page Serenity/World.
 *
 * @remarks
 * Fonctionnement attendu :
 * - Au chargement : box du formulaire fermée, aucun onglet sélectionné.
 * - Clic sur un onglet :
 *   - sélection de l’onglet,
 *   - ouverture de la box,
 *   - affichage du formulaire du domaine.
 * - Re-clic sur l’onglet actif : ouverture/fermeture (toggle).
 *
 * Le panneau s’appuie sur les hooks existants pour charger les types et créer
 * des sessions (méditation/exercice/sommeil).
 */
export default function DomainTabsPanel() {
    const tWorld = useTranslations("publicWorld");
    const tCommon = useTranslations("common");

    /**
     * Onglet actif.
     *
     * @remarks
     * `null` au départ pour respecter la contrainte "aucun onglet sélectionné".
     */
    const [active, setActive] = useState<DomainKey | null>(null);

    /**
     * État d’ouverture/fermeture de la box formulaire (collapsible).
     */
    const [isOpen, setIsOpen] = useState<boolean>(false);

    /**
     * Meta de l’onglet actif (libellé + icône).
     */
    const activeTab = useMemo(
        () => (active ? TABS.find((x) => x.key === active) : null),
        [active],
    );

    // ---------------------------------------------------------------------------
    // Hooks (identiques à tes pages spécifiques d’îlots)
    // ---------------------------------------------------------------------------

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
    } = useExerciceSessions();

    const {
        loading: sleepLoading,
        errorType: sleepErrorType,
        createSession: createSleepSession,
    } = useSleepSessions();

    /**
     * Indique si une partie du panneau est en chargement.
     */
    const anyLoading = meditationLoading || exerciceLoading || sleepLoading;

    /**
     * Message d’erreur générique (i18n si disponible).
     */
    const errorText =
        meditationErrorType || exerciceErrorType || sleepErrorType
            ? tCommon?.("genericError") ?? "Une erreur est survenue."
            : null;

    // ---------------------------------------------------------------------------
    // Handlers
    // ---------------------------------------------------------------------------

    /**
     * Gestion du clic sur un onglet.
     *
     * @remarks
     * - Si on clique l’onglet déjà actif : toggle ouverture/fermeture.
     * - Sinon : on sélectionne le nouvel onglet et on ouvre la box.
     */
    function handleTabClick(next: DomainKey) {
        if (active === next) {
            setIsOpen((v) => !v);
            return;
        }
        setActive(next);
        setIsOpen(true);
    }

    /**
     * Handler de création de session de méditation.
     *
     * @remarks
     * Suffixe `Action` par convention projet.
     */
    const onCreateMeditationSessionAction = async (payload: {
        durationSeconds: number;
        moodAfter?: MoodValue;
        dateSession: string;
        meditationTypeId: string;
    }) => createMeditationSession(payload);

    /**
     * Handler de création de session d’exercice.
     *
     * @remarks
     * Suffixe `Action` par convention projet.
     */
    const onCreateExerciceSessionAction = async (payload: {
        dateSession: string;
        quality?: MoodValue;
        exercices: { exerciceContentId: string; repetitionCount: number }[];
    }) => createExerciceSession(payload);

    /**
     * Handler de création de session de sommeil.
     *
     * @remarks
     * Suffixe `Action` par convention projet.
     */
    const onCreateSleepSessionAction = async (payload: {
        hours: number;
        quality?: MoodValue;
        dateSession: string;
    }) => createSleepSession(payload);

    return (
        <div className="w-full max-w-6xl">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                {/* ------------------------------------------------------------------ */}
                {/* LEFT: BADGES                                                        */}
                {/* ------------------------------------------------------------------ */}
                <div className="min-w-0">
                    <HomeBadgesStrip />
                </div>

                {/* ------------------------------------------------------------------ */}
                {/* RIGHT: FORM (collapsible)                                           */}
                {/* ------------------------------------------------------------------ */}
                <div className="rounded-3xl bg-white/70 p-6 shadow-md backdrop-blur">
                    {/* Title above tabs */}
                    <h2 className="mb-4 text-xl font-semibold text-slate-800">
                        {tWorld("encodeSessionTitle")}
                    </h2>

                    {/* Tabs */}
                    <div className="flex items-center justify-between gap-2 rounded-2xl bg-white/80 p-2 shadow-sm">
                        {TABS.map((tab) => {
                            const isActive = tab.key === active;

                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => handleTabClick(tab.key)}
                                    aria-selected={isActive}
                                    className={[
                                        "flex flex-1 items-center justify-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium transition",
                                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2",
                                        isActive
                                            ? // actif => pastel + bord + ombre légère
                                            "bg-gradient-to-b from-white to-slate-50 border border-slate-200 shadow-sm text-slate-900"
                                            : "bg-transparent text-slate-700 hover:bg-slate-50",
                                    ].join(" ")}
                                >
                  <span className="relative h-7 w-7">
                    <Image
                        src={tab.iconSrc}
                        alt={tWorld(tab.labelKey)}
                        fill
                        className="object-contain"
                    />
                  </span>

                                    <span className="hidden sm:inline">{tWorld(tab.labelKey)}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Status */}
                    <div className="mt-3 min-h-[18px]">
                        {anyLoading && (
                            <div className="text-xs text-slate-600">
                                {tCommon?.("loading") ?? "Chargement…"}
                            </div>
                        )}
                        {!anyLoading && errorText && (
                            <div className="text-xs text-rose-700">{errorText}</div>
                        )}
                    </div>

                    {/* Collapsible form container */}
                    <div
                        className={[
                            "transition-all duration-500 overflow-hidden",
                            isOpen ? "max-h-[900px] opacity-100 mt-4" : "max-h-0 opacity-0 mt-0",
                        ].join(" ")}
                    >
                        <div>
                            {/* Optional domain title (only once a tab has been selected) */}
                            <div className="mb-2 text-sm font-semibold text-slate-800">
                                {activeTab ? tWorld(activeTab.labelKey) : null}
                            </div>

                            {/* Domain forms */}
                            {active === "sleep" && (
                                <SleepManualForm onCreateSessionAction={onCreateSleepSessionAction} />
                            )}

                            {active === "meditation" && (
                                <MeditationManualForm
                                    types={meditationTypes ?? []}
                                    onCreateSessionAction={onCreateMeditationSessionAction}
                                    defaultOpen
                                    compact
                                />
                            )}

                            {active === "exercise" && (
                                <ExerciceManualForm
                                    types={exerciceTypes ?? []}
                                    onCreateSessionAction={onCreateExerciceSessionAction}
                                    defaultOpen
                                    compact
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
