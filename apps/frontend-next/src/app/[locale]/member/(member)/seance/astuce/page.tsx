/**
 * Page Astuce + Mantra IA
 * ------------------------
 * Cette page affiche :
 *  - une astuce / conseil bien-être récupéré depuis `getTip(locale)` (API Nest)
 *  - un mini-mantra généré par le module IA (endpoint Nest : POST /ai/mantra)
 *
 * Composant serveur :
 *  - pas de "use client"
 *  - appels effectués côté serveur (aucune clé d’API exposée au navigateur)
 *
 * i18n :
 *  - Tous les textes d’interface proviennent du dictionnaire `tipSession`.
 *  - La locale est extraite du segment dynamique [locale].
 */

import { getTip } from "@/lib";
import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

export default async function AstucePage({
                                             params,
                                         }: {
    params: Promise<{ locale: string }>;
}) {
    // Résolution de la locale depuis [locale]
    const { locale: rawLocale } = await params;
    const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

    // Chargement du dictionnaire pour cette locale
    const dict = await getDictionary(locale);
    const t = dict.tipSession;

    /**
     * Astuce locale (API Nest via lib)
     *
     * On passe la locale telle quelle au backend.
     * Si l’API ne renvoie rien → fallback i18n (t.fallbackTip).
     */
    const rawTip = await getTip(locale);
    const tip = rawTip ?? t.fallbackTip;

    /**
     * Mantra IA (API Nest)
     *
     * On passe aussi la locale telle quelle au backend.
     *   POST /ai/mantra
     *   body: { locale: string, theme?: string }
     *   response: { mantra: string }
     */
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    let mantra: string | null = null;

    if (apiBaseUrl) {
        try {
            const res = await fetch(`${apiBaseUrl}/ai/mantra`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    locale,
                    // Pas de thème spécifique : mantra générique de bien-être
                }),
                cache: "no-store",
            });

            if (res.ok) {
                const data: { mantra?: string } = await res.json();
                mantra = data.mantra ?? null;
            } else {
                console.error("Erreur API /ai/mantra:", res.status, res.statusText);
            }
        } catch (err) {
            console.error("Erreur lors de l'appel à /ai/mantra:", err);
        }
    } else {
        console.error("NEXT_PUBLIC_API_URL manquant : impossible d'appeler /ai/mantra.");
    }

    return (
        /**
         * Conteneur principal centré verticalement.
         * - min-height ajustée pour tenir compte de la navbar
         * - disposition verticale avec espacement
         */
        <main className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-8 text-center">
            <h1 className="text-3xl text-brandText">{t.title}</h1>

            {/**
             * Carte affichant l’astuce :
             */}
            <div className="bg-white border border-brandBorder rounded-2xl shadow-card px-6 py-10 max-w-2xl text-2xl text-brandText-soft">
                « {tip} »
                <br />
                <small className="top-0 text-xs">{t.tipSourceLabel}</small>
            </div>

            {/**
             * Bloc optionnel : mantra généré par l’IA
             */}
            {mantra && (
                <div className="bg-white border border-brandBorder rounded-2xl shadow-card px-6 py-8 max-w-2xl text-xl italic text-brandText-soft">
                    « {mantra} »
                    <br />
                    <small className="top-0 text-xs">{t.mantraSourceLabel}</small>
                </div>
            )}

            {/**
             * Bouton → page de récap
             */}
            <Link
                href={`/${locale}/member/seance/recap`}
                className="px-6 py-3 rounded-full bg-brandGreen text-white hover:opacity-90 transition"
            >
                {t.finishButton}
            </Link>

            <p className="text-brandText-soft">{t.keepThought}</p>
        </main>
    );
}
