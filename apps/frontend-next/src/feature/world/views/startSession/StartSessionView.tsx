"use client";

import { useMemo } from "react";
import { useTranslations } from "@/i18n/TranslationContext";
import type { Domain } from "../../hub/types";
import { useWorldHub } from "../../hub/WorldHubProvider";

import { StartSessionLauncher } from "../overview/StartSessionLauncher";

import StartMeditationWizard from "@/components/meditation/StartMeditationWizard";
import { ExerciseStartSection } from "@/components/exercise/ExerciseStartSection";

import { useExerciseSessions } from "@/hooks/useExerciseSessions";
import { useAuthRequired } from "@/hooks/useAuthRequired";

import { useOptionalWorldRefresh } from "@/feature/world/hooks/useOptionalWorldRefresh";

import { useNotifications } from "@/hooks/useNotifications";

/**
 * @file StartSessionView.tsx
 * @description
 * Vue “Démarrer une session” du drawer SPA.
 *
 * Responsabilités :
 * - Sélection du domaine (méditation / exercice) via {@link StartSessionLauncher}.
 * - Délégation au composant métier correspondant :
 *   - `StartMeditationWizard` pour la méditation,
 *   - `ExerciseStartSection` pour l’exercice.
 * - Centralisation du rafraîchissement World Hub (bumpRefreshKey) après enregistrement.
 * - Contrôle d’accès premium (même logique que la page “/domains/meditation”).
 *
 * Contrainte Next.js (App Router) :
 * - Éviter de passer des callbacks en props à des Client Components importables côté serveur (TS71007).
 *
 * Stratégie :
 * - Le “domaine actif” est dérivé de `state.drawerStack` (source de vérité).
 * - {@link StartSessionLauncher} déclenche `openStartSession(domain)` au clic (pas de `onChange`).
 *
 * @returns Vue “Start Session”.
 */

/**
 * Domaine autorisé pour la vue “Start Session”.
 *
 * Le domaine "sleep" est exclu : le démarrage concerne uniquement
 * la méditation et l’exercice.
 */
type StartDomain = Exclude<Domain, "sleep">;

export function StartSessionView() {
    const tWorld = useTranslations("world");
    const tCommon = useTranslations("common");

    const { state, openOverview } = useWorldHub();

    const { notifySessionSaved } = useNotifications();

    /**
     * Mécanismes de rafraîchissement World Hub :
     * - `refresh` : déclenche un bump direct.
     * - `withRefresh` : exécute une promesse puis déclenche un bump.
     */
    const { refresh, withRefresh } = useOptionalWorldRefresh();

    /**
     * Domaine actif dérivé de la pile de vues du drawer.
     *
     * Source de vérité :
     * - la vue courante est le sommet de `drawerStack`,
     * - si cette vue est `startSession`, son champ `domain` pilote l’écran affiché.
     */
    const topView = state.drawerStack[state.drawerStack.length - 1];
    const active: StartDomain =
        topView?.type === "startSession" ? (topView.domain ?? "meditation") : "meditation";

    const {
        types: exerciceTypes,
        loading: exLoading,
        errorType: exErrorType,
        createSession: createExerciceSession,
    } = useExerciseSessions();

    /**
     * Contrôle d’accès premium pour la méditation.
     */
    const { user } = useAuthRequired();
    const canAccessPremium =
        !!user &&
        user.roles.map((r) => r.toLowerCase()).some((role) => ["premium", "admin"].includes(role));

    /**
     * Sous-titre affiché sous le titre principal (domaine actif).
     */
    const subtitle = useMemo(() => {
        return active === "meditation"
            ? tWorld("domains.meditation")
            : tWorld("domains.exercise");
    }, [active, tWorld]);

    /**
     * Texte d’erreur générique si la partie “exercice” signale une erreur.
     */
    const errorText = exErrorType ? tCommon("genericError") ?? "Une erreur est survenue." : null;

    return (
        <div className="space-y-4">
            <div>
                <div className="text-sm font-semibold text-slate-800">
                    {tWorld("startSession.title")}
                </div>

                <div className="mt-1 text-xs text-slate-500">
                    {subtitle}
                    {exLoading ? ` · ${tCommon("loading")}` : errorText ? ` · ${errorText}` : ""}
                </div>
            </div>

            {/* Lanceur de sélection : déclenche une ré-ouverture de “start session” sur le domaine choisi via le hub */}
            <StartSessionLauncher active={active} />

            <div className="rounded-3xl border border-white/40 bg-white/55 backdrop-blur p-4 shadow-md">
                {active === "meditation" ? (
                    <StartMeditationWizard
                        canAccessPremium={canAccessPremium}
                        onCloseAction={() => openOverview()}
                        onSessionSavedAction={() => {
                            refresh();
                            notifySessionSaved({ celebrate: true });
                        }}
                    />
                ) : (
                    <ExerciseStartSection
                        types={exerciceTypes ?? []}
                        onCreateSession={(payload) =>
                            withRefresh(async () => {
                                await createExerciceSession(payload);
                                notifySessionSaved({ celebrate: true });
                            })
                        }
                    />
                )}
            </div>

            <div className="text-xs text-slate-500">{tWorld("startSession.hint")}</div>
        </div>
    );
}
