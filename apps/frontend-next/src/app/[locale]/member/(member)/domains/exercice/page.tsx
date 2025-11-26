import { getDictionary } from "@/i18n/get-dictionary";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import PageHero from "@/components/PageHero";
import { SessionDashboardLayout } from "@/components/session/SessionDashboardLayout";
import { SessionCard } from "@/components/session/SessionCard";
import ExerciseManualForm from "@/components/exercice/ExerciseManualForm";

export default async function ExercicePage({
                                               params,
                                           }: {
    params: Promise<{ locale: string }>;
}) {
    const { locale: rawLocale } = await params;
    const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

    const dict = await getDictionary(locale);
    const t = dict.domainExercice;

    return (
        <SessionDashboardLayout
            hero={
                <PageHero
                    title={t.title}
                    subtitle={t.subtitle}
                />
            }
            leftTop={
                <SessionCard variant="green">
                    <div className="flex flex-col gap-4">
                        <h2 className="text-lg font-semibold text-slate-800">
                            {t.manualForm_title}
                        </h2>
                        <p className="text-sm text-slate-700">
                            {t.manualForm_description}
                        </p>

                        <ExerciseManualForm />
                    </div>
                </SessionCard>
            }
            leftBottom={
                <SessionCard variant="green">
                    <div className="flex flex-col gap-4">
                        <h2 className="text-lg font-semibold text-slate-800">
                            {t.start_title}
                        </h2>
                        <p className="text-sm text-slate-700">
                            {t.start_description}
                        </p>

                        <div className="rounded-xl bg-white/80 p-4 shadow-sm border border-dashed text-brandText-soft text-center">
                            {t.start_placeholder}
                        </div>
                    </div>
                </SessionCard>
            }
            rightColumn={
                <SessionCard variant="green">
                    <h2 className="text-lg font-semibold text-slate-800 mb-3">
                        {t.history_title}
                    </h2>
                    <div className="rounded-xl bg-white/80 p-4 shadow-sm border border-dashed text-brandText-soft text-center">
                        {t.history_placeholder}
                    </div>
                </SessionCard>
            }
        />
    );
}
