"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import PageHero from "@/components/PageHero";
import { useTranslations } from "@/i18n/TranslationContext";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

type ErrorPageProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function GlobalErrorPage({ error, reset }: ErrorPageProps) {
    const pathname = usePathname();
    const raw = pathname.split("/")[1] || defaultLocale;
    const locale: Locale = isLocale(raw) ? raw : defaultLocale;

    const t = useTranslations("errorPage");

    useEffect(() => {
        console.error("Global error capturée :", error);
    }, [error]);

    return (
        <div className="text-brandText flex flex-col">
            <PageHero
                title={t("heroTitle")}
                subtitle={t("heroSubtitle")}
            />

            <section className="mx-auto max-w-3xl w-full px-4 py-8 space-y-6">
                <article className="bg-white border border-brandBorder rounded-card shadow-card p-6">
                    <h2 className="text-xl font-semibold text-brandText mb-2">
                        {t("heading")}
                    </h2>

                    <p className="text-brandText-soft text-sm leading-relaxed">
                        {t("body")}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={reset}
                            className="inline-flex items-center rounded-full border border-brandBorder bg-brandBg-soft px-4 py-2 text-sm font-medium text-brandText hover:bg-brandBg-strong transition-colors"
                        >
                            {t("retry")}
                        </button>

                        <Link
                            href={`/${locale}`}
                            className="inline-flex items-center rounded-full border border-brandBorder bg-white px-4 py-2 text-sm font-medium text-brandText hover:bg-brandBg-soft transition-colors"
                        >
                            {t("backHome")}
                        </Link>
                    </div>
                </article>

                <article className="bg-white border border-brandBorder rounded-card shadow-card p-6">
                    <h3 className="text-lg font-semibold text-brandText mb-2">
                        {t("secondTitle")}
                    </h3>
                    <p className="text-sm text-brandText-soft leading-relaxed">
                        {t("secondText")}
                    </p>
                    <p className="text-xl mt-4" aria-hidden="true">
                        🧘‍♀️
                    </p>
                </article>
            </section>
        </div>
    );
}
