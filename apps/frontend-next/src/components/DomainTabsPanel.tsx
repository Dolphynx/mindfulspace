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

type DomainKey = "sleep" | "meditation" | "exercise";

type DomainTab = {
    key: DomainKey;
    labelKey: "sleepAlt" | "meditationAlt" | "exerciceAlt";
    iconSrc: string;
};

const TABS: DomainTab[] = [
    { key: "sleep", labelKey: "sleepAlt", iconSrc: "/images/icone_sleep.png" },
    { key: "meditation", labelKey: "meditationAlt", iconSrc: "/images/icone_meditation.png" },
    { key: "exercise", labelKey: "exerciceAlt", iconSrc: "/images/icone_exercise.png" },
];

/**
 * Panneau "Quick log" permettant d'encoder une session de bien-être (sommeil, méditation, exercice)
 * via un système d'onglets et des formulaires dédiés.
 *
 * @remarks
 * - Affiche une bande d'icônes (onglets) permettant de choisir le domaine.
 * - Sur desktop, le formulaire est affiché dans un panneau flottant sous la bande.
 * - Sur mobile, le panneau est intégré dans le flux et se déplie/replie.
 * - Agrège les états de chargement et d'erreur provenant des hooks de sessions.
 */
export default function DomainTabsPanel() {
    const tWorld = useTranslations("publicWorld");
    const tCommon = useTranslations("common");

    /**
     * Onglet actuellement sélectionné.
     *
     * @remarks
     * `null` signifie qu'aucun onglet n'a encore été choisi (affichage d'un titre générique).
     */
    const [active, setActive] = useState<DomainKey | null>(null);

    /**
     * État d'ouverture du panneau de saisie (desktop et mobile).
     *
     * @remarks
     * - Sur desktop, contrôle l'opacité et l'interactivité (via `pointer-events-none`).
     * - Sur mobile, contrôle l'animation de dépliage (via `max-height`/`opacity`).
     */
    const [isOpen, setIsOpen] = useState<boolean>(false);

    /**
     * Métadonnées de l'onglet actif (label et icône) dérivées de {@link TABS}.
     */
    const activeTab = useMemo(
        () => (active ? TABS.find((x) => x.key === active) : null),
        [active],
    );

    /**
     * Gestion des sessions de méditation.
     *
     * @remarks
     * - `types` correspond aux types de méditations disponibles.
     * - `createSession` déclenche la création d'une session via l'API.
     */
    const {
        types: meditationTypes,
        loading: meditationLoading,
        errorType: meditationErrorType,
        createSession: createMeditationSession,
    } = useMeditationSessions();

    /**
     * Gestion des sessions d'exercice.
     *
     * @remarks
     * - `types` correspond aux exercices disponibles.
     * - `createSession` déclenche la création d'une session via l'API.
     */
    const {
        types: exerciceTypes,
        loading: exerciceLoading,
        errorType: exerciceErrorType,
        createSession: createExerciceSession,
    } = useExerciceSessions();

    /**
     * Gestion des sessions de sommeil.
     *
     * @remarks
     * - `createSession` déclenche la création d'une session via l'API.
     */
    const {
        loading: sleepLoading,
        errorType: sleepErrorType,
        createSession: createSleepSession,
    } = useSleepSessions();

    /**
     * Indique si au moins un domaine est en cours de chargement.
     *
     * @remarks
     * Utilisé pour afficher un indicateur "Chargement…" dans l'entête du panneau.
     */
    const anyLoading = meditationLoading || exerciceLoading || sleepLoading;

    /**
     * Texte d'erreur générique si un des hooks remonte une erreur.
     *
     * @remarks
     * Le détail de l'erreur est volontairement masqué ici au profit d'un message utilisateur commun.
     */
    const errorText =
        meditationErrorType || exerciceErrorType || sleepErrorType
            ? tCommon?.("genericError") ?? "Une erreur est survenue."
            : null;

    /**
     * Gère le clic sur un onglet.
     *
     * @param next - Domaine sélectionné.
     *
     * @remarks
     * - Si l'utilisateur clique sur l'onglet déjà actif, on replie/déplie le panneau.
     * - Sinon, on change d'onglet et on ouvre le panneau.
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
     * Action de création d'une session de méditation.
     *
     * @param payload - Données nécessaires à la création.
     *
     * @remarks
     * Le payload est typé localement afin de garantir la compatibilité avec le hook.
     */
    const onCreateMeditationSessionAction = async (payload: {
        durationSeconds: number;
        moodAfter?: MoodValue;
        dateSession: string;
        meditationTypeId: string;
    }) => createMeditationSession(payload);

    /**
     * Action de création d'une session d'exercice.
     *
     * @param payload - Données nécessaires à la création.
     */
    const onCreateExerciceSessionAction = async (payload: {
        dateSession: string;
        quality?: MoodValue;
        exercices: { exerciceContentId: string; repetitionCount: number }[];
    }) => createExerciceSession(payload);

    /**
     * Action de création d'une session de sommeil.
     *
     * @param payload - Données nécessaires à la création.
     */
    const onCreateSleepSessionAction = async (payload: {
        hours: number;
        quality?: MoodValue;
        dateSession: string;
    }) => createSleepSession(payload);

    return (
        <div className="w-full lg:w-[380px]">
            {/* BADGES ultra-compacts en haut */}
            <div className="mb-3 flex justify-end">
                <HomeBadgesStrip compact />
            </div>

            {/* QUICK LOG (comme badges) + panneau */}
            <div className="relative flex justify-end">
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
                                    <Image
                                        src={tab.iconSrc}
                                        alt={tWorld(tab.labelKey)}
                                        fill
                                        className="object-contain"
                                    />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* DESKTOP: panneau sous la strip */}
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

                {/* MOBILE: panneau sous la strip (inchangé dans l’idée) */}
                <div className="lg:hidden mt-3 w-full rounded-3xl bg-white/75 shadow-md backdrop-blur p-5">
                    <div className="text-sm font-semibold text-slate-800">
                        {tWorld("encodeSessionTitle")}
                    </div>

                    <div className="mt-2 min-h-[18px] text-xs text-slate-500">
                        {anyLoading ? (tCommon?.("loading") ?? "Chargement…") : ""}
                        {!anyLoading && errorText ? <span className="text-rose-700">{errorText}</span> : null}
                    </div>

                    <div
                        className={[
                            "transition-all duration-500 overflow-hidden",
                            isOpen ? "max-h-[900px] opacity-100 mt-3" : "max-h-0 opacity-0 mt-0",
                        ].join(" ")}
                    >
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
    );
}
