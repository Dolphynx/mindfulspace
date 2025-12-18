/**
 * Page de détail d'une ressource.
 *
 * Affiche le contenu complet d'une ressource (métadonnées, tags, contenu HTML/texte),
 * sur la route dynamique : /[locale]/resources/[slug].
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import PageHero from "@/components/PageHero";
import { useTranslations } from "@/i18n/TranslationContext";

/**
 * Catégorie d'une ressource (ex. "Méditation", "Sommeil", etc.).
 */
type ResourceCategory = {
    id: string;
    name: string;
    slug: string;
    iconEmoji?: string | null;
};

/**
 * Tag lié à la ressource, encapsulé dans une structure de liaison.
 */
type ResourceTag = {
    tag: {
        id: string;
        name: string;
        slug: string;
    };
};

/**
 * Représentation détaillée d'une ressource telle que renvoyée par l'API.
 */
type ResourceDetail = {
    id: string;
    title: string;
    slug: string;
    summary: string;
    isPremium: boolean;
    isFeatured: boolean;
    readTimeMin?: number | null;
    category: ResourceCategory;
    tags: ResourceTag[];
    /**
     * Contenu brut (texte ou markdown-like), utilisé comme fallback.
     */
    content?: string | null;
    /**
     * Contenu HTML pré-rendu par le backend (prioritaire sur `content`).
     */
    htmlContent?: string | null;
};

/**
 * Base URL de l'API (configurée via NEXT_PUBLIC_API_URL ou localhost en dev).
 */
const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/**
 * Composant de page affichant le détail d'une ressource.
 *
 * - Récupère `locale` et `slug` via `useParams`.
 * - Charge la ressource correspondante depuis l'API.
 * - Gère les états de chargement, d'erreur et de "non trouvé".
 */
