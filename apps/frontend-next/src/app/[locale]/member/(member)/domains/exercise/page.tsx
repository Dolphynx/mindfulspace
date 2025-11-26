"use client";

import PageHero from "@/components/PageHero";
import { useTranslations } from "@/i18n/TranslationContext";
import { useWorkoutSessions } from "@/hooks/useWorkoutSessions";
import { WorkoutHistoryCard } from "@/components/exercise/WorkoutHistoryCard";
import ExerciseManualForm from "@/components/exercise/ExerciseManualForm";
import { SessionDashboardLayout } from "@/components/session/SessionDashboardLayout";
import { SessionCard } from "@/components/session/SessionCard";

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
                    <PageHero
                        title={t("title")}
                        subtitle={t("subtitle")}
                    />
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
                        <div className="flex flex-col gap-4">
                            <h2 className="text-lg font-semibold text-slate-800">
                                {t("start_title")}
                            </h2>
                            <p className="text-sm text-slate-700">
                                {t("start_description")}
                            </p>
                            <div className="rounded-xl bg-white/80 p-4 shadow-sm border border-dashed text-brandText-soft text-center">
                                {t("start_placeholder")}
                            </div>
                        </div>
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
