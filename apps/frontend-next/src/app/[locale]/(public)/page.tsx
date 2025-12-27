import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/layout/PageHero";
import PublicHomeCTA from "@/components/public/PublicHomeCTA";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

/**
 * PublicHome Page
 * ----------------
 * Public landing page of the application.
 *
 * Responsibilities:
 * - Resolve and validate the active locale from route parameters.
 * - Load translations for the public home namespace.
 * - Render introductory and feature-oriented content.
 * - Delegate authentication-dependent call-to-action rendering.
 *
 * This page is implemented as a Server Component.
 */
export default async function PublicHome({
                                             params,
                                         }: {
    /**
     * Route parameters provided by Next.js App Router.
     */
    params: Promise<{ locale: string }>;
}) {
    const { locale: rawLocale } = await params;

    /**
     * Validated locale used throughout the page.
     */
    const locale: Locale = isLocale(rawLocale)
        ? rawLocale
        : defaultLocale;

    /**
     * Translation dictionary scoped to the public home page.
     */
    const t = (await getDictionary(locale)).publicHome;

    return (
        <div className="text-brandText flex flex-col">
            <PageHero title={t.heroTitle} subtitle={t.heroSubtitle} />

            <section className="mx-auto w-full max-w-5xl px-4 py-10">
                <div className="grid gap-6 md:grid-cols-2">
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
                                    <Link href={`/${locale}/resources`}>
                                        {t.discoverResources}
                                    </Link>
                                </li>
                                <li>
                                    <Link href={`/${locale}/coach`}>
                                        {t.discoverCoachs}
                                    </Link>
                                </li>
                                <li>
                                    <Link href={`/${locale}/contact`}>
                                        {t.discoverContact}
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </article>

                    <aside className="flex flex-col justify-between rounded-2xl border border-brandBorder bg-white/80 p-6 shadow-sm">
                        <div className="space-y-3">
                            <h2 className="text-xl font-semibold">
                                {t.ctaTitle}
                            </h2>

                            <p className="text-sm leading-relaxed">
                                {t.ctaDescription}
                            </p>
                        </div>

                        <div className="mt-6 space-y-6">
                            <PublicHomeCTA
                                locale={locale}
                                t={{
                                    registerButton: t.registerButton,
                                    loginButton: t.loginButton,
                                    accessWorldButton: t.accessWorldButton,
                                    disclaimer: t.disclaimer,
                                }}
                            />

                            <div className="rounded-xl bg-brandSurface/60 p-4 text-sm leading-relaxed">
                                <p className="font-medium mb-2">
                                    {t.mindfulTitle}
                                </p>

                                <ul className="list-disc pl-5 space-y-1">
                                    <li>{t.mindfulPoint1}</li>
                                    <li>{t.mindfulPoint2}</li>
                                    <li>{t.mindfulPoint3}</li>
                                </ul>
                            </div>
                        </div>
                    </aside>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-3">
                    <article className="flex flex-col rounded-2xl border border-brandBorder bg-white/80 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold">
                            {t.featureMeditationTitle}
                        </h3>

                        <p className="mt-2 text-sm leading-relaxed text-brandText/80">
                            {t.featureMeditationText}
                        </p>

                        <div className="mt-4 text-sm">
                            <Link
                                href={`/${locale}/resources`}
                                className="font-semibold text-brandGreen underline-offset-2 hover:underline"
                            >
                                {t.featureMeditationLink}
                            </Link>
                        </div>

                        <div className="mt-6 flex justify-center">
                            <Image
                                src="/images/home-feature-1.png"
                                alt=""
                                width={140}
                                height={140}
                                className="opacity-90"
                            />
                        </div>
                    </article>

                    <article className="flex flex-col rounded-2xl border border-brandBorder bg-white/80 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold">
                            {t.featureTrackingTitle}
                        </h3>

                        <p className="mt-2 text-sm leading-relaxed text-brandText/80">
                            {t.featureTrackingText}
                        </p>

                        <p className="mt-4 text-xs text-brandText/70">
                            {t.featureTrackingNote}
                        </p>

                        <div className="mt-6 flex justify-center">
                            <Image
                                src="/images/home-feature-2.png"
                                alt=""
                                width={140}
                                height={140}
                                className="opacity-90"
                            />
                        </div>
                    </article>

                    <article className="flex flex-col rounded-2xl border border-brandBorder bg-white/80 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold">
                            {t.featureResourcesTitle}
                        </h3>

                        <p className="mt-2 text-sm leading-relaxed text-brandText/80">
                            {t.featureResourcesText}
                        </p>

                        <div className="mt-4 text-sm">
                            <Link
                                href={`/${locale}/contact`}
                                className="font-semibold text-brandGreen underline-offset-2 hover:underline"
                            >
                                {t.featureResourcesLink}
                            </Link>
                        </div>

                        <div className="mt-6 flex justify-center">
                            <Image
                                src="/images/home-feature-3.png"
                                alt=""
                                width={140}
                                height={140}
                                className="opacity-90"
                            />
                        </div>
                    </article>
                </div>
            </section>
        </div>
    );
}
