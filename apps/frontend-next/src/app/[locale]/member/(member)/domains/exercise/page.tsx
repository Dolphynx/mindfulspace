"use client";

import PageHero from "@/components/PageHero";
import { useTranslations } from "@/i18n/TranslationContext";
import { useWorkoutSessions } from "@/hooks/useWorkoutSessions";
import { WorkoutHistoryCard } from "@/components/exercise/WorkoutHistoryCard";
import ExerciseManualForm from "@/components/exercise/ExerciseManualForm";
import { SessionDashboardLayout } from "@/components/session/SessionDashboardLayout";
import { SessionCard } from "@/components/session/SessionCard";
import {WorkoutStartSessionCard} from "@/components/exercise/WorkoutStartSessionCard";
import {WorkoutStartSection} from "@/components/exercise/WorkoutStartSection";
import DomainSwitcher from "@/components/DomainSwitcher";

/**
 * Maps error types from the hook to translated messages.
 */
function getErrorMessage(
    t: ReturnType<typeof useTranslations>,
    errorType: "load" | "save" | "types" | null,
): string | null {
    if (errorType === "load") return t("errors_loadHistory");
    if (errorType === "save") return t("errors_saveSession");
    if (errorType === "types") return t("errors_loadTypes");
    return null;
}

export default function ExercicePage() {
    const t = useTranslations("domainExercice");

    const {
        sessions,
        types,
        loading,
        errorType,
        createSession,
    } = useWorkoutSessions();

    const globalErrorMessage = getErrorMessage(t, errorType);

    return (
        <main className="text-brandText flex flex-col">
            <SessionDashboardLayout
                hero={
                    <div className="flex flex-col items-center">
                        <PageHero
                            title={t("title")}
                            subtitle={t("subtitle")}
                        />
                        {/* Sélecteur des 3 domaines sous le hero */}
                        <DomainSwitcher current="exercise" />
                    </div>
                }
                globalErrorMessage={globalErrorMessage}
                leftTop={
                    <SessionCard>
                        <ExerciseManualForm
                            types={types}
                            onCreateSession={createSession}
                        />
                    </SessionCard>
                }

                leftBottom={
                    <SessionCard>
                        <WorkoutStartSection
                            types={types}
                            onCreateSession={createSession}
                        />
                    </SessionCard>
                }


                rightColumn={
                    <WorkoutHistoryCard
                        sessions={sessions}
                        loading={loading}
                        errorType={errorType}
                        types={types}
                    />
                }
            />
        </main>
    );
}
