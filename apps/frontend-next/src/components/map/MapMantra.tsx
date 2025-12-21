"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";

type Props = {
    /**
     * Locale utilisée pour générer le mantra côté API.
     *
     * @remarks
     * Valeurs attendues selon la configuration i18n (ex. `fr`, `en`).
     */
    locale: string;

    /**
     * Thème optionnel envoyé à l'API (ex. pour spécialiser le contenu).
     */
    theme?: string;
};

/**
 * Affiche un mantra généré dynamiquement (desktop uniquement).
 *
 * @remarks
 * - Ne déclenche pas de requête sur mobile (le composant n'y est pas rendu).
 * - Effectue un POST vers l'endpoint `ai/mantra` avec `{ locale, theme }`.
 * - Ignore silencieusement les erreurs, car le mantra est non bloquant.
 * - Peut être masqué par l'utilisateur via une croix de fermeture (état local).
 */
export default function MapMantra({ locale, theme }: Props) {
    const [mantra, setMantra] = useState<string | null>(null);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        /**
         * Désactive le chargement sur mobile puisque le rendu est masqué via `md:block`.
         */
        if (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) {
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
                if (!apiBaseUrl) return;

                const res = await apiFetch(`${apiBaseUrl}/ai/mantra`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ locale, theme }),
                    cache: "no-store",
                });

                if (!res.ok) return;

                const data = (await res.json()) as { mantra?: string };
                if (!cancelled) {
                    setMantra(data.mantra ?? null);
                    setIsDismissed(false); // reset lors d’un nouveau mantra / changement de locale
                }
            } catch {
                // Non bloquant : aucune action UI en cas d'erreur.
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [locale, theme]);

    if (!mantra || isDismissed) return null;

    return (
        <div className="hidden md:block absolute inset-0 z-[30] pointer-events-none">
            {/* Box mantra (centrée, semi-transparente, légèrement plus “présente” qu’avant) */}
            <div className="absolute left-1/2 top-[40%] w-[72%] max-w-lg -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                <div
                    className="
                        relative
                        rounded-3xl
                        bg-white/35
                        backdrop-blur-md
                        border border-white/40
                        shadow-lg
                        px-6 py-5
                        text-center
                    "
                >
                    {/* Close (croix en haut à droite) */}
                    <button
                        type="button"
                        onClick={() => setIsDismissed(true)}
                        aria-label="Close mantra"
                        className="
                            absolute right-2.5 top-2.5
                            rounded-xl
                            bg-white/50 hover:bg-white/70
                            transition
                            px-2.5 py-1.5
                            text-slate-700
                            shadow
                        "
                    >
                        ✕
                    </button>

                    <p
                        className="
                            text-base md:text-lg
                            font-light
                            italic
                            leading-relaxed
                            tracking-wide
                            text-slate-800/90
                        "
                    >
                        « {mantra} »
                    </p>
                </div>
            </div>
        </div>
    );
}
