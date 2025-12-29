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
import PageHero from "@/components/layout/PageHero";
import { useTranslations } from "@/i18n/TranslationContext";
import {
    getResourceBySlug,
    enrichResourceWithTranslation,
    getCategoryName,
    getTagName,
    Resource,
} from "@/lib/api/resources";

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
    const [resource, setResource] = useState<Resource | null>(null);
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
                const data = await getResourceBySlug(slugValue);

                // Enrich resource with translation for current locale
                const enriched = enrichResourceWithTranslation(data, locale);
                setResource(enriched);
            } catch (err: any) {
                console.error("Erreur resource detail:", err);

                // Check for specific error types
                if (err.message?.includes('403') || err.message?.includes('Forbidden')) {
                    setIsForbidden(true);
                    setError(null);
                } else if (err.message?.includes('404') || err.message?.includes('not found')) {
                    setError(t("notFoundText"));
                } else {
                    setError(t("errorGeneric"));
                }

                setResource(null);
            } finally {
                setLoading(false);
            }
        }

        loadResource(slug);
    }, [slug, locale]);

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
                    <article className="bg-white border border-brandBorder rounded-card shadow-card overflow-hidden">
                        {/* En-tête avec badges */}
                        <header className="bg-gradient-to-br from-brandBg to-white px-6 py-5 border-b border-brandBorder">
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                <div className="flex items-center gap-2">
                                    {resource.category?.iconEmoji && (
                                        <span
                                            aria-hidden="true"
                                            className="text-2xl"
                                        >
                                            {resource.category.iconEmoji}
                                        </span>
                                    )}
                                    <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                        {resource.category ? getCategoryName(resource.category, locale) : ''}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    {resource.readTimeMin && (
                                        <span className="rounded-full bg-white border border-brandBorder px-3 py-1 text-brandText-soft font-medium shadow-sm">
                                            {resource.readTimeMin}{" "}
                                            {t("readTimeSuffix")}
                                        </span>
                                    )}
                                    {resource.isPremium && (
                                        <span className="rounded-full bg-purple-100 px-3 py-1 font-semibold text-purple-700 shadow-sm">
                                            💎 {t("premiumBadge")}
                                        </span>
                                    )}
                                    {resource.isFeatured && (
                                        <span className="rounded-full bg-yellow-100 px-3 py-1 font-semibold text-yellow-700 shadow-sm">
                                            ⭐ {t("featuredBadge")}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Titre + résumé */}
                            <div className="space-y-3">
                                <h1 className="text-3xl font-bold text-brandText leading-tight">
                                    {resource.title}
                                </h1>
                                {resource.summary && (
                                    <p className="text-base text-brandText-soft leading-relaxed">
                                        {resource.summary}
                                    </p>
                                )}
                            </div>
                        </header>

                        {/* Métadonnées: auteur, date */}
                        <div className="px-6 py-4 bg-brandBg/30 border-b border-brandBorder">
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-brandText-soft">
                                {resource.authorName && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-brandText">👤</span>
                                        <span className="font-medium text-brandText">{t("authorLabel")}:</span>
                                        <span className="font-semibold text-brandText">{resource.authorName}</span>
                                    </div>
                                )}
                                {resource.createdAt && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-brandText">📅</span>
                                        <span className="font-medium">{t("publishedLabel")}:</span>
                                        <span>{new Date(resource.createdAt).toLocaleDateString(locale, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</span>
                                    </div>
                                )}
                                {resource.updatedAt && resource.updatedAt !== resource.createdAt && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-brandText">🔄</span>
                                        <span className="font-medium">{t("updatedLabel")}:</span>
                                        <span>{new Date(resource.updatedAt).toLocaleDateString(locale, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tags */}
                        {resource.tags && resource.tags.length > 0 && (
                            <div className="px-6 py-4 border-b border-brandBorder">
                                <div className="flex flex-wrap gap-2">
                                    {resource.tags.map((tTag) => (
                                        <span
                                            key={tTag.tag.id}
                                            className="inline-flex items-center rounded-full bg-brandGreen/10 border border-brandGreen/20 px-3 py-1 text-xs font-medium text-brandGreen hover:bg-brandGreen/20 transition-colors"
                                        >
                                            #{getTagName(tTag.tag, locale)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Corps de la ressource */}
                        <section className="px-6 py-8 prose prose-base max-w-none prose-headings:text-brandText prose-headings:font-bold prose-p:text-brandText prose-p:leading-relaxed prose-strong:text-brandText prose-strong:font-semibold prose-a:text-brandGreen prose-a:no-underline hover:prose-a:underline prose-ul:text-brandText prose-ol:text-brandText">
                            {resource.content ? (
                                <div className="whitespace-pre-line">
                                    {resource.content}
                                </div>
                            ) : (
                                <p className="text-sm text-brandText-soft italic">
                                    {t("noContent")}
                                </p>
                            )}
                        </section>

                        {/* Lien externe (pour vidéos, etc.) - After content */}
                        {resource.externalUrl && (
                            <div className="mx-6 mb-6 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 text-4xl">🔗</div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-brandText mb-2">
                                            {t("externalLinkTitle")}
                                        </h3>
                                        <p className="text-sm text-brandText-soft mb-4 leading-relaxed">
                                            {t("externalLinkDescription")}
                                        </p>
                                        <a
                                            href={resource.externalUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg active:scale-95"
                                        >
                                            {t("openExternalLink")}
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}
                    </article>
                )}
            </section>
        </div>
    );
}
