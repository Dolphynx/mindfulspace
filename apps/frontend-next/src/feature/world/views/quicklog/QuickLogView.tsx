"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "@/i18n/TranslationContext";

import type { MoodValue } from "@/lib";
import type { Domain } from "../../hub/types";
import { useWorldHub } from "../../hub/WorldHubProvider";

import SleepManualForm from "@/components/sleep/SleepManualForm";
import MeditationManualForm from "@/components/meditation/MeditationManualForm";
import ExerciceManualForm from "@/components/exercise/ExerciceManualForm";

import { useMeditationSessions } from "@/hooks/useMeditationSessions";
import { useExerciceSessions } from "@/hooks/useExerciceSessions";
import { useSleepSessions } from "@/hooks/useSleepSessions";
import { QuickLogLauncher } from "../overview/QuickLogLauncher";
import { useBadgeToasts } from "@/components";

import { useOptionalWorldRefresh } from "@/feature/world/hooks/useOptionalWorldRefresh";

/**
 * @file QuickLogView.tsx
 * @description
 * Vue “Quick Log” du drawer SPA.
 *
 * Responsabilités :
 * - Réutiliser les formulaires existants (`*ManualForm`) sans dupliquer l’UI.
 * - Supporter un domaine pré-sélectionné via la stack du drawer (`quickLog.domain`).
 * - Centraliser le rafraîchissement World Hub après création d’une session
 *   (via `withRefresh` → `bumpRefreshKey` si le provider est présent).
 * - Déclencher un toast de badge (pattern “récompense”) puis naviguer vers l’overview.
 *
 * Contrainte Next.js (App Router) :
 * - Éviter de passer des callbacks en props à des Client Components importables côté serveur (TS71007).
 *
 * Stratégie :
 * - Le “domaine actif” est dérivé de `state.drawerStack` (source de vérité).
 * - Le composant {@link QuickLogLauncher} déclenche l’ouverture du Quick Log
 *   avec le domaine choisi (pas de callback `onChange`).
 *
 * @returns Vue Quick Log.
 */
export function QuickLogView() {
    const tWorld = useTranslations("publicWorld");
    const tCommon = useTranslations("common");

    const { state, openOverview } = useWorldHub();
    const { pushBadges } = useBadgeToasts();

    /**
     * Mécanisme de rafraîchissement facultatif du World Hub.
     *
     * `withRefresh` exécute une action asynchrone puis déclenche un refresh global
     * (si le provider est disponible via `useWorldHubOptional` en interne).
     */
    const { withRefresh } = useOptionalWorldRefresh();

    /**
     * Domaine actif dérivé de la pile de vues du drawer.
     *
     * Source de vérité :
     * - la vue courante est le sommet de `drawerStack`,
     * - si cette vue est `quickLog`, son champ `domain` pilote le formulaire affiché.
     *
     * Avantage :
     * - aucune gestion locale via `setActive` nécessaire,
     * - évite de passer des callbacks dans des props (TS71007).
     */
    const topView = state.drawerStack[state.drawerStack.length - 1];
    const active: Domain =
        topView?.type === "quickLog" ? (topView.domain ?? "sleep") : "sleep";

    /**
     * État toast local (non utilisé pour l’affichage de badge, conservé pour compatibilité).
     *
     * Remarque : l’affichage du toast de badge est géré par `useBadgeToasts`.
     */
    const [toast] = useState<string | null>(null);

    /**
     * Références de timers pour éviter les fuites lors du unmount.
     */
    const toastTimerRef = useRef<number | null>(null);
    const navTimerRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
            if (navTimerRef.current) window.clearTimeout(navTimerRef.current);
        };
    }, []);

    /**
     * Déclenche un “badge toast” de succès puis navigue vers l’overview après un délai.
     *
     * @returns void
     */
    const showSuccessAndGoOverview = () => {
        const earnedAt = new Date().toISOString();

        pushBadges([
            {
                id: `quicklog-saved-${earnedAt}`,
                slug: "quicklog-saved",
                earnedAt,
                iconKey: "success",
                titleKey: "badges.quickLogSaved.title",
                descriptionKey: "badges.quickLogSaved.description",
            },
        ]);

        window.setTimeout(() => {
            openOverview();
        }, 800);
    };

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
     * État dérivé : un des hooks est en cours de chargement.
     */
    const anyLoading = meditationLoading || exerciceLoading || sleepLoading;

    /**
     * Texte d’erreur générique si au moins un hook signale une erreur.
     */
    const errorText =
        meditationErrorType || exerciceErrorType || sleepErrorType
            ? tCommon("genericError")
            : null;

    /**
     * Libellé de domaine affiché dans le sous-titre.
     */
    const domainLabel = useMemo(() => {
        if (active === "sleep") return tWorld("sleepAlt");
        if (active === "meditation") return tWorld("meditationAlt");
        return tWorld("exerciceAlt");
    }, [active, tWorld]);

    /**
     * Handler de création de session sommeil adapté à la signature attendue par `SleepManualForm`.
     *
     * @param payload - Données de la session (sommeil).
     * @returns Promesse résolue lorsque l’action est terminée.
     */
    const onCreateSleepSessionAction = async (payload: {
        hours: number;
        quality?: MoodValue;
        dateSession: string;
    }): Promise<void> => {
        await withRefresh(() => createSleepSession(payload));
        showSuccessAndGoOverview();
    };

    /**
     * Handler de création de session méditation adapté à la signature attendue par `MeditationManualForm`.
     *
     * @param payload - Données de la session (méditation).
     * @returns Promesse résolue lorsque l’action est terminée.
     */
    const onCreateMeditationSessionAction = async (payload: {
        durationSeconds: number;
        moodAfter?: MoodValue;
        dateSession: string;
        meditationTypeId: string;
    }): Promise<void> => {
        await withRefresh(() => createMeditationSession(payload));
        showSuccessAndGoOverview();
    };

    /**
     * Handler de création de session exercice adapté à la signature attendue par `ExerciceManualForm`.
     *
     * @param payload - Données de la session (exercice).
     * @returns Promesse résolue lorsque l’action est terminée.
     */
    const onCreateExerciceSessionAction = async (payload: {
        dateSession: string;
        quality?: MoodValue;
        exercices: { exerciceContentId: string; repetitionCount: number }[];
    }): Promise<void> => {
        await withRefresh(() => createExerciceSession(payload));
        showSuccessAndGoOverview();
    };

    return (
        <div className="space-y-4">
            <div>
                <div className="text-sm font-semibold text-slate-800">
                    {tWorld("quickLogTitle")}
                </div>

                <div className="mt-1 text-xs text-slate-500">
                    {domainLabel}
                    {anyLoading ? ` · ${tCommon("loading")}` : errorText ? ` · ${errorText}` : ""}
                </div>
            </div>

            {/* Lanceur de sélection : déclenche une ré-ouverture du Quick Log sur le domaine choisi via le hub */}
            <QuickLogLauncher active={active} />

            <div className="rounded-3xl border border-white/40 bg-white/55 backdrop-blur p-4 shadow-md">
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

            {toast && (
                <div
                    role="status"
                    aria-live="polite"
                    className="fixed bottom-5 right-5 z-50 rounded-2xl border border-white/40 bg-white/80 backdrop-blur px-4 py-3 text-sm text-slate-800 shadow-lg"
                >
                    {toast}
                </div>
            )}
        </div>
    );
}
