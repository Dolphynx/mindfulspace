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

import { useOptionalWorldRefresh } from "@/feature/world/hooks/useOptionalWorldRefresh";
import { useNotifications } from "@/hooks/useNotifications";

/**
 * Vue “Quick Log” du drawer SPA.
 *
 * @remarks
 * Cette vue réutilise les formulaires existants (`*ManualForm`) afin d’éviter
 * toute duplication d’UI, tout en appliquant le flux SPA (drawer) :
 * - sélection d’un domaine,
 * - création de session,
 * - rafraîchissement du World Hub,
 * - feedback utilisateur (toast + confettis),
 * - retour contrôlé à l’overview.
 *
 * Le domaine actif est dérivé de `state.drawerStack` (source de vérité),
 * ce qui évite d’introduire une gestion locale du domaine et limite les props
 * de callbacks vers des composants potentiellement importés côté serveur.
 *
 * @returns La vue Quick Log.
 */
export function QuickLogView() {
    const tWorld = useTranslations("publicWorld");
    const tCommon = useTranslations("common");

    const { state, openOverview } = useWorldHub();
    const { notifySessionSaved } = useNotifications();

    /**
     * Mécanisme de rafraîchissement facultatif du World Hub.
     *
     * @remarks
     * `withRefresh` exécute une action asynchrone puis déclenche un refresh global
     * si le provider du World Hub supporte ce mécanisme (implémentation optionnelle).
     */
    const { withRefresh } = useOptionalWorldRefresh();

    /**
     * Domaine actif dérivé de la pile de vues du drawer.
     *
     * @remarks
     * La vue courante correspond au sommet de `drawerStack`.
     * Si cette vue est `quickLog`, son champ `domain` pilote le formulaire affiché.
     * Un fallback est appliqué pour garantir un domaine valide.
     */
    const topView = state.drawerStack[state.drawerStack.length - 1];
    const active: Domain =
        topView?.type === "quickLog" ? (topView.domain ?? "sleep") : "sleep";

    /**
     * État toast local (conservé tel quel).
     *
     * @remarks
     * L’affichage principal des confirmations est géré par `AppToastProvider`.
     * Cet état est laissé en place afin d’éviter un changement de comportement
     * inattendu si une logique externe s’y réfère.
     */
    const [toast] = useState<string | null>(null);

    /**
     * Référence de timer de navigation.
     *
     * @remarks
     * Utilisée pour annuler la navigation différée en cas de démontage du composant.
     */
    const navTimerRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (navTimerRef.current) window.clearTimeout(navTimerRef.current);
        };
    }, []);

    /**
     * Affiche la confirmation “session enregistrée” puis navigue vers l’overview.
     *
     * @remarks
     * La confirmation est centralisée via {@link useNotifications} :
     * - toast applicatif de succès,
     * - confettis optionnels.
     * La navigation est différée pour laisser le temps à l’utilisateur de percevoir le feedback.
     */
    const showSuccessAndGoOverview = () => {
        notifySessionSaved({ celebrate: true });

        navTimerRef.current = window.setTimeout(() => {
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
     * Indique si au moins un hook est en cours de chargement.
     */
    const anyLoading = meditationLoading || exerciceLoading || sleepLoading;

    /**
     * Message d’erreur générique si au moins un hook signale une erreur.
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
     * Handler de création de session sommeil, adapté à la signature attendue par `SleepManualForm`.
     *
     * @param payload Données de session sommeil.
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
     * Handler de création de session méditation, adapté à la signature attendue par `MeditationManualForm`.
     *
     * @param payload Données de session méditation.
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
     * Handler de création de session exercice, adapté à la signature attendue par `ExerciceManualForm`.
     *
     * @param payload Données de session exercice.
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
