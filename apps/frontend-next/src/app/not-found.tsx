// src/app/not-found.tsx

import Link from "next/link";
import PageHero from "@/components/PageHero";

export default function NotFoundPage() {
    return (
        <div className="text-brandText flex flex-col">
            <PageHero
                title="Page introuvable"
                subtitle="On dirait que cette page a décidé de méditer ailleurs."
            />

            <section className="mx-auto max-w-3xl w-full px-4 py-8 space-y-6">
                <article className="bg-white border border-brandBorder rounded-card shadow-card p-6">
                    <h2 className="text-xl font-semibold text-brandText mb-2">
                        Oups, impossible de trouver cette page
                    </h2>

                    <p className="text-brandText-soft text-sm leading-relaxed">
                        L&apos;adresse que tu as saisie ne correspond à aucune
                        page MindfulSpace. Il est possible que le lien soit
                        erroné ou que la page ait été déplacée.
                    </p>

                    <p className="mt-6 text-sm text-brandText-soft">
                        👉 Tu peux revenir à l&apos;accueil en douceur.
                    </p>

                    <div className="mt-6">
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
                        Besoin d&apos;un repère ?
                    </h3>
                    <p className="text-sm text-brandText-soft leading-relaxed">
                        Respire un instant, puis utilise le menu principal pour
                        retrouver ton tableau de bord, tes séances ou tes
                        objectifs.
                    </p>
                    <p className="text-xl mt-4" aria-hidden="true">
                        🧭
                    </p>
                </article>
            </section>
        </div>
    );
}
