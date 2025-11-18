"use client";

import { useEffect, useState } from "react";
import PageHero from "@/components/PageHero";

type ResourceCategory = {
    id: string;
    name: string;
    slug: string;
    iconEmoji?: string | null;
    _count?: { resources: number };
};

type Resource = {
    id: string;
    title: string;
    slug: string;
    summary: string;
    isPremium: boolean;
    isFeatured: boolean;
    readTimeMin?: number | null;
    category: ResourceCategory;
    tags: { tag: { id: string; name: string; slug: string } }[];
};

// ⚠️ utilise la même base que les autres appels API (dashboard, objectives, …)
const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function ResourcesPage() {
    const [categories, setCategories] = useState<ResourceCategory[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [query, setQuery] = useState("");
    const [categorySlug, setCategorySlug] = useState<string | undefined>();
    const [loading, setLoading] = useState(false);

    // --- chargement des catégories ---
    useEffect(() => {
        async function loadCategories() {
            try {
                const res = await fetch(`${API_BASE_URL}/resources/categories`, {
                    cache: "no-store",
                });

                const contentType = res.headers.get("content-type") ?? "";
                if (!res.ok) {
                    console.error(
                        "Erreur categories:",
                        await res.text()
                    );
                    return;
                }
                if (!contentType.includes("application/json")) {
                    console.error(
                        "Réponse non JSON pour /resources/categories:",
                        contentType,
                        await res.text()
                    );
                    return;
                }

                const data = (await res.json()) as ResourceCategory[];
                setCategories(data);
            } catch (error) {
                console.error("Erreur réseau categories:", error);
            }
        }

        loadCategories();
    }, []);

    // --- chargement des ressources ---
    useEffect(() => {
        async function loadResources() {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (query) params.set("q", query);
                if (categorySlug) params.set("categorySlug", categorySlug);

                const res = await fetch(
                    `${API_BASE_URL}/resources?${params.toString()}`,
                    { cache: "no-store" }
                );

                const contentType = res.headers.get("content-type") ?? "";
                if (!res.ok) {
                    console.error("Erreur resources:", await res.text());
                    return;
                }
                if (!contentType.includes("application/json")) {
                    console.error(
                        "Réponse non JSON pour /resources:",
                        contentType,
                        await res.text()
                    );
                    return;
                }

                const data = (await res.json()) as Resource[];
                setResources(data);
            } catch (error) {
                console.error("Erreur réseau resources:", error);
            } finally {
                setLoading(false);
            }
        }

        loadResources();
    }, [query, categorySlug]);

    return (
        <div className="text-brandText flex flex-col">
            <PageHero
                title="Ressources"
                subtitle="Explore notre collection d’articles et de guides autour du bien-être."
            />

            <section className="mx-auto max-w-5xl w-full px-4 py-8 space-y-6">
                {/* Bloc recherche + filtres */}
                <article className="bg-white border border-brandBorder rounded-card shadow-card p-4 md:p-6 space-y-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="resources-search"
                            className="text-sm font-medium text-brandText"
                        >
                            Rechercher une ressource
                        </label>
                        <input
                            id="resources-search"
                            className="w-full rounded-card border border-brandBorder bg-brandBg px-4 py-2 text-sm text-brandText focus:outline-none focus:ring-2 focus:ring-brandPrimary/60"
                            placeholder="Tape un mot-clé (méditation, sommeil, stress...)"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setCategorySlug(undefined)}
                            className={`rounded-full px-4 py-1 text-sm border ${
                                !categorySlug
                                    ? "bg-emerald-100 border-emerald-300 text-emerald-900"
                                    : "bg-white border-brandBorder text-brandText-soft"
                            }`}
                        >
                            Toutes
                        </button>

                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setCategorySlug(cat.slug)}
                                className={`rounded-full px-4 py-1 text-sm border flex items-center gap-1 ${
                                    categorySlug === cat.slug
                                        ? "bg-emerald-100 border-emerald-300 text-emerald-900"
                                        : "bg-white border-brandBorder text-brandText-soft"
                                }`}
                            >
                                {cat.iconEmoji && (
                                    <span aria-hidden="true">
                                        {cat.iconEmoji}
                                    </span>
                                )}
                                <span>{cat.name}</span>
                                {cat._count?.resources ? (
                                    <span className="text-[11px] opacity-70">
                                        {cat._count.resources}
                                    </span>
                                ) : null}
                            </button>
                        ))}
                    </div>
                </article>

                {/* Liste des ressources */}
                <article className="bg-white border border-brandBorder rounded-card shadow-card p-4 md:p-6">
                    <h2 className="text-lg font-semibold mb-4">
                        Ressources disponibles
                    </h2>

                    {loading && (
                        <p className="text-sm text-brandText-soft">
                            Chargement des ressources…
                        </p>
                    )}

                    {!loading && resources.length === 0 && (
                        <p className="text-sm text-brandText-soft">
                            Aucune ressource ne correspond à ta recherche pour
                            le moment.
                        </p>
                    )}

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {resources.map((r) => (
                            <div
                                key={r.id}
                                className="rounded-2xl border border-brandBorder bg-brandBgCard p-4 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                        <span className="text-xs font-medium uppercase text-emerald-700">
                                            {r.category.name}
                                        </span>
                                        {r.isPremium && (
                                            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-medium text-purple-700">
                                                Premium
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-base font-semibold text-brandText mb-1">
                                        {r.title}
                                    </h3>
                                    <p className="text-sm text-brandText-soft line-clamp-3">
                                        {r.summary}
                                    </p>
                                </div>

                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-brandText-soft">
                                    <div className="flex flex-wrap gap-1">
                                        {r.tags.map((t) => (
                                            <span
                                                key={t.tag.id}
                                                className="rounded-full bg-white/60 px-2 py-0.5"
                                            >
                                                {t.tag.name}
                                            </span>
                                        ))}
                                    </div>
                                    {r.readTimeMin && (
                                        <span>{r.readTimeMin} min</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </article>
            </section>
        </div>
    );
}
