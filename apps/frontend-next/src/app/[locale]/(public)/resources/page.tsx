/**
 * Page listant les ressources.
 *
 * Cette page affiche :
 *  - une barre de recherche
 *  - une liste filtrable par catégories
 *  - l’ensemble des ressources disponibles
 *
 * Route : /[locale]/resources
 */

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import { useTranslations } from "@/i18n/TranslationContext";

/**
 * Catégorie de ressource, retournée par l'API.
 */
type ResourceCategory = {
    id: string;
    name: string;
    slug: string;
    iconEmoji?: string | null;
    /**
     * Compteur fourni par Prisma via _count
     * Exemple : { resources: 5 }
     */
    _count?: { resources: number };
};

/**
 * Structure d’une ressource dans un résultat de liste.
 */
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

/**
 * Rôles possibles pour l'utilisateur (doit matcher ton backend).
 */
type RoleName = "user" | "premium" | "coach" | "admin";

/**
 * Représentation minimale de l’utilisateur telle que renvoyée par `/auth/me`.
 */
type AuthUser = {
    id: string;
    email: string;
    roles: RoleName[];
};

/**
 * Base URL des appels API (identique au reste du front).
 */
const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/**
 * Composant principal de la page liste des ressources.
 *
 * - Charge les catégories au montage
 * - Recharge les ressources en fonction des filtres (recherche + catégorie)
 */
