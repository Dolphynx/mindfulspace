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
 * Vue "Quick log" dans le drawer SPA.
 *
 * @remarks
 * - Réutilise les `*ManualForm` existants (pas de duplication).
 * - Adapte les handlers async pour respecter `Promise<void>` côté forms.
 * - Supporte un domaine pré-sélectionné via le state (optionnel).
 * - ✅ Centralise le refresh (bumpRefreshKey) ici plutôt que dans les forms.
 */
export function QuickLogView() {
    const tWorld = useTranslations("publicWorld");
    const tCommon = useTranslations("common");

    const { state, openOverview } = useWorldHub();
    const { pushBadges } = useBadgeToasts();

    // ✅ refresh centralisé ici
    const { withRefresh } = useOptionalWorldRefresh();

    /**
     * Domaine pré-sélectionné (optionnel) en provenance de la stack du drawer.
     */
    const topView = state.drawerStack[state.drawerStack.length - 1];

    const initialDomain: Domain | null =
        topView?.type === "quickLog" ? topView.domain ?? null : null;

    const [active, setActive] = useState<Domain>(initialDomain ?? "sleep");

    // --- toast (simple, sans lib) ---
    const [toast, setToast] = useState<string | null>(null);
    const toastTimerRef = useRef<number | null>(null);
    const navTimerRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
            if (navTimerRef.current) window.clearTimeout(navTimerRef.current);
        };
    }, []);

    const showSuccessAndGoOverview = () => {
        const earnedAt = new Date().toISOString();

        // La on pousse un fake badge...
        // Il faudrait créer un type spécifique, genre ToastItem pour être propre
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

    const anyLoading = meditationLoading || exerciceLoading || sleepLoading;

    const errorText =
        meditationErrorType || exerciceErrorType || sleepErrorType
            ? tCommon("genericError")
            : null;

    const domainLabel = useMemo(() => {
        if (active === "sleep") return tWorld("sleepAlt");
        if (active === "meditation") return tWorld("meditationAlt");
        return tWorld("exerciceAlt");
    }, [active, tWorld]);

    /**
     * Wrap pour respecter la signature attendue par les `ManualForm` :
     * `Promise<void>`.
     *
     * ✅ Ici on centralise le refresh : 1 POST puis bumpRefreshKey() (si WorldHubProvider présent).
     */
    const onCreateSleepSessionAction = async (payload: {
        hours: number;
        quality?: MoodValue;
        dateSession: string;
    }): Promise<void> => {
        await withRefresh(() => createSleepSession(payload));
        showSuccessAndGoOverview();
    };

    const onCreateMeditationSessionAction = async (payload: {
        durationSeconds: number;
        moodAfter?: MoodValue;
        dateSession: string;
        meditationTypeId: string;
    }): Promise<void> => {
        await withRefresh(() => createMeditationSession(payload));
        showSuccessAndGoOverview();
    };

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
            {/* Header interne de la vue */}
            <div>
                <div className="text-sm font-semibold text-slate-800">
                    {tWorld("quickLogTitle")}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                    {domainLabel}
                    {anyLoading
                        ? ` · ${tCommon("loading")}`
                        : errorText
                            ? ` · ${errorText}`
                            : ""}
                </div>
            </div>

            {/* Switch domaine (icônes) */}
            <QuickLogLauncher active={active} onChange={setActive} />

            {/* Formulaires réutilisés */}
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

            {/* Toast */}
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
