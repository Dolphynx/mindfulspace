"use client";

import { useTranslations } from "@/i18n/TranslationContext";
import type { ProgramItem } from "@/lib/api/program";
import { usePrograms } from "@/hooks/usePrograms";
import { useEffect, useState } from "react";

export function ProgramDetails({
                                   program,
                                   onBack,
                               }: {
    program: ProgramItem;
    onBack: () => void;
}) {
    const t = useTranslations("domainExercice");

    const {
        subscribeToProgram,
        unsubscribeFromProgram,
        getSubscriptionStatus,
    } = usePrograms();

    const [message, setMessage] = useState<string | null>(null);
    const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

    const uniqueWeekdays = new Set(program.days.map((d) => d.weekday)).size;

    //
    // Check subscription status on mount
    //
    useEffect(() => {
        (async () => {
            const res = await getSubscriptionStatus(program.id);
            setSubscriptionId(res.userProgramId);
        })();
    }, [program.id, getSubscriptionStatus]);

    //
    // Toggle Subscribe / Unsubscribe
    //
    async function handleToggle() {
        try {
            if (subscriptionId) {
                await unsubscribeFromProgram(subscriptionId);
                setSubscriptionId(null);
                setMessage("Successfully unsubscribed!");
            } else {
                await subscribeToProgram(program.id);
                const res = await getSubscriptionStatus(program.id);
                setSubscriptionId(res.userProgramId);
                setMessage("Successfully subscribed!");
            }
        } catch {
            setMessage("Something went wrong 😕");
        }
    }

    return (
        <div className="space-y-4">
            <button
                onClick={onBack}
                className="text-sm text-slate-600 underline hover:text-slate-800"
            >
                ← {t("program_details_back")}
            </button>

            <h2 className="text-2xl font-semibold text-slate-800">
                {program.title}
            </h2>

            {program.description && (
                <p className="text-slate-600">{program.description}</p>
            )}

            <p className="text-sm text-slate-500">
                {uniqueWeekdays} {t("program_list_daysPerWeek")}
            </p>

            {/* Days */}
            <div className="space-y-3">
                {program.days.map((day) => (
                    <div
                        key={day.id}
                        className="p-3 rounded-lg bg-white shadow-sm border"
                    >
                        <p className="font-medium">
                            {t("weekday_" + day.weekday?.toString())}
                        </p>

                        <ul className="pl-4 list-disc">
                            {day.exerciceItems.map((ex, idx) => (
                                <li key={idx}>
                                    {ex.exerciceContent?.name} — {ex.defaultRepetitionCount} reps
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="space-y-3">
                <button
                    onClick={handleToggle}
                    className="rounded-full bg-emerald-500 px-5 py-2 text-white font-medium shadow hover:bg-emerald-600 transition"
                >
                    {subscriptionId
                        ? t("program_details_unsubscribe")
                        : t("program_details_subscribe")}
                </button>

                {/* feedback message */}
                {message && (
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-emerald-700 text-sm">
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}
