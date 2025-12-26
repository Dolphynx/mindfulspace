// src/app/[locale]/(public)/page.tsx

import Link from "next/link";
import PageHero from "@/components/layout/PageHero";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

export default async function PublicHome({
                                             params,
                                         }: {
    params: Promise<{ locale: string }>;
}) {
    // "await" params avant d'utiliser locale (new in Next)
    const { locale: rawLocale } = await params;

    const locale: Locale = isLocale(rawLocale)
        ? rawLocale
        : defaultLocale;

    const t = (await getDictionary(locale)).publicHome;

    return (
        <div className="text-brandText flex flex-col">

            {/* HERO */}
            <PageHero title={t.heroTitle} subtitle={t.heroSubtitle} />

            <section className="mx-auto w-full max-w-5xl px-4 py-10">
                <div className="grid gap-6 md:grid-cols-2">

                    {/* Bloc de bienvenue */}
                    <article className="space-y-4 rounded-2xl border border-brandBorder bg-white/80 p-6 shadow-sm">
                        <h2 className="text-xl font-semibold">
                            {t.welcomeTitle}
                        </h2>
                        <p className="text-sm leading-relaxed">
                            {t.welcomeParagraph1}
                        </p>
                        <p className="text-sm leading-relaxed">
                            {t.welcomeParagraph2}
                        </p>

                        <div className="mt-4 space-y-2 text-sm">
                            <p className="font-medium text-brandText/80">
                                {t.discoverTitle}
                            </p>

                            <ul className="list-disc space-y-1 pl-5">
                                <li>
                                    <Link
                                        href={`/${locale}/resources`}
                                        className="underline-offset-2 hover:underline"
                                    >
                                        {t.discoverResources}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={`/${locale}/coach`}
                                        className="underline-offset-2 hover:underline"
                                    >
                                        {t.discoverCoachs}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={`/${locale}/contact`}
                                        className="underline-offset-2 hover:underline"
                                    >
                                        {t.discoverContact}
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </article>

                    {/* Bloc CTA */}
                    <aside className="flex flex-col justify-between rounded-2xl border border-brandBorder bg-white/80 p-6 shadow-sm">
                        <div className="space-y-3">
                            <h2 className="text-xl font-semibold">
                                {t.ctaTitle}
                            </h2>
                            <p className="text-sm leading-relaxed">
                                {t.ctaDescription}
                            </p>
                        </div>

                        <div className="mt-6 space-y-12">
                            <Link
                                href={`/${locale}/auth/login`}
                                className="inline-flex w-full items-center justify-center rounded-xl border border-brandGreen bg-brandGreen px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brandGreen/90"
                            >
                                {t.loginButton}
                            </Link>

                            {/* Seance de respiration
                               Todo: publique ?? -> non, si on enregistre à la fin !
                            <Link
                                href={`/${locale}/member/seance/respiration`}
                                className="inline-flex w-full items-center justify-center rounded-xl border border-brandBorder bg-white px-4 py-2.5 text-sm font-semibold text-brandText transition hover:bg-white/80"
                            >
                                {t.startBreathing}
                            </Link>
                            */}

                            <p className="pt-1 text-xs text-brandText/70">
                                {t.disclaimer}
                            </p>
                        </div>
                    </aside>

                </div>
            </section>
        </div>
    );
}
