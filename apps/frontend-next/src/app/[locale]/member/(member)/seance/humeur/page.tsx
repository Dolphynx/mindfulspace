"use client";

/**
 * Page Humeur — version i18n
 * --------------------------
 * Cette page permet à l'utilisateur de sélectionner son humeur du moment.
 *
 * Fonctionnement :
 * - L'utilisateur choisit une émotion via le composant MoodPicker (valeur 1–5).
 * - En cliquant sur "Continuer", la valeur est stockée dans localStorage :
 *      - moodScore   → valeur brute (1–5)
 *      - moodPercent → transformation en pourcentage via `moodToPercent`
 * - Puis l’utilisateur est redirigé vers `/member/seance/astuce`.
 *
 * Particularités :
 * - Page member (use client) car elle utilise localStorage.
 * - MoodPicker est un composant contrôlé via valeur + callback.
 * - Tous les textes utilisateur proviennent du dictionnaire i18n
 *   dans le namespace `moodSession`.
 */

import { useState } from "react";
import MoodPicker from "@/components/shared/MoodPicker";
import { MoodValue, moodToPercent } from "@/lib";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "@/i18n/TranslationContext";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

/**
 * Page client : `/[locale]/member/seance/humeur`
 *
 * @returns L’interface de sélection d'humeur (MoodPicker + bouton "Continuer").
 */
export default function HumeurPage() {
    /** Valeur sélectionnée */
    const [value, setValue] = useState<MoodValue | null>(null);

    const router = useRouter();

    const params = useParams<{ locale?: string }>();
    const raw = params.locale ?? defaultLocale;
    const locale: Locale = isLocale(raw) ? raw : defaultLocale;

    // Namespace i18n
    const t = useTranslations("moodSession");

    /**
     * Passe à l'étape suivante :
     * - Vérifie qu'une valeur est sélectionnée
     * - Stocke moodScore & moodPercent dans localStorage
     * - Redirige vers la page suivante : /member/seance/astuce
     */
    const next = () => {
        if (!value) return;
        localStorage.setItem("moodScore", String(value));
        localStorage.setItem("moodPercent", String(moodToPercent(value)));
        router.push(`/${locale}/member/seance/astuce`);
    };

    return (
        /**
         * Layout principal :
         * - min-height ajusté pour s’intégrer sous la navbar
         * - centrage vertical + horizontal
         * - espace confortable entre les éléments
         */
        <main className="min-h-[calc(100vh-80px)] flex flex-col items-center gap-8 text-center justify-center">
            <h1 className="text-4xl text-brandText">{t("title")}</h1>

            <p className="text-lg text-brandText-soft">
                {t("subtitle")}
            </p>

            {/**
             * Sélecteur MoodPicker :
             * - `value` → valeur actuelle
             * - `onChangeAction` → callback de mise à jour
             */}
            <MoodPicker value={value} onChangeAction={setValue} />

            {/**
             * Bouton "Continuer"
             * - Activé seulement après sélection
             * - Déclenche sauvegarde + redirection
             */}
            <button
                onClick={next}
                disabled={!value}
                className="px-6 py-3 rounded-full bg-brandGreen text-white disabled:opacity-50"
            >
                {t("continue")}
            </button>

            <p className="text-brandText-soft">
                {t("note")}
            </p>
        </main>
    );
}
