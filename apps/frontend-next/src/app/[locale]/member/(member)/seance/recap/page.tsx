"use client";

/**
 * Page récapitulative de séance
 * ------------------------------
 * Cette page affiche :
 * - Un score issu du questionnaire d’humeur (récupéré depuis localStorage)
 * - Une illustration circulaire du score
 * - Des boutons pour retourner au dashboard ou refaire la séance
 *
 * Particularités :
 * - Page client (use client) car elle lit localStorage.
 * - Le score est converti en pourcentage (0 → 100) via : moodScore * 20.
 *
 * i18n :
 * - Tous les textes utilisateur proviennent du dictionnaire `sessionRecap`.
 * - La locale est déduite de l’URL (/fr/... ou /en/...).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "@/i18n/TranslationContext";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";


/**
 * Page client : `/[locale]/member/seance/recap`
 *
 * @returns Le résumé de la séance (score, actions, message motivant).
 *
 * Notes :
 * - La page dépend de localStorage : elle doit être rendue côté client.
 */
export default function RecapPage() {
    const router = useRouter();

    const params = useParams<{ locale?: string }>();
    const raw = params.locale ?? defaultLocale;
    const locale: Locale = isLocale(raw) ? raw : defaultLocale;

    // Namespace i18n pour cette page
    const t = useTranslations("sessionRecap");

    /**
     * Score final affiché (0–100).
     * - null = score non initialisé
     * - basé sur la valeur sauvegardée par la page précédente (moodScore)
     */
    const [score, setScore] = useState<number | null>(null);

    /**
     * Récupère le score depuis localStorage.
     * moodScore (0–5) → score affiché (0–100) via multiplication par 20.
     *
     * Le code ignore toute valeur incorrecte (NaN).
     */
    useEffect(() => {
        const s = Number(localStorage.getItem("moodScore") || "0");
        setScore(isNaN(s) ? null : s * 20);
    }, []);

    return (
        /**
         * Conteneur principal :
         * - min-height ajusté pour s'intégrer sous la navbar
         * - centrage vertical + horizontal
         */
        <main className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-8 text-center">
            <h1 className="text-4xl text-brandText">
                {t("title")}
            </h1>

            {/**
             * Cercle affichant le score (design simple avec bordure épaisse).
             * `score ?? 60` :
             *   - Affiche le score dès qu'il est chargé
             *   - 60 = valeur fallback avant lecture localStorage
             */}
            <div className="relative w-48 h-48 rounded-full border-8 border-brandGreen/40 flex items-center justify-center">
                <span className="text-4xl text-brandText">
                    {score ?? 60}
                </span>
            </div>

            <p className="text-brandText-soft">
                {t("progressMessage")}
            </p>

            {/** Boutons d’action : dashboard + refaire une séance */}
            <div className="flex gap-3 flex-wrap justify-center">
                {/* 🔹 Lien vers le dashboard */}
                <Link
                    href={`/${locale}/member/world-v2`}
                    className="px-5 py-2 rounded-full bg-brandGreen text-white"
                >
                    {t("dashboardButton")}
                </Link>

                {/* 🔹 Bouton pour relancer une séance (redirige vers respiration) */}
                <button
                    onClick={() =>
                        router.push(`/${locale}/member/seance/respiration`)
                    }
                    className="px-5 py-2 rounded-full bg-brandGreen/20 text-brandGreen"
                >
                    {t("redoButton")}
                </button>
            </div>

            <p className="text-brandText-soft">
                {t("reminder")}
            </p>
        </main>
    );
}
