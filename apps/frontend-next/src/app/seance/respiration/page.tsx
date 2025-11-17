"use client";

/**
 * Page de respiration guidée
 * --------------------------
 * Cette page propose un exercice de respiration composé de cycles :
 *   - Inspirez (4s)
 *   - Bloquez (4s)
 *   - Expirez (4s)
 *
 * Fonctionnement :
 * - La page utilise des timers successifs pour changer automatiquement de phase.
 * - Après 3 cycles complets, l’utilisateur est automatiquement redirigé vers
 *   “/seance/humeur”.
 * - Un bouton “Skip” permet de passer directement au dashboard.
 *
 * Aspects techniques importants :
 * - `aliveRef` sert à empêcher les timers de se déclencher après démontage.
 * - Les timers sont stockés dans `timersRef` pour être tous annulés proprement.
 * - `useRef` est utilisé pour la séquence et la persistance des états internes.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

/**
 * Page client : `/respiration`
 *
 * @returns L’interface de respiration guidée (animation + progression + navigation).
 *
 * Notes :
 * - Utilise `use client` pour activer les hooks React.
 * - Toute la logique repose sur un système de boucle pilotée par `setTimeout`.
 */
export default function RespirationPage() {
    const router = useRouter();

    /**
     * Phase actuelle de respiration.
     *
     * Les phases disponibles sont strictement :
     * - "inspirez"
     * - "bloquez"
     * - "expirez"
     *
     * La phase change automatiquement selon la séquence définie dans `sequence`.
     */
    const [phase, setPhase] = useState<"inspirez" | "bloquez" | "expirez">("inspirez");

    /**
     * Numéro du cycle actuel (1 → totalCycles).
     * Après le dernier cycle, une redirection automatique est déclenchée.
     */
    const [cycle, setCycle] = useState(1);

    /**
     * Nombre total de cycles à effectuer avant la redirection automatique.
     */
    const totalCycles = 3;

    /**
     * Séquence des phases :
     * Chaque entrée contient :
     * - p : phase ("inspirez" | "bloquez" | "expirez")
     * - d : durée (en ms)
     *
     * L’usage de `useRef` permet d'éviter de recréer la séquence à chaque rendu.
     */
    const sequence = useRef([
        { p: "inspirez" as const, d: 4000 },
        { p: "bloquez" as const, d: 4000 },
        { p: "expirez" as const, d: 4000 },
    ]);

    /**
     * Référence booléenne pour savoir si la page est encore montée.
     * Permet d’empêcher la mise à jour d’état ou l’exécution de timers
     * après la destruction du composant.
     */
    const aliveRef = useRef(true);

    /**
     * Stocke tous les timers créés pour pouvoir les annuler proprement
     * dans le cleanup de `useEffect`.
     */
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    /**
     * Fonction appelée à la fin des cycles pour avancer vers le questionnaire humeur.
     */
    const goNext = useCallback(() => {
        if (aliveRef.current) router.push("/seance/humeur");
    }, [router]);

    /**
     * Fonction du bouton "Skip" : permet au user de passer directement au dashboard.
     */
    const handleSkip = () => {
        if (aliveRef.current) router.push("/dashboard");
    };

    /**
     * Effet principal :
     * ----------------
     * - Préfetch la page suivante pour une transition rapide.
     * - Lance une boucle autonome de respiration via run().
     * - Nettoie tous les timers en sortie.
     *
     * `run()` :
     *  - Applique la phase actuelle.
     *  - Attend la durée correspondante.
     *  - Passe à la phase suivante ou au cycle suivant.
     *  - Termine en déclenchant `goNext()` après tous les cycles.
     */
    useEffect(() => {
        aliveRef.current = true;

        try {
            router.prefetch("/seance/humeur");
        } catch {}

        let i = 0;

        const run = () => {
            if (!aliveRef.current) return;

            const cur = sequence.current[i % sequence.current.length];
            setPhase(cur.p);

            const t = setTimeout(() => {
                if (!aliveRef.current) return;

                i++;

                // Lorsque l’index boucle (fin d’un cycle complet)
                if (i % sequence.current.length === 0) {
                    setCycle((c) => {
                        const next = c + 1;
                        if (next > totalCycles) {
                            // Redirection planifiée à la microtask suivante
                            queueMicrotask(goNext);
                            return c;
                        }
                        return next;
                    });
                }

                run();
            }, cur.d);

            timersRef.current.push(t);
        };

        run();

        // Cleanup → annule tous les timers et empêche toute exécution future
        return () => {
            aliveRef.current = false;
            for (const t of timersRef.current) clearTimeout(t);
            timersRef.current = [];
        };
    }, [router, goNext]);

    /**
     * Table de couleurs utilisée pour le dégradé du cercle animé.
     * Correspond 1:1 avec la phase active.
     */
    const colorMap = {
        inspirez: "from-emerald-400 to-green-600",
        bloquez: "from-cyan-400 to-sky-500",
        expirez: "from-amber-400 to-orange-500",
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center text-center gap-8 relative">

            {/** Bouton Skip (redirection immédiate vers /dashboard) */}
            <button
                onClick={handleSkip}
                className="absolute top-4 right-4 px-4 py-2 rounded-full bg-brandGreen/20 text-brandGreen hover:bg-brandGreen/30 transition"
            >
                Skip ⏩
            </button>

            <h1 className="text-4xl md:text-5xl text-brandText">Respiration guidée</h1>

            {/**
             * Cercle animé :
             * - Taille fixe (w/h 64)
             * - Dégradé variant selon `phase`
             * - Animation d’échelle synchronisée avec les phases
             *   - Inspirez → cercle s'agrandit
             *   - Expirez → cercle se réduit
             *   - Bloquez → position neutre
             *
             * Transition contrôlée via `duration-[4000ms]`
             * pour coller exactement à la durée des phases.
             */}
            <div
                className={`relative w-64 h-64 rounded-full flex items-center justify-center text-3xl md:text-5xl text-white transition-all duration-[4000ms] ${
                    phase === "inspirez"
                        ? "scale-110"
                        : phase === "expirez"
                            ? "scale-90"
                            : "scale-100"
                } bg-gradient-to-br ${colorMap[phase]}`}
            >
                <span className="drop-shadow-md">
                    {phase === "inspirez"
                        ? "Inspirez"
                        : phase === "bloquez"
                            ? "Bloquez"
                            : "Expirez"}
                </span>
            </div>

            {/** Affichage du cycle en cours + instruction textuelle */}
            <div className="text-brandText-soft">
                <p>Cycle {cycle} / {totalCycles}</p>
                <p>Suivez le rythme de respiration</p>
            </div>
        </main>
    );
}