export default function ResourceDetailPage() {
    const params = useParams<{ locale: string; slug: string }>();
    const router = useRouter();

    // On force des strings, avec fallback correct
    const localeParam = params?.locale;
    const locale =
        typeof localeParam === "string" && localeParam.length > 0
            ? localeParam
            : "fr";

    const slugParam = params?.slug;
    const slug =
        typeof slugParam === "string" && slugParam.length > 0
            ? slugParam
            : "";

    // Namespace de traduction spécifique à cette page
    const t = useTranslations("resourceDetailPage");

    // État local pour la ressource, le chargement et les erreurs
    const [resource, setResource] = useState<ResourceDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isForbidden, setIsForbidden] = useState(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        // Si pas de slug (string vide), on ne lance rien
        if (!slug) return;

        /**
         * Charge les données de la ressource pour un slug donné.
         */
        async function loadResource(slugValue: string) {
            setLoading(true);
            setError(null);
            setIsForbidden(false);

            try {
                const res = await fetch(
                    `${API_BASE_URL}/resources/${encodeURIComponent(
                        slugValue
                    )}`,
                    {
                        cache: "no-store",
                        credentials: "include", // utile si tu utilises des cookies pour l'auth
                    }
                );

                const contentType = res.headers.get("content-type") ?? "";

                if (res.status === 403) {
                    // Ressource premium sans droit d’accès
                    setIsForbidden(true);
                    setError(null);
                    setResource(null);
                    return;
                }

                if (!res.ok) {
                    const text = await res.text();
                    console.error("Erreur resource detail:", text);
                    setError(
                        res.status === 404
                            ? t("notFoundText")
                            : t("errorGeneric")
                    );
                    setResource(null);
                    return;
                }

                if (!contentType.includes("application/json")) {
                    console.error(
                        "Réponse non JSON pour /resources/:slug:",
                        contentType,
                        await res.text()
                    );
                    setError(t("errorGeneric"));
                    setResource(null);
                    return;
                }

                const data = (await res.json()) as ResourceDetail;
                setResource(data);
            } catch (err) {
                console.error("Erreur réseau resource detail:", err);
                setError(t("errorNetwork"));
                setResource(null);
            } finally {
                setLoading(false);
            }
        }

        loadResource(slug);
    }, [slug]);

    // Titre à afficher dans le hero : soit celui de la ressource, soit une valeur fallback
    const pageTitle =
        resource?.title ?? t(loading ? "loadingTitle" : "fallbackTitle");

    return (
        <div className="text-brandText flex flex-col">
            <PageHero
                title={pageTitle}
                subtitle={resource?.summary ?? t("heroSubtitle")}
            />

            <section className="mx-auto max-w-3xl w-full px-4 py-8 space-y-6">
                {/* Breadcrumb */}
                <nav className="text-xs text-brandText-soft">
                    <Link
                        href={`/${locale}/resources`}
                        className="hover:underline"
                    >
                        {t("backToList")}
                    </Link>
                    {" / "}
                    {resource ? (
                        <span className="font-medium text-brandText">
                            {resource.title}
                        </span>
                    ) : (
                        <span className="opacity-70">{t("loading")}</span>
                    )}
                </nav>

                {/* États techniques */}
                {loading && (
                    <article className="bg-white border border-brandBorder rounded-card shadow-card p-6">
                        <p className="text-sm text-brandText-soft">
                            {t("loading")}
                        </p>
                    </article>
                )}

                {/* 403 – accès refusé (premium) */}
                {!loading && isForbidden && (
                    <article className="bg-white border border-red-200 rounded-card shadow-card p-6">
                        <h2 className="text-base font-semibold text-red-700 mb-2">
                            {t("forbiddenTitle")}
                        </h2>
                        <p className="text-sm text-red-700 mb-4">
                            {t("forbiddenText")}
                        </p>

                        <button
                            type="button"
                            onClick={() => router.push(`/${locale}/resources`)}
                            className="inline-flex items-center rounded-full bg-brandPrimary px-4 py-1.5 text-xs font-medium text-white hover:bg-brandPrimary/90"
                        >
                            {t("backToListCTA")}
                        </button>
                    </article>
                )}

                {/* Erreur générique / 404 */}
                {!loading && !isForbidden && error && (
                    <article className="bg-white border border-red-200 rounded-card shadow-card p-6">
                        <h2 className="text-base font-semibold text-red-700 mb-2">
                            {t("errorTitle")}
                        </h2>
                        <p className="text-sm text-red-700">{error}</p>
                    </article>
                )}

                {!loading && !isForbidden && !error && !resource && (
                    <article className="bg-white border border-brandBorder rounded-card shadow-card p-6">
                        <h2 className="text-base font-semibold mb-2">
                            {t("notFoundTitle")}
                        </h2>
                        <p className="text-sm text-brandText-soft">
                            {t("notFoundText")}
                        </p>
                    </article>
                )}

                {/* Contenu principal */}
                {!loading && !isForbidden && !error && resource && (
                    <article className="bg-white border border-brandBorder rounded-card shadow-card p-6 space-y-4">
                        {/* En-tête */}
                        <header className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                {resource.category.iconEmoji && (
                                    <span
                                        aria-hidden="true"
                                        className="text-xl"
                                    >
                                        {resource.category.iconEmoji}
                                    </span>
                                )}
                                <span className="text-xs font-medium uppercase text-emerald-700">
                                    {resource.category.name}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-brandText-soft">
                                {resource.readTimeMin && (
                                    <span className="rounded-full bg-brandBg px-2 py-0.5">
                                        {resource.readTimeMin}{" "}
                                        {t("readTimeSuffix")}
                                    </span>
                                )}

                                {resource.isPremium && (
                                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-medium text-purple-700">
                                        {t("premiumBadge")}
                                    </span>
                                )}
                            </div>
                        </header>

                        {/* Titre + résumé */}
                        <div className="space-y-2">
                            <h1 className="text-2xl font-semibold text-brandText">
                                {resource.title}
                            </h1>
                            {resource.summary && (
                                <p className="text-sm text-brandText-soft">
                                    {resource.summary}
                                </p>
                            )}
                        </div>

                        {/* Tags */}
                        {resource.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 text-xs">
                                {resource.tags.map((tTag) => (
                                    <span
                                        key={tTag.tag.id}
                                        className="rounded-full bg-brandBg px-2 py-0.5 text-brandText-soft"
                                    >
                                        {tTag.tag.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        <hr className="border-brandBorder/60" />

                        {/* Corps de la ressource */}
                        <section className="prose prose-sm max-w-none prose-headings:text-brandText prose-p:text-brandText-soft prose-strong:text-brandText">
                            {resource.htmlContent ? (
                                <div
                                    // Le HTML est supposé être déjà nettoyé côté backend.
                                    dangerouslySetInnerHTML={{
                                        __html: resource.htmlContent,
                                    }}
                                />
                            ) : resource.content ? (
                                <p className="whitespace-pre-line">
                                    {resource.content}
                                </p>
                            ) : (
                                <p className="text-sm text-brandText-soft">
                                    {t("noContent")}
                                </p>
                            )}
                        </section>
                    </article>
                )}
            </section>
        </div>
    );
}
