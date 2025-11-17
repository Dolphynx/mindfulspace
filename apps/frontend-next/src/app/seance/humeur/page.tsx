"use client";

/**
 * Page Humeur
 * -----------
 * Cette page permet à l'utilisateur de sélectionner son humeur du moment.
 *
 * Fonctionnement :
 * - L'utilisateur choisit une émotion via le composant MoodPicker (valeur 1–5).
 * - En cliquant sur "Continuer", la valeur est stockée dans localStorage :
 *      - moodScore   → valeur brute (1–5)
 *      - moodPercent → transformation en pourcentage via `moodToPercent`
 * - Puis l’utilisateur est redirigé vers `/seance/astuce`.
 *
 * Particularités :
 * - Page client (localStorage + hooks).
 * - MoodPicker est un composant contrôlé via valeur et callback.
 */

import { useState } from "react";
import MoodPicker from "@/components/MoodPicker";
import { MoodValue, moodToPercent } from "@/lib";
import { useRouter } from "next/navigation";

/**
 * Page client : `/seance/humeur`
 *
 * @returns L’interface de sélection d'humeur (MoodPicker + bouton "Continuer").
 */
export default function HumeurPage() {
    /**
     * Valeur sélectionnée dans MoodPicker :
     * - type MoodValue (enum numérique 1 → 5)
     * - null avant sélection
     */
    const [value, setValue] = useState<MoodValue | null>(null);

    const router = useRouter();

    /**
     * Passe à l'étape suivante :
     * - Vérifie qu'une valeur est sélectionnée
     * - Stocke les données d’humeur dans localStorage
     * - Redirige l'utilisateur vers la page d'astuce
     */
    const next = () => {
        if (!value) return;
        localStorage.setItem("moodScore", String(value));
        localStorage.setItem("moodPercent", String(moodToPercent(value)));
        router.push("/seance/astuce");
    };

    return (
        /**
         * Layout principal :
         * - min-height ajusté pour s’intégrer sous la navbar
         * - centrage vertical + horizontal
         * - espace confortable entre les éléments
         */
        <main className="min-h-[calc(100vh-80px)] flex flex-col items-center gap-8 text-center justify-center">
            <h1 className="text-4xl">Comment vous sentez-vous ?</h1>

            <p className="text-lg text-brandText-soft">
                Prenez un moment pour reconnaître vos émotions
            </p>

            {/**
             * Sélecteur MoodPicker :
             * - `value` → valeur actuelle
             * - `onChangeAction` → callback de mise à jour
             *
             * Le composant MoodPicker gère l'affichage des humeurs sous forme d’icônes.
             */}
            <MoodPicker value={value} onChangeAction={(v) => setValue(v)} />

            {/**
             * Bouton "Continuer"
             * - Actif uniquement quand une valeur est sélectionnée
             * - Déclenche la sauvegarde + redirection
             */}
            <button
                onClick={next}
                disabled={!value}
                className="px-6 py-3 rounded-full bg-brandGreen text-white disabled:opacity-50"
            >
                Continuer
            </button>

            <p className="text-brandText-soft">
                Il n&#39;y a pas de bonne ou mauvaise réponse
            </p>
        </main>
    );
}
