import { getDictionary } from "@/i18n/get-dictionary";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import PageHero from "@/components/PageHero";
import { SessionDashboardLayout } from "@/components/session/SessionDashboardLayout";
import { SessionCard } from "@/components/session/SessionCard";
import SleepManualForm from "@/components/sleep/SleepManualForm";

export default async function SleepPage({
                                            params,
                                        }: {
    params: Promise<{ locale: string }>;
}) {
    const { locale: rawLocale } = await params;
    const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

    const dict = await getDictionary(locale);
    const t = dict.domainSleep;

    return (
        <SessionDashboardLayout
            hero={
                <PageHero
                    title={t.title}
                    subtitle={t.subtitle}
                />
            }
            leftTop={
                <SessionCard>
                    <div className="flex flex-col gap-4">
                        <h2 className="text-lg font-semibold text-slate-800">
                            {t.manualForm_title}
                        </h2>
                        <p className="text-sm text-slate-700">
                            {t.manualForm_description}
                        </p>

                        <SleepManualForm />
                    </div>
                </SessionCard>
            }
            rightColumn={
                <SessionCard>
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
