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

type StartDomain = Exclude<Domain, "sleep">;

export function StartSessionView() {
    const tWorld = useTranslations("world");
    const tCommon = useTranslations("common");
    const { state, openOverview } = useWorldHub();

    const { refresh, withRefresh } = useOptionalWorldRefresh();

    const topView = state.drawerStack[state.drawerStack.length - 1];
    const initialDomain: StartDomain =
        topView?.type === "startSession"
            ? topView.domain ?? "meditation"
            : "meditation";

    const [active, setActive] = useState<StartDomain>(initialDomain);

    const {
        types: exerciceTypes,
        loading: exLoading,
        errorType: exErrorType,
        createSession: createExerciceSession,
    } = useExerciceSessions();

    // ✅ Même logique premium que la page /domains/meditation
    const { user } = useAuthRequired();
    const canAccessPremium =
        !!user &&
        user.roles
            .map((r) => r.toLowerCase())
            .some((role) => ["premium", "admin"].includes(role));

    const subtitle = useMemo(() => {
        return active === "meditation"
            ? tWorld("domains.meditation")
            : tWorld("domains.exercise");
    }, [active, tWorld]);

    const errorText = exErrorType
        ? tCommon("genericError") ?? "Une erreur est survenue."
        : null;

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

            {/* ✅ même rendu que QuickLog : icônes carrées à gauche */}
            <StartSessionLauncher active={active} onChange={setActive} />

            <div className="rounded-3xl border border-white/40 bg-white/55 backdrop-blur p-4 shadow-md">
                {active === "meditation" ? (
                    <StartMeditationWizard
                        canAccessPremium={canAccessPremium}
                        onCloseAction={() => openOverview()}
                        // refresh centralisé ici (pas dans le wizard)
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
