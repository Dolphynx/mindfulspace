// src/app/error.tsx

"use client";

import { useEffect } from "react";
import Link from "next/link";
import PageHero from "@/components/PageHero";

type ErrorPageProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function GlobalErrorPage({ error, reset }: ErrorPageProps) {
    useEffect(() => {
        console.error("Global error capturée :", error);
    }, [error]);

    return (
        <div className="text-brandText flex flex-col">
            <PageHero
                title="Un imprévu est survenu"
                subtitle="Même les applications ont parfois besoin d'une pause."
            />

            <section className="mx-auto max-w-3xl w-full px-4 py-8 space-y-6">
                <article className="bg-white border border-brandBorder rounded-card shadow-card p-6">
                    <h2 className="text-xl font-semibold text-brandText mb-2">
                        Oups, quelque chose s&apos;est mal passé
                    </h2>

                    <p className="text-brandText-soft text-sm leading-relaxed">
                        Une erreur s&apos;est produite pendant le chargement de
                        cette page. Tu peux essayer de recharger l&apos;écran ou
                        revenir à l&apos;accueil de MindfulSpace.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={reset}
                            className="inline-flex items-center rounded-full border border-brandBorder bg-brandBg-soft px-4 py-2 text-sm font-medium text-brandText hover:bg-brandBg-strong transition-colors"
                        >
                            🔄 Réessayer
                        </button>

                        <Link
                            href="/"
                            className="inline-flex items-center rounded-full border border-brandBorder bg-white px-4 py-2 text-sm font-medium text-brandText hover:bg-brandBg-soft transition-colors"
                        >
                            ⬅ Retour à l&apos;accueil
                        </Link>
                    </div>
                </article>

                <article className="bg-white border border-brandBorder rounded-card shadow-card p-6">
                    <h3 className="text-lg font-semibold text-brandText mb-2">
                        Rappel important
                    </h3>
                    <p className="text-sm text-brandText-soft leading-relaxed">
                        MindfulSpace reste un projet académique fictif.
                        N&apos;utilise pas la plateforme pour des situations
                        d&apos;urgence ou des besoins médicaux.
                    </p>
                    <p className="text-xl mt-4" aria-hidden="true">
                        🧘‍♀️
                    </p>
                </article>
            </section>
        </div>
    );
}
