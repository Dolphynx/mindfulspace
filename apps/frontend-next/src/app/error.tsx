"use client";

/**
 * GlobalError
 * -----------
 * Error Boundary global (fallback).
 *
 * @remarks
 * - Capture toute erreur runtime qui survient hors du sous-arbre `/[locale]/*`
 *   (ex: routes techniques, auth, pages non localisées).
 * - Ne dépend PAS du système i18n.
 * - Sert uniquement de fallback de sécurité.
 *
 * Rappel Next.js :
 * - `error.tsx` DOIT être un Client Component.
 * - Il reçoit automatiquement `error` et `reset`.
 */

import { useEffect } from "react";
import Link from "next/link";

type GlobalErrorProps = {
    /** Erreur capturée par Next (digest présent en production). */
    error: Error & { digest?: string };
    /** Permet de retenter le rendu du segment en erreur. */
    reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
    useEffect(() => {
        // Log minimal pour debug (dev / prod).
        console.error("[GlobalError] Erreur non localisée :", error);
    }, [error]);

    return (
        <main className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center text-brandText">
            <h1 className="text-3xl font-semibold">Une erreur est survenue</h1>

            <p className="mt-2 text-sm opacity-80">
                Something went wrong while loading the page.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center rounded-full border border-brandBorder bg-brandBg-soft px-4 py-2 text-sm font-medium hover:bg-brandBg-strong transition-colors"
                >
                    Retry
                </button>

                <Link
                    href="/"
                    className="inline-flex items-center rounded-full border border-brandBorder bg-white px-4 py-2 text-sm font-medium hover:bg-brandBg-soft transition-colors"
                >
                    Go home
                </Link>
            </div>
        </main>
    );
}
