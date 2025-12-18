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
 */
export default function MapMantra({ locale, theme }: Props) {
    const [mantra, setMantra] = useState<string | null>(null);

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
                if (!cancelled) setMantra(data.mantra ?? null);
            } catch {
                // Non bloquant : aucune action UI en cas d'erreur.
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [locale, theme]);

    if (!mantra) return null;

    return (
        <div className="hidden md:block absolute inset-0 z-[8] pointer-events-none">
            <div className="absolute left-1/2 top-1/2 w-[68%] max-w-lg -translate-x-1/2 -translate-y-1/2 text-center">
                <p
                    className="
                        text-base md:text-lg
                        font-light
                        italic
                        leading-relaxed
                        tracking-wide
                        text-white/85
                        drop-shadow-[0_1px_6px_rgba(0,0,0,0.25)]
                    "
                >
                    « {mantra} »
                </p>
            </div>
        </div>
    );
}
