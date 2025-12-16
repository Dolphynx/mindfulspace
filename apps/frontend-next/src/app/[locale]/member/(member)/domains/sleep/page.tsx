"use client";

import PageHero from "@/components/PageHero";
import { SessionDashboardLayout } from "@/components/session/SessionDashboardLayout";
import { SessionCard } from "@/components/session/SessionCard";
import SleepManualForm from "@/components/sleep/SleepManualForm";
import {useSleepSessions} from "@/hooks/useSleepSessions";
import {useTranslations} from "@/i18n/TranslationContext";
import {SleepHistoryCard} from "@/components/sleep/SleepHistoryCard";
import DomainSwitcher from "@/components/DomainSwitcher";
import OceanWavesBackground from "@/components/layout/OceanWavesBackground";

export default function SleepPage() {
    const t = useTranslations("domainSleep");

    const {
        sessions,
        loading,
        errorType,
        createSession,
    } = useSleepSessions();

    return (
        <OceanWavesBackground headerOffsetPx={80} wavesHeight="70vh">
            <div className="mx-auto max-w-5xl pt-6 pb-24">
                <main className="text-brandText flex flex-col">
                    <SessionDashboardLayout
            hero={
                <div className="flex flex-col items-center">
                    {/* Sélecteur des 3 domaines sous le hero */}
                    <DomainSwitcher current="sleep" />
                </div>
            }
            leftTop={
                <SessionCard>
                    <div className="flex flex-col gap-4">
                        <h2 className="text-lg font-semibold text-slate-800">
                            {t("manualForm_title")}
                        </h2>
                        <p className="text-sm text-slate-700">
                            {t("manualForm_description")}
                        </p>

                        <SleepManualForm
                        onCreateSessionAction={createSession}/>
                    </div>
                </SessionCard>
            }
            rightColumn={
                <SleepHistoryCard
                    sessions={sessions}
                    loading={loading}
                    errorType={errorType}
                />
            }
                    />
                </main>
            </div>
        </OceanWavesBackground>
    );
}