export default function ResourcesPage() {
    // États pour les catégories, ressources et filtres
    const [categories, setCategories] = useState<ResourceCategory[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [query, setQuery] = useState("");
    const [categorySlug, setCategorySlug] = useState<string | undefined>();
    const [loading, setLoading] = useState(false);

    // État pour savoir si l'utilisateur courant est premium (auth optionnelle)
    const [isPremiumUser, setIsPremiumUser] = useState(false);

    /**
     * Déduction de la locale depuis l'URL.
     * Exemple : /fr/resources → locale = "fr".
     */
    const pathname = usePathname();
    const locale = pathname.split("/")[1] || "fr";

    // Namespace i18n spécifique à cette page
    const t = useTranslations("resourcesPage");

    /**
     * Auth optionnelle :
     * - on interroge /auth/me
     * - si 401/403 → on considère juste "non connecté" (isPremiumUser = false)
     * - si OK → on vérifie la présence du rôle "premium"
     * - aucune redirection ici (contrairement à useAuthRequired)
     */
    useEffect(() => {
        let cancelled = false;

        async function loadCurrentUser() {
            try {
                const res = await fetch(
                    `${API_BASE_URL}/auth/me`,
                    { credentials: "include" }
                );

                if (res.status === 401 || res.status === 403) {
                    // pas connecté ou interdit → pas de rôle premium
                    if (!cancelled) setIsPremiumUser(false);
                    return;
                }

                if (!res.ok) {
                    console.error("Erreur /auth/me (optionnel):", await res.text());
                    return;
                }

                const data = (await res.json()) as AuthUser;
                if (cancelled) return;

                const userRoles = data.roles.map((r) => r.toLowerCase());
                const hasPremium = userRoles.includes("premium");
                setIsPremiumUser(hasPremium);
            } catch (error) {
                console.error("Erreur réseau /auth/me (optionnel):", error);
            }
        }

        loadCurrentUser();

        return () => {
            cancelled = true;
        };
    }, []);

    /**
     * Chargement initial des catégories.
     */
    useEffect(() => {
        async function loadCategories() {
            try {
                const res = await fetch(`${API_BASE_URL}/resources/categories`, {
                    cache: "no-store",
                });

                const contentType = res.headers.get("content-type") ?? "";
                if (!res.ok) {
                    console.error("Erreur categories:", await res.text());
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

    /**
     * Chargement des ressources lorsqu'un filtre change.
     *
     * Déclenché par :
     *  - modification du champ de recherche
     *  - sélection d'une catégorie
     */
    useEffect(() => {
        async function loadResources() {
            setLoading(true);

            try {
                const params = new URLSearchParams();
                if (query) params.set("q", query);
                if (categorySlug) params.set("categorySlug", categorySlug);
                // Un filtre par locale pourrait être ajouté ici si besoin.

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
    }, [query, categorySlug /* locale si nécessaire */]);

    return (
        <div className="text-brandText flex flex-col">
            {/* En-tête de page */}
            <PageHero
                title={t("heroTitle")}
                subtitle={t("heroSubtitle")}
            />

            <section className="mx-auto max-w-5xl w-full px-4 py-8 space-y-6">
                {/* Bloc recherche + filtres */}
                <article className="bg-white border border-brandBorder rounded-card shadow-card p-4 md:p-6 space-y-4">
                    {/* Recherche */}
                    <div className="space-y-2">
                        <label
                            htmlFor="resources-search"
                            className="text-sm font-medium text-brandText"
                        >
                            {t("searchLabel")}
                        </label>

                        <input
                            id="resources-search"
                            className="w-full rounded-card border border-brandBorder bg-brandBg px-4 py-2 text-sm text-brandText focus:outline-none focus:ring-2 focus:ring-brandPrimary/60"
                            placeholder={t("searchPlaceholder")}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>

                    {/* Filtres par catégorie */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setCategorySlug(undefined)}
                            className={`rounded-full px-4 py-1 text-sm border ${
                                !categorySlug
                                    ? "bg-brandBorder border-brandBorder text-brandGreen"
                                    : "bg-white border-brandBorder text-brandText-soft"
                            }`}
                        >
                            {t("allCategories")}
                        </button>

                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setCategorySlug(cat.slug)}
                                className={`rounded-full px-4 py-1 text-sm border flex items-center gap-1 ${
                                    categorySlug === cat.slug
                                        ? "bg-brandBorder border-brandBorder text-brandGreen"
                                        : "bg-white border-brandBorder text-brandText-soft"
                                }`}
                            >
                                {cat.iconEmoji && (
                                    <span aria-hidden="true">
                                        {cat.iconEmoji}
                                    </span>
                                )}
                                <span>{cat.name}</span>

                                {/* Affiche le nombre de ressources dans la catégorie si disponible */}
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
                        {t("listTitle")}
                    </h2>

                    {/* État : chargement */}
                    {loading && (
                        <p className="text-sm text-brandText-soft">
                            {t("loading")}
                        </p>
                    )}

                    {/* État : aucune ressource */}
                    {!loading && resources.length === 0 && (
                        <p className="text-sm text-brandText-soft">
                            {t("empty")}
                        </p>
                    )}

                    {/* Grille des cartes */}
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {resources.map((r) => {
                            const isLocked = r.isPremium && !isPremiumUser;

                            const card = (
                                <div
                                    className={
                                        "rounded-2xl border border-brandBorder bg-brandBgCard p-4 flex flex-col justify-between transition-all " +
                                        (isLocked
                                            ? "opacity-70 cursor-not-allowed"
                                            : "hover:shadow-lg hover:-translate-y-0.5")
                                    }
                                >
                                    <div>
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                            <span className="text-xs font-medium uppercase text-brandText-soft">
                                                {r.category.name}
                                            </span>

                                            {r.isPremium && (
                                                <div className="flex items-center gap-1">
                                                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-medium text-purple-700">
                                                        {t("premiumBadge")}
                                                    </span>
                                                    <Image
                                                        src="/images/session_premium.png"
                                                        alt={t("premiumIconAlt")}
                                                        width={18}
                                                        height={18}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="text-base font-semibold text-brandText mb-1">
                                            {r.title}
                                        </h3>

                                        <p className="text-sm text-brandText-soft line-clamp-3">
                                            {r.summary}
                                        </p>
                                    </div>

                                    {/* Tags + durée de lecture */}
                                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-brandText-soft">
                                        <div className="flex flex-wrap gap-1">
                                            {r.tags.map((tTag) => (
                                                <span
                                                    key={tTag.tag.id}
                                                    className="rounded-full bg-white/60 px-2 py-0.5"
                                                >
                                                    {tTag.tag.name}
                                                </span>
                                            ))}
                                        </div>

                                        {r.readTimeMin && (
                                            <span>
                                                {r.readTimeMin}{" "}
                                                {t("readTimeSuffix")}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );

                            if (isLocked) {
                                return (
                                    <div
                                        key={r.id}
                                        aria-label={t(
                                            "lockedPremiumResource"
                                        )}
                                        title={t("lockedPremiumTooltip")}
                                    >
                                        {card}
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={r.id}
                                    href={`/${locale}/resources/${r.slug}`}
                                    className="block"
                                >
                                    {card}
                                </Link>
                            );
                        })}
                    </div>
                </article>
            </section>
        </div>
    );
}