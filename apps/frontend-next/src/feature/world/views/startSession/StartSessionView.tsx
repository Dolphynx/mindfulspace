"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "@/i18n/TranslationContext";
import type { Domain } from "../../hub/types";
import { useWorldHub } from "../../hub/WorldHubProvider";

import { StartSessionLauncher } from "../overview/StartSessionLauncher";

import StartMeditationWizard from "@/components/meditation/StartMeditationWizard";
import { ExerciceStartSection } from "@/components/exercise/ExerciceStartSection";

import { useExerciceSessions } from "@/hooks/useExerciceSessions";
import { useAuthRequired } from "@/hooks/useAuthRequired";

import { useOptionalWorldRefresh } from "@/feature/world/hooks/useOptionalWorldRefresh";

/**
 * Domaine autorisé pour la vue “Start Session”.
 *
 * Le domaine "sleep" est exclu : le démarrage concerne uniquement
 * la méditation et l’exercice.
 */
type StartDomain = Exclude<Domain, "sleep">;

/**
 * Vue “Démarrer une session” du drawer SPA.
 *
 * Responsabilités :
 * - Sélection du domaine (méditation / exercice) via `StartSessionLauncher`.
 * - Délégation au composant métier correspondant :
 *   - `StartMeditationWizard` pour la méditation,
 *   - `ExerciceStartSection` pour l’exercice.
 * - Centralisation du rafraîchissement World Hub (bumpRefreshKey) après enregistrement.
 * - Contrôle d’accès premium (même logique que la page “/domains/meditation”).
 *
 * Modèle de navigation interne :
 * - La sortie du flux méditation utilise `openOverview()` (navigation via hub, pas via Next router).
 *
 * @returns Vue “Start Session”.
 */
export function StartSessionView() {
    const tWorld = useTranslations("world");
    const tCommon = useTranslations("common");

    const { state, openOverview } = useWorldHub();

    /**
     * Mécanismes de rafraîchissement World Hub :
     * - `refresh` : déclenche un bump direct.
     * - `withRefresh` : exécute une promesse puis déclenche un bump.
     */
    const { refresh, withRefresh } = useOptionalWorldRefresh();

    /**
     * Domaine initial depuis la stack du drawer.
     *
     * Si la vue a été ouverte via une action contextualisée, `startSession.domain`
     * peut pré-sélectionner le domaine.
     */
    const topView = state.drawerStack[state.drawerStack.length - 1];
    const initialDomain: StartDomain =
        topView?.type === "startSession" ? topView.domain ?? "meditation" : "meditation";

    const [active, setActive] = useState<StartDomain>(initialDomain);

    const {
        types: exerciceTypes,
        loading: exLoading,
        errorType: exErrorType,
        createSession: createExerciceSession,
    } = useExerciceSessions();

    /**
     * Contrôle d’accès premium pour la méditation.
     *
     * Un utilisateur est considéré comme premium s’il possède un rôle
     * "premium" ou "admin" (comparaison insensible à la casse).
     */
    const { user } = useAuthRequired();
    const canAccessPremium =
        !!user &&
        user.roles
            .map((r) => r.toLowerCase())
            .some((role) => ["premium", "admin"].includes(role));

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
     *
     * Remarque :
     * - Les erreurs du flux méditation sont supposées gérées par `StartMeditationWizard`.
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
                    {exLoading
                        ? ` · ${tCommon("loading")}`
                        : errorText
                            ? ` · ${errorText}`
                            : ""}
                </div>
            </div>

            <StartSessionLauncher active={active} onChange={setActive} />

            <div className="rounded-3xl border border-white/40 bg-white/55 backdrop-blur p-4 shadow-md">
                {active === "meditation" ? (
                    <StartMeditationWizard
                        canAccessPremium={canAccessPremium}
                        onCloseAction={() => openOverview()}
                        onSessionSavedAction={refresh}
                    />
                ) : (
                    <ExerciceStartSection
                        types={exerciceTypes ?? []}
                        onCreateSession={(payload) =>
                            withRefresh(() => createExerciceSession(payload))
                        }
                    />
                )}
            </div>

            <div className="text-xs text-slate-500">
                {tWorld("startSession.hint")}
            </div>
        </div>
    );
}
